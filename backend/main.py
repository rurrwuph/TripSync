import os
import json
import pathlib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from scraper import scrape_shohoz
from dotenv import load_dotenv
from groq import Groq

# Robust env loading
current_dir = pathlib.Path(__file__).parent.resolve()
env_path = current_dir.parent / "src" / "stores" / "TripSync.env"

print(f"DEBUG: Loading env from {env_path}")
load_dotenv(env_path)

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("CRITICAL: GROQ_API_KEY not found in env.")

app = FastAPI()

# Enable CORS
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq Client
client = Groq(
    api_key=api_key,
)

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    action: Optional[str] = None
    data: Optional[dict] = None

SYSTEM_PROMPT = f"""
You are a smart travel assistant for 'TripSync', a bus ticketing platform in Bangladesh.
Your goal is to help users navigate the app and find bus trips.

You MUST always reply in valid JSON format with this structure:
{{
  "response": "Your friendly text reply to the user.",
  "action": "navigate:/route" OR "search_bus" OR null,
  "params": {{ "origin": "City", "destination": "City", "date": "YYYY-MM-DD" }} (Only if action is search_bus)
}}

Available Routes:
- /: Home
- /explore: Trip Search Page
- /login: Login Page
- /contact: Contact Page

Rules:
1. If the user wants to search for buses (e.g., "Dhaka to Ctg"), set action to "search_bus" and extract params. 
   - Default date to {datetime.now().strftime("%Y-%m-%d")} if not specified.
2. If the user wants to go to a page, use "navigate:/route".
3. Be helpful and concise.
4. Output ONLY JSON. Do not output any markdown formatting like ```json.
"""

# In-memory storage for conversation history
# This list is cleared whenever the backend process stops/restarts.
chat_history = []

@app.get("/")
def read_root():
    return {"status": "TripSync AI Backend Running (Groq Llama 3) with Memory"}

@app.delete("/chat/history")
def clear_history():
    global chat_history
    chat_history = []
    return {"status": "History cleared"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    user_message = request.message
    
    # 1. Append User Message to History
    chat_history.append({"role": "user", "content": user_message})
    
    # 2. Limit History Size (Optional: Keep last 20 messages to fit token limits)
    if len(chat_history) > 20:
        chat_history.pop(0)

    try:
        # 3. Construct the full message chain: System Prompt + History
        messages_payload = [
            {"role": "system", "content": SYSTEM_PROMPT}
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
        print(f"DEBUG AI RAW: {ai_content}")
        
        parsed_ai = json.loads(ai_content)
        
        # 4. Append AI Response to History (as text content for context)
        # Note: We store the 'response' text, not the full JSON, to keep context clean for the AI
        ai_reply_text = parsed_ai.get("response", "")
        if ai_reply_text:
             chat_history.append({"role": "assistant", "content": ai_reply_text})
        
        reply = parsed_ai.get("response", "I'm not sure.")
        action = parsed_ai.get("action")
        params = parsed_ai.get("params", {})
        data = None
        
        # Handle Server-Side Actions
        if action == "search_bus":
            origin = params.get("origin")
            destination = params.get("destination")
            date = params.get("date")
            
            if origin and destination:
                reply = f"Searching for buses from {origin} to {destination}..."
                # Run scraper
                trips = scrape_shohoz(origin, destination, date)
                if trips:
                    data = {"trips": trips}
                    reply = f"Found {len(trips)} buses for you!"
                    # Update history with success message so AI knows it found trips
                    chat_history.append({"role": "system", "content": f"System: Found {len(trips)} buses."})
                else:
                    reply = f"Sorry, I couldn't find any buses from {origin} to {destination}."
                    chat_history.append({"role": "system", "content": "System: No buses found."})
            else:
                 reply = "I need both origin and destination to search."
                 action = None

        return ChatResponse(reply=reply, action=action, data=data)

    except Exception as e:
        print(f"Error calling AI: {e}")
        return ChatResponse(reply="Sorry, I'm having trouble thinking right now.", action=None)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
