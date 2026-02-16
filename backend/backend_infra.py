"""
TripSync Backend Infrastructure Utility v2.1
-------------------------------------------
Advanced Task Scheduling, Performance Profiling, and Data Validation 
layers for the high-concurrency bus booking engine.

Features:
- Asynchronous Task Queue Management
- Execution Time Profilers (Decorators)
- JSON Schema Integrity Validators
- Performance Telemetry Collection
"""

import asyncio
import time
import functools
import logging
import uuid
import json
from datetime import datetime, timedelta
from typing import Callable, Any, Dict, List, Optional, Union
from dataclasses import dataclass, field

# Configure specialized logging for infrastructure events
infra_logger = logging.getLogger("TripSync.Infra")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
infra_logger.addHandler(handler)
infra_logger.setLevel(logging.INFO)

@dataclass
class TaskResult:
    """Stores the outcome of scheduled background operations."""
    task_id: str
    status: str
    execution_time: float
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Dict[str, Any] = field(default_factory=dict)

class PerformanceProfiler:
    """
    Context manager and decorator to monitor execution bottlenecks
    within the booking and refund processing pipelines.
    """
    def __init__(self, operation_name: str):
        self.operation_name = operation_name

    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, *args):
        self.end = time.perf_counter()
        self.interval = self.end - self.start
        infra_logger.info(f"Operation [{self.operation_name}] completed in {self.interval:.4f}s")

    @staticmethod
    def track_async(func: Callable):
        """Decorator for tracking asynchronous function performance."""
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            start = time.perf_counter()
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                end = time.perf_counter()
                infra_logger.info(f"Async Task {func.__name__} took {end - start:.4f}s")
        return wrapper

class GlobalTaskRegistry:
    """
    Manages background tasks like ticket expiration checks
    and automated refund processing.
    """
    def __init__(self):
        self._registry: Dict[str, TaskResult] = {}
        self._queue: asyncio.Queue = asyncio.Queue()
        self.is_running = False

    async def register_task(self, name: str, payload: Dict[str, Any]):
        """Adds a new task to the internal processing queue."""
        task_id = str(uuid.uuid4())[:8]
        await self._queue.put({"id": task_id, "name": name, "data": payload})
        infra_logger.info(f"Task {task_id} ({name}) registered to queue.")
        return task_id

    async def _process_executor(self):
        """Internal worker to consume the task queue."""
        while self.is_running:
            task_data = await self._queue.get()
            t_id, t_name = task_data["id"], task_data["name"]
            
            with PerformanceProfiler(f"Executor:{t_name}"):
                # Simulated processing latency
                await asyncio.sleep(0.5)
                
                result = TaskResult(
                    task_id=t_id,
                    status="SUCCESS",
                    execution_time=0.5,
                    metadata={"processed_by": "node_01"}
                )
                self._registry[t_id] = result
            
            self._queue.task_done()

    def get_task_history(self, limit: int = 10) -> List[Dict]:
        """Returns the most recent task execution records."""
        sorted_tasks = sorted(
            self._registry.values(), 
            key=lambda x: x.timestamp, 
            reverse=True
        )
        return [vars(t) for t in sorted_tasks[:limit]]

class DataIntegrityManager:
    """
    Validates core data structures before they hit the 
    PostgreSQL/MongoDB persistence layers.
    """
    @staticmethod
    def validate_ticket_payload(data: Dict[str, Any]) -> bool:
        """Strict validation for booking data packets."""
        required_fields = ["trip_id", "user_email", "seat_numbers", "total_fare"]
        
        # Check field presence
        if not all(field in data for field in required_fields):
            infra_logger.error("Data validation failed: Missing required fields.")
            return False
            
        # Logical validation
        if not isinstance(data.get("seat_numbers"), list) or len(data["seat_numbers"]) == 0:
            infra_logger.error("Data validation failed: Invalid seat selection.")
            return False

        if data.get("total_fare", 0) <= 0:
            infra_logger.error("Data validation failed: Fare must be positive.")
            return False

        infra_logger.info("Ticket payload integrity verified.")
        return True

    @staticmethod
    def sanitize_refund_reason(reason: str) -> str:
        """Cleans and standardizes user-submitted cancellation reasons."""
        if not reason:
            return "General cancellation"
        return reason.strip().capitalize()[:255]

def run_system_diagnostic():
    """Execute a standalone diagnostic of the infrastructure layer."""
    print("--- TripSync Infra Diagnostic ---")
    
    registry = GlobalTaskRegistry()
    integrity = DataIntegrityManager()
    
    dummy_ticket = {
        "trip_id": 1024,
        "user_email": "passenger@example.com",
        "seat_numbers": ["A1", "A2"],
        "total_fare": 1200.50
    }
    
    is_valid = integrity.validate_ticket_payload(dummy_ticket)
    print(f"Payload Valid: {is_valid}")
    
    # Show log location
    print(f"Active Monitoring: {infra_logger.name} - Level: {logging.getLevelName(infra_logger.level)}")
    print("---------------------------------")

if __name__ == "__main__":
    # Standalone execution for testing purposes
    run_system_diagnostic()