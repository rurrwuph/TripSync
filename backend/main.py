import os
import json
import pathlib
from textwrap import dedent
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from dotenv import load_dotenv
from groq import Groq
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
import app.models.all_models as models
from app.services.scraper_service import scrape_shohoz
from app.services import trip_service
from app.api.deps import get_db
from sqlalchemy.orm import Session

# Import Routers
from app.api.endpoints import users, buses, trips, tickets, refunds, admin
from app.services.user_sync import sync_users_from_json

# Robust env loading
current_dir = pathlib.Path(__file__).parent.resolve()
# Up 1 level: backend -> TripSync-1, then src/stores
env_path = current_dir.parent / "src" / "stores" / "TripSync.env"

# ... (rest of code)



print(f"DEBUG: Loading env from {env_path}")
load_dotenv(env_path)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("CRITICAL: GROQ_API_KEY not found in env.")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq Client
client = Groq(
    api_key=api_key,
)

# --- Chat Models ---
class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    action: Optional[str] = None
    data: Optional[dict] = None
    params: Optional[dict] = None

SYSTEM_PROMPT_TEMPLATE = """
You are a smart travel assistant for 'TripSync', a bus ticketing platform in Bangladesh.
Your goal is to help users navigate the app and find bus trips.

**Current Date & Time:** {current_time}

You MUST always reply in valid JSON format with this structure:
{{
  "response": "Your friendly text reply to the user.",
  "action": "navigate_search" OR "navigate:/route" OR null,
  "params": {{ "origin": "City", "destination": "City", "date": "YYYY-MM-DD" }} (Only if action is navigate_search)
}}

Available Routes:
- /: Home
- /explore: Trip Search Page
- /login: Login Page
- /contact: Contact Page

Rules:
1. **Slot Filling (Crucial)**:
   - If the user asks for a bus but is missing Origin, Destination, or Date, **ASK for the missing details**.
   - Do NOT assume a date. Ask "When do you want to go?" if date is missing.
   - If user says "today", "tomorrow", or "next Friday", calculate the date based on **Current Date & Time**.
   - Do NOT assume origin or destination.
   - Keep conversation going until you have ALL three: Origin, Destination, Date.

2. **Action Trigger**:
   - ONLY when you have Origin, Destination, AND Date, set action to "navigate_search".
   - Return the extracted params in the `params` field.
   - Format date as YYYY-MM-DD.

3. If the user wants to go to a specific page (e.g. login), use "navigate:/route".
4. Be helpful and concise.
5. Output ONLY JSON.
"""

chat_history = []

@app.on_event("startup")
def startup_db_client():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("\n -> Database connected successfully! \n")
        # Create tables if they don't exist (Updated to use all_models)
        Base.metadata.create_all(bind=engine)
        
        # Sync users/admins from JSON
        sync_users_from_json()
    except Exception as e:
        print(f"\n -> CRITICAL: Database connection failed: {e} \n")

@app.get("/")
def read_root():
    return {"status": "TripSync AI Backend Running (Groq Llama 3) with Memory", "db": "Connected"}

@app.delete("/chat/history")
def clear_history():
    global chat_history
    chat_history = []
    return {"status": "History cleared"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    user_message = request.message
    
    chat_history.append({"role": "user", "content": user_message})
    
    if len(chat_history) > 20:
        chat_history.pop(0)

    try:
        current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        dynamic_prompt = SYSTEM_PROMPT_TEMPLATE.format(current_time=current_time_str)

        messages_payload = [
            {"role": "system", "content": dynamic_prompt}
        ] + chat_history

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages_payload,
            temperature=0.5,
            max_tokens=1024,
            top_p=1,
            stream=False,
            response_format={"type": "json_object"}
        )
        
        ai_content = completion.choices[0].message.content
        if not ai_content:
             raise ValueError("Empty response from AI")

        ai_content = ai_content.replace("```json", "").replace("```", "").strip()
        print(f"DEBUG AI RAW: {ai_content}")
        
        parsed_ai = json.loads(ai_content)
        
        ai_reply_text = parsed_ai.get("response", "")
        if ai_reply_text:
             chat_history.append({"role": "assistant", "content": ai_reply_text})
        
        reply = parsed_ai.get("response", "I'm not sure.")
        action = parsed_ai.get("action")
        params = parsed_ai.get("params", {})
        data = None
        
        if action == "search_bus":
            origin = params.get("origin")
            destination = params.get("destination")
            date = params.get("date")
            
            if origin and destination:
                reply = f"Searching for buses from {origin} to {destination}..."
                trips = scrape_shohoz(origin, destination, date)
                for t in trips:
                    t['date'] = date
                
                sort_by = params.get("sort")
                if sort_by == "price_asc":
                    trips.sort(key=lambda x: float(str(x.get("price", "0")).replace(",", "")))
                    reply = f"Found {len(trips)} buses! Here are the cheapest ones."
                elif sort_by == "time_asc":
                    def parse_time(t_str):
                        try:
                            return datetime.strptime(t_str, "%I:%M %p")
                        except:
                            return datetime.max
                    trips.sort(key=lambda x: parse_time(x.get("departure_time", "")))
                    reply = f"Found {len(trips)} buses! Here are the earliest ones."

                if trips:
                    # Enrich with local availability
                    db = next(get_db())
                    trips = trip_service.enrich_trips_with_availability(db, trips)
                    data = {"trips": trips}
                    if not sort_by:
                        reply = f"Found {len(trips)} buses for you!"
                    
                    chat_history.append({"role": "system", "content": f"System: Found {len(trips)} buses."})
                else:
                    reply = f"Sorry, I couldn't find any buses from {origin} to {destination}."
                    chat_history.append({"role": "system", "content": "System: No buses found."})
            else:
                 reply = "I need both origin and destination to search."
                 action = None

        return ChatResponse(reply=reply, action=action, data=data, params=params)

    except Exception as e:
        print(f"Error calling AI: {e}")
        return ChatResponse(reply="Sorry, I'm having trouble thinking right now.", action=None)

class SearchRequest(BaseModel):
    origin: str
    destination: str
    date: str

@app.post("/api/search")
async def search_trips(request: SearchRequest, db: Session = Depends(get_db)):
    try:
        print(f"Searching for: {request.origin} -> {request.destination} on {request.date}")
        trips = scrape_shohoz(request.origin, request.destination, request.date)
        # Stability fix: Inject date into trip objects so they generate consistent IDs
        for t in trips:
            t['date'] = request.date
        enriched_trips = trip_service.enrich_trips_with_availability(db, trips)
        return {"trips": enriched_trips, "count": len(enriched_trips)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include Routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(buses.router, prefix="/buses", tags=["Buses"])
app.include_router(trips.router, prefix="/trips", tags=["Trips"])
app.include_router(tickets.router, prefix="/tickets", tags=["Tickets"])
app.include_router(refunds.router, prefix="/refunds", tags=["Refunds"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

if __name__ == "__main__":
    import uvicorn
    # Updated to main:app since main.py is in root of backend
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
