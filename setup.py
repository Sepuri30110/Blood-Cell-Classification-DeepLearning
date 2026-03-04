"""
Setup script to install dependencies for all services
Installs npm packages for frontend and backend, and pip packages for DL (in venv)
"""
import subprocess
import os
import sys
import platform

def run_command(command, cwd, description):
    """Run a command in the specified directory"""
    print(f"\n{'='*60}")
    print(f"🔧 {description}")
    print(f"{'='*60}")
    print(f"Running: {command}")
    print(f"Directory: {cwd}\n")
    
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            shell=True,
            check=True,
            text=True
        )
        print(f"✅ {description} - SUCCESS")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - FAILED")
        print(f"Error: {e}")
        return False

def setup_dl_venv(dl_dir):
    """Create virtual environment for DL and install packages"""
    venv_path = os.path.join(dl_dir, ".venv")
    
    # Check if venv already exists
    if os.path.exists(venv_path):
        print(f"📦 Virtual environment already exists at: {venv_path}")
    else:
        print(f"\n{'='*60}")
        print(f"🔧 Creating Virtual Environment for DL")
        print(f"{'='*60}")
        print(f"Creating venv at: {venv_path}\n")
        
        try:
            subprocess.run(
                [sys.executable, "-m", "venv", ".venv"],
                cwd=dl_dir,
                check=True
            )
            print(f"✅ Virtual environment created successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to create virtual environment: {e}")
            return False
    
    # Determine the pip path based on OS
    if platform.system() == "Windows":
        pip_path = os.path.join(venv_path, "Scripts", "pip.exe")
        python_path = os.path.join(venv_path, "Scripts", "python.exe")
    else:
        pip_path = os.path.join(venv_path, "bin", "pip")
        python_path = os.path.join(venv_path, "bin", "python")
    
    # Upgrade pip first
    print(f"\n{'='*60}")
    print(f"🔧 Upgrading pip in virtual environment")
    print(f"{'='*60}")
    try:
        subprocess.run(
            [python_path, "-m", "pip", "install", "--upgrade", "pip"],
            cwd=dl_dir,
            check=True
        )
        print(f"✅ pip upgraded successfully")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Warning: Failed to upgrade pip: {e}")
    
    # Install requirements
    requirements_path = os.path.join(dl_dir, "requirements.txt")
    success = run_command(
        f'"{pip_path}" install -r requirements.txt',
        dl_dir,
        "Installing DL Dependencies (Python packages in venv)"
    )
    
    return success

def main():
    # Get the base directory (where this script is located)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("="*60)
    print("Blood Cell Classification - Dependency Setup")
    print("="*60)
    
    # Track success of each installation
    results = []
    
    # Install frontend dependencies
    frontend_dir = os.path.join(base_dir, "frontend")
    success = run_command(
        "npm install",
        frontend_dir,
        "Installing Frontend Dependencies"
    )
    results.append(("Frontend", success))
    
    # Install backend dependencies
    backend_dir = os.path.join(base_dir, "backend")
    success = run_command(
        "npm install",
        backend_dir,
        "Installing Backend Dependencies"
    )
    results.append(("Backend", success))
    
    # Install DL dependencies (in virtual environment)
    dl_dir = os.path.join(base_dir, "DL")
    success = setup_dl_venv(dl_dir)
    results.append(("DL", success))
    
    # Print summary
    print("\n" + "="*60)
    print("Setup Summary")
    print("="*60)
    for service, success in results:
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{service:20} {status}")
    
    # Check if all installations were successful
    all_success = all(success for _, success in results)
    
    if all_success:
        print("\n🎉 All dependencies installed successfully!")
        print("You can now run 'python startup.py' to start all services.")
        return 0
    else:
        print("\n⚠️ Some installations failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
