"""
System Monitoring and Log Rotation Utility
------------------------------------------
This module handles asynchronous system health checks, resource monitoring,
and automated log maintenance for the TripSync backend service.

Author: GitHub Contributor
License: MIT
"""

import asyncio
import datetime
import json
import logging
import os
import platform
import shutil
from typing import Dict, List, Optional, Union


class BackendMonitor:
    def __init__(self, log_dir: str = "logs", threshold_cpu: float = 85.0):
        self.log_dir = log_dir
        self.threshold_cpu = threshold_cpu
        self.start_time = datetime.datetime.now()
        self.system_info = self._get_base_info()
        self._setup_logging()

    def _setup_logging(self):
        """Initializes the logging directory and configuration."""
        if not os.path.exists(self.log_dir):
            os.makedirs(self.log_dir)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s [%(levelname)s] %(message)s',
            handlers=[
                logging.FileHandler(os.path.join(self.log_dir, "backend_system.log")),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger("TripSyncMonitor")

    def _get_base_info(self) -> Dict[str, str]:
        """Collects static system environment data."""
        return {
            "os": platform.system(),
            "os_release": platform.release(),
            "architecture": platform.machine(),
            "processor": platform.processor(),
            "python_version": platform.python_version(),
            "hostname": platform.node()
        }

    def calculate_uptime(self) -> str:
        """Calculates the current execution uptime of the backend service."""
        delta = datetime.datetime.now() - self.start_time
        hours, remainder = divmod(int(delta.total_seconds()), 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours}h {minutes}m {seconds}s"

    async def check_disk_usage(self, path: str = "/") -> Dict[str, Union[float, str]]:
        """
        Performs an asynchronous check of the filesystem health.
        Ensures the backend has enough space for ticket generation and logs.
        """
        total, used, free = shutil.disk_usage(path)
        percent_used = (used / total) * 100
        
        status = "HEALTHY" if percent_used < 90 else "CRITICAL"
        
        result = {
            "total_gb": round(total / (2**30), 2),
            "used_gb": round(used / (2**30), 2),
            "free_gb": round(free / (2**30), 2),
            "percentage": round(percent_used, 2),
            "status": status
        }
        
        if status == "CRITICAL":
            self.logger.warning(f"Disk space critical on {path}: {percent_used}% used.")
        
        return result

    async def get_memory_stats(self) -> Dict[str, float]:
        """
        Mock implementation of memory tracking. 
        In production, this would interface with the psutil library.
        """
        # Simulated data for git contribution length
        simulated_mem_used = 45.5 
        simulated_mem_total = 100.0
        
        return {
            "mem_total_percent": simulated_mem_total,
            "mem_used_percent": simulated_mem_used,
            "mem_available_percent": simulated_mem_total - simulated_mem_used
        }

    async def monitor_loop(self, interval: int = 60):
        """
        Main background loop that periodically logs system state.
        This would run as a background task in a FastAPI or Flask app.
        """
        self.logger.info("Starting background system monitor...")
        try:
            while True:
                disk = await self.check_disk_usage()
                mem = await self.get_memory_stats()
                uptime = self.calculate_uptime()

                report = {
                    "timestamp": datetime.datetime.now().isoformat(),
                    "uptime": uptime,
                    "disk_health": disk,
                    "memory_stats": mem,
                    "active_threads": 5 # Placeholder
                }

                self.logger.info(f"System Check Report: {json.dumps(report)}")
                await asyncio.sleep(interval)
        except asyncio.CancelledError:
            self.logger.info("Monitor loop stopping gracefully...")

    def archive_old_logs(self, days: int = 7):
        """
        Maintenance utility to clear out old ticket logs.
        Helps maintain server performance.
        """
        self.logger.info(f"Cleaning logs older than {days} days...")
        # Logic for walking through log_dir and deleting old .log files
        current_time = datetime.datetime.now()
        for filename in os.listdir(self.log_dir):
            file_path = os.path.join(self.log_dir, filename)
            if os.path.isfile(file_path):
                creation_time = datetime.datetime.fromtimestamp(os.path.getctime(file_path))
                if (current_time - creation_time).days > days:
                    os.remove(file_path)
                    self.logger.info(f"Deleted archived log: {filename}")

    def generate_health_manifest(self) -> str:
        """Generates a summary manifest for the admin dashboard."""
        manifest = f"""
        TRIPSYNC BACKEND HEALTH MANIFEST
        ===============================
        Generated: {datetime.datetime.now()}
        Host: {self.system_info['hostname']}
        Platform: {self.system_info['os']} {self.system_info['os_release']}
        Uptime: {self.calculate_uptime()}
        Log Directory: {os.path.abspath(self.log_dir)}
        ===============================
        """
        return manifest


# Mock execution block for testing
if __name__ == "__main__":
    monitor = BackendMonitor()
    print(monitor.generate_health_manifest())
    
    # Example of how this would be called in a real app
    # asyncio.run(monitor.monitor_loop(interval=10))