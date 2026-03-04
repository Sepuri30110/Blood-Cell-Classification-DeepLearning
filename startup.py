"""
Startup script to launch all services concurrently
Starts frontend and backend services
"""
import subprocess
import os
import sys
import signal
import time
from threading import Thread

# Global list to track processes
processes = []

def signal_handler(sig, frame):
    """Handle Ctrl+C to gracefully shutdown all processes"""
    print("\n\n🛑 Shutting down all services...")
    for process, name in processes:
        print(f"   Stopping {name}...")
        process.terminate()
    
    # Wait a bit for graceful shutdown
    time.sleep(2)
    
    # Force kill if still running
    for process, name in processes:
        if process.poll() is None:
            print(f"   Force killing {name}...")
            process.kill()
    
    print("✅ All services stopped.")
    sys.exit(0)

def run_service(command, cwd, name, color_code):
    """Run a service and stream its output"""
    print(f"🚀 Starting {name}...")
    
    try:
        process = subprocess.Popen(
            command,
            cwd=cwd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        processes.append((process, name))
        
        # Stream output with service name prefix
        for line in iter(process.stdout.readline, ''):
            if line:
                print(f"[{name}] {line.rstrip()}")
        
        process.wait()
        
        if process.returncode != 0:
            print(f"❌ {name} exited with code {process.returncode}")
        else:
            print(f"✅ {name} stopped successfully")
            
    except Exception as e:
        print(f"❌ Error running {name}: {e}")

def main():
    # Register signal handler for Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    
    # Get the base directory (where this script is located)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("="*60)
    print("Blood Cell Classification - Starting Services")
    print("="*60)
    print("Press Ctrl+C to stop all services\n")
    
    # Define services
    services = [
        {
            "name": "FRONTEND",
            "command": "npm run dev",
            "cwd": os.path.join(base_dir, "frontend"),
            "color": "\033[94m"  # Blue
        },
        {
            "name": "BACKEND",
            "command": "npm start",
            "cwd": os.path.join(base_dir, "backend"),
            "color": "\033[92m"  # Green
        }
    ]
    
    # Start all services in separate threads
    threads = []
    for service in services:
        thread = Thread(
            target=run_service,
            args=(service["command"], service["cwd"], service["name"], service["color"]),
            daemon=True
        )
        thread.start()
        threads.append(thread)
        time.sleep(1)  # Stagger startup slightly
    
    print("\n" + "="*60)
    print("✅ All services started!")
    print("="*60)
    print("Monitor the output below. Press Ctrl+C to stop all services.\n")
    
    # Wait for all threads
    try:
        for thread in threads:
            thread.join()
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)

if __name__ == "__main__":
    main()
