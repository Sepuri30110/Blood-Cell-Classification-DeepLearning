# 🩸 Blood Cell Classification Deep Learning

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15%2B-orange.svg)](https://www.tensorflow.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green.svg)](https://www.mongodb.com/)
[![YOLO](https://img.shields.io/badge/YOLO-v8-red.svg)](https://github.com/ultralytics/ultralytics)

🔗 **Repository**: https://github.com/Sepuri30110/Blood-Cell-Classification-DeepLearning

Full-stack blood cell classification system using MERN, FastAPI, TensorFlow, and YOLO for automated microscopic image analysis with classification, detection, and counting capabilities.

------------------------------------------------------------------------

## 🚀 Project Overview

Blood Cell Classification Deep Learning is a comprehensive AI-powered medical imaging platform designed for automated analysis of microscopic blood cell images using advanced deep learning architectures.

The platform allows users to:

-   **Classification**: Select from 6 deep learning models (ResNet50, DenseNet121, MobileNetV2, EfficientNetB0, CNN, ViT) to classify blood cell types
-   **Detection**: Detect and localize blood cells using YOLOv8 with optional label visibility control
-   **Cell Counting**: Accurately count WBCs and RBCs in microscopic images
-   **Preprocessing**: Automatic image preprocessing for classification models
-   **History Tracking**: View complete prediction history with results
-   **Dashboard Analytics**: Real-time statistics on model usage and predictions
-   **Logging System**: Unique log files per request for debugging and monitoring

This project demonstrates production-ready AI deployment using microservice architecture with robust error handling and user experience optimization.

### ✨ Highlights

🤖 **6 Deep Learning Models** - ResNet50, DenseNet121, MobileNetV2, EfficientNetB0, CNN, Vision Transformer  
🎯 **Multi-Task Analysis** - Classification, Detection, and Cell Counting in one platform  
🔍 **YOLOv8 Detection** - Real-time object detection with configurable label visibility  
📊 **Analytics Dashboard** - Real-time statistics and prediction history  
🔐 **Secure Authentication** - JWT-based user authentication and authorization  
📝 **Request Logging** - Unique log files for each prediction request  
⚡ **Microservice Architecture** - Separate frontend, backend, and DL services  
🎨 **Modern UI/UX** - React-based responsive interface with toast notifications  
🚀 **Automated Setup** - One-command installation and startup scripts  
🐍 **Virtual Environment** - Isolated Python environment for dependency management

------------------------------------------------------------------------

## 🔬 Deep Learning Models

### Classification Models (6 Architectures)

The system supports multiple state-of-the-art architectures for blood cell classification:

1. **ResNet50** - Deep residual network with skip connections (95.2% accuracy)
2. **DenseNet121** - Dense connections for efficient feature reuse (93.8% accuracy)
3. **MobileNetV2** - Lightweight model optimized for speed (91.5% accuracy)
4. **EfficientNetB0** - Balanced efficiency and accuracy
5. **CNN** - Custom convolutional neural network baseline
6. **Vision Transformer (ViT)** - Transformer-based architecture with self-attention (92.7% accuracy)

**Cell Types Classified**: Basophil, Eosinophil, Lymphocyte, Monocyte, Neutrophil

### Detection & Counting

-   **YOLOv8** - Real-time object detection for identifying and localizing blood cells
-   **WBC/RBC Counter** - Specialized model for accurate cell counting using YOLO architecture
-   **Label Control** - Option to show/hide cell type labels on detection results
-   **Automatic Preprocessing** - Classification models use preprocessing; detection models work directly

Each model performs inference independently with automatic preprocessing, allowing performance benchmarking and comparative analysis.

------------------------------------------------------------------------

## 🏗 System Architecture

    User (Browser)
            ↓
    React Frontend (Port 9000)
            ↓
    Node.js / Express Backend (Port 9001)
            ↓
    FastAPI DL Microservice (Port 8000)
            ↓
    ┌─────────────┴─────────────┐
    ↓                           ↓
    TensorFlow Models           YOLO Models
    (Classification)            (Detection/Count)
            ↓
    MongoDB (Users & History)

**Key Components:**
- **Frontend**: React application with Vite, real-time predictions, error handling with toasts
- **Backend**: Express.js API with JWT authentication, model mapping, prediction routing
- **DL Service**: FastAPI server with model loader, preprocessing pipeline, unique logging per request
- **Database**: MongoDB for user management and prediction history storage

This architecture follows a clean microservice-based design, separating application logic from AI inference with comprehensive logging and error handling.

------------------------------------------------------------------------

## 🌐 Full-Stack Features

### 🔐 Authentication

-   JWT-based authentication with httpOnly cookies
-   Secure login & registration
-   Protected routes with middleware validation
-   User session management

### 📊 Dashboard

-   Total predictions count with real-time updates
-   Model usage statistics and distribution
-   Class distribution tracking across predictions
-   User-specific prediction history with pagination
-   Performance metrics for each model

### 🎯 Prediction System

-   **Multi-task Prediction**: Classification, Detection, and Counting in one request
-   **Model Selection**: Choose from 6 classification models
-   **Label Control**: Toggle visibility of cell type labels on detection results
-   **Image Preview**: Real-time preview before prediction
-   **Result Caching**: Cache predictions for improved performance
-   **Error Handling**: Comprehensive error messages with toast notifications

### 📁 Data Management

-   Base64 image uploads with size validation
-   MongoDB storage for predictions and metadata
-   Prediction logging with unique request IDs
-   User-based history tracking and filtering
-   Image caching for faster retrieval

### 🔧 System Features

-   **Logging System**: Unique log file per request with timestamp and UUID
-   **Log Management APIs**: List, retrieve, and clear logs
-   **Preprocessing Pipeline**: Automatic image preprocessing for classification models
-   **Custom Keras Layers**: Support for Vision Transformer custom layers (Patches, PatchEncoder)
-   **Legacy Keras Compatibility**: TF_USE_LEGACY_KERAS=1 for backward compatibility
-   **Automated Setup Scripts**: `setup.py` for dependency installation, `startup.py` for launching services
-   **Virtual Environment**: Isolated Python environment for DL service to prevent conflicts

------------------------------------------------------------------------

## 🚀 Automation Scripts

### setup.py - Dependency Installation
Automatically installs all dependencies for the project:
- Runs `npm install` in frontend directory
- Runs `npm install` in backend directory
- Creates Python virtual environment in DL directory
- Installs Python packages from `requirements.txt` in the virtual environment
- Provides detailed progress and error reporting

**Usage:**
```bash
python setup.py
```

### startup.py - Service Launcher
Starts frontend and backend services concurrently:
- Launches frontend (React/Vite) on port 9000
- Launches backend (Node.js/Express) on port 9001
- Displays labeled output from all services
- Gracefully handles Ctrl+C to stop all services
- Cross-platform support (Windows, Linux, Mac)

**Usage:**
```bash
python startup.py
```

**Note**: Press `Ctrl+C` to stop all running services gracefully.

------------------------------------------------------------------------

## 📁 Project Structure

```
Blood-Cell-Classification-DeepLearning/
│
├── frontend/                    # React application (Vite)
│   ├── src/
│   │   ├── Pages/
│   │   │   ├── Dashboard/      # Main dashboard with predict, history, models pages
│   │   │   ├── Authenticate/   # Login & registration
│   │   │   └── Home/           # Landing page
│   │   ├── helpers/            # API helpers, cache, toast utilities
│   │   └── PrivateRoutes/      # Route protection
│   └── package.json
│
├── backend/                     # Node.js + Express API
│   ├── controllers/            # Business logic (auth, prediction, history, uploads)
│   ├── models/                 # MongoDB schemas (User, Upload)
│   ├── routes/                 # API route definitions
│   ├── middlewares/            # JWT validation
│   ├── data/                   # Model metadata (models.json)
│   └── index.js                # Express server entry point
│
├── DL/                         # FastAPI deep learning service
│   ├── main.py                 # FastAPI server with prediction endpoints
│   ├── model_loader.py         # Loads TensorFlow & YOLO models with custom layers
│   ├── interface.py            # Prediction & preprocessing functions
│   ├── logger_config.py        # Request-level logging system
│   ├── models/                 # Trained model files (.h5, .pt)
│   │   ├── best_resnet50.h5
│   │   ├── best_densenet121.h5
│   │   ├── best_mobilenet.h5
│   │   ├── best_EfficientNetB0.h5
│   │   ├── best_CNN.h5
│   │   ├── best_vit.h5
│   │   ├── yolov8n.pt          # Detection model
│   │   └── wbc_rbc_best.pt     # Counting model
│   ├── logs/                   # Per-request log files
│   └── requirements.txt        # Python dependencies
│
├── setup.py                     # Automated dependency installation script
├── startup.py                   # Automated service startup script
├── .gitignore
└── README.md
```

------------------------------------------------------------------------

## ⚙️ Tech Stack

### Frontend

-   **React 18** - Modern UI library with hooks
-   **Vite** - Fast build tool and dev server
-   **React Router** - Client-side routing
-   **Axios** - HTTP client for API calls
-   **CSS3** - Custom styling with CSS variables

### Backend

-   **Node.js** - JavaScript runtime
-   **Express.js** - Web application framework
-   **MongoDB** - NoSQL database for user and prediction data
-   **Mongoose** - MongoDB ODM
-   **JWT** - Secure authentication tokens
-   **bcrypt** - Password hashing
-   **dotenv** - Environment variable management

### AI / ML Service

-   **Python 3.8+** - Programming language
-   **FastAPI** - High-performance async web framework
-   **TensorFlow 2.15+** - Deep learning framework with legacy Keras support
-   **Ultralytics YOLO v8** - Object detection and counting
-   **OpenCV (cv2)** - Image processing
-   **NumPy** - Numerical computations
-   **Pillow (PIL)** - Image manipulation
-   **Uvicorn** - ASGI server for FastAPI

### DevOps & Tools

-   **Git** - Version control
-   **npm** - Frontend and backend package manager
-   **pip** - Python package manager
-   **Environment Variables** - Configuration management
-   **Logging** - Request-level logging with unique file IDs

------------------------------------------------------------------------

## 🧪 Running the Project Locally

### Prerequisites

-   **Node.js** (v14+)
-   **Python** (v3.8+)
-   **MongoDB** (local or MongoDB Atlas)
-   **Git**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Sepuri30110/Blood-Cell-Classification-DeepLearning.git
cd Blood-Cell-Classification-DeepLearning
```

------------------------------------------------------------------------

### 2️⃣ Configure Environment Variables

**Backend (.env)**
Create `backend/.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
DL_API_URL=http://localhost:8000
PORT=9001
```

**Frontend (.env)**
Create `frontend/.env` file:
```env
VITE_SERVER_URL=http://localhost
VITE_PORT=9001
VITE_ENDPOINT=api
```

------------------------------------------------------------------------

### 3️⃣ Quick Start (Automated Setup)

**Option A: Using Automated Scripts (Recommended)**

```bash
# Step 1: Install all dependencies (first time only)
python setup.py

# Step 2: Start all services (Frontend + Backend)
python startup.py
```

That's it! The scripts will automatically:
- ✅ Install npm packages for frontend and backend
- ✅ Create Python virtual environment for DL service
- ✅ Install Python dependencies in the virtual environment
- ✅ Start frontend (Port 9000) and backend (Port 9001) concurrently
- ✅ Display output from all services with labeled prefixes

**Note**: The DL service (Port 8000) must be started separately if needed:
```bash
# Activate virtual environment
# Windows:
& "DL\.venv\Scripts\Activate.ps1"
# Linux/Mac:
source DL/.venv/bin/activate

# Set environment variable for legacy Keras
# Windows PowerShell:
$env:TF_USE_LEGACY_KERAS='1'
# Linux/Mac:
export TF_USE_LEGACY_KERAS=1

# Start DL service
cd DL
python main.py
```

------------------------------------------------------------------------

### 4️⃣ Manual Setup (Alternative Method)

**Frontend (Port 9000)**
```bash
cd frontend
npm install
npm run dev
```

**Backend (Port 9001)**
```bash
cd backend
npm install
npm start
```

**DL Service (Port 8000) - Optional**
```bash
cd DL
python -m venv .venv
# Activate venv (see above)
pip install -r requirements.txt
$env:TF_USE_LEGACY_KERAS='1'  # Windows
python main.py
```

------------------------------------------------------------------------

### 5️⃣ Access the Application

Open your browser and navigate to:
```
http://localhost:9000
```

**Test Credentials** (after seeding):
- Use the registration page to create a new account
- Or seed the database with: `node backend/seed.js`

------------------------------------------------------------------------

## � Troubleshooting

### Common Issues

**1. ViT Model Loading Error: "Unknown layer: 'Patches'"**
- **Solution**: Ensure `TF_USE_LEGACY_KERAS=1` environment variable is set before starting the DL service
- The custom layers (Patches, PatchEncoder) are defined in `DL/model_loader.py`

**2. FastAPI Module Not Found**
- **Solution**: Install dependencies: `pip install -r DL/requirements.txt`

**3. MongoDB Connection Error**
- **Solution**: Ensure MongoDB is running locally or update `MONGODB_URI` in backend `.env`

**4. CORS Errors**
- **Solution**: Check that frontend, backend, and DL service are running on correct ports (9000, 9001, 8000)

**5. Prediction Button Stuck on "Analyzing..."**
- **Solution**: Check backend console for errors, ensure DL service is running, verify network connectivity

**6. Image Upload Fails**
- **Solution**: Check file size (max 5MB), ensure valid image format (PNG, JPG, JPEG)

### Debug Mode

Enable detailed logging:
- **DL Service**: Check `DL/logs/` folder for request-specific log files
- **Backend**: Console logs show API requests and DL service responses
- **Frontend**: Browser console shows network requests and errors

------------------------------------------------------------------------

## �🔮 Future Enhancements

-   **Ensemble Model Voting** - Combine predictions from multiple models for improved accuracy
-   **Grad-CAM Visualization** - Explainable AI with attention heatmaps
-   **Model Performance Comparison** - Side-by-side accuracy and speed benchmarking
-   **Real-time Metrics Dashboard** - Live monitoring of model performance and system health
-   **Batch Processing** - Upload and analyze multiple images simultaneously
-   **Export Functionality** - Download prediction results as PDF/CSV reports
-   **Docker Deployment** - Containerized deployment for easy scaling
-   **CI/CD Pipeline** - Automated testing and deployment (GitHub Actions)
-   **Cloud Deployment** - AWS/Azure/GCP integration with auto-scaling
-   **Admin Panel** - System-wide analytics and user management
-   **API Documentation** - Interactive Swagger/OpenAPI documentation
-   **Mobile App** - React Native application for mobile access
-   **Model Versioning** - Track and switch between different model versions

------------------------------------------------------------------------

## 🎯 Use Cases

-   **Medical AI Research** - Experimentation with different deep learning architectures
-   **Academic Projects** - Final year projects, research papers, thesis work
-   **Model Benchmarking** - Compare performance across CNN, ResNet, DenseNet, ViT
-   **Full-Stack Portfolio** - Demonstrate end-to-end AI system development
-   **Healthcare Applications** - Automated blood cell analysis and classification
-   **Educational Tool** - Learn microservice architecture and ML deployment
-   **Production Template** - Starting point for similar medical imaging projects

------------------------------------------------------------------------

## � API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

### Predictions
- `POST /api/predict` - Predict with classification, detection, or count
- `GET /api/predict/models` - Get available models list

### History
- `GET /api/history` - Get user prediction history (paginated)
- `GET /api/history/:id` - Get specific prediction details
- `DELETE /api/history/:id` - Delete prediction record

### Uploads
- `GET /api/uploads/stats` - Get upload statistics
- `GET /api/uploads` - Get user uploads (paginated)
- `GET /api/uploads/:id` - Get upload by ID
- `GET /api/uploads/:id/image` - Get upload image data

### DL Service (Internal)
- `POST /predict/classification` - Classification inference
- `POST /predict/detection` - Detection inference
- `POST /predict/count` - Cell counting inference
- `GET /health` - Health check
- `GET /logs` - List all log files
- `GET /logs/{filename}` - Get specific log content
- `DELETE /logs` - Clear all logs

------------------------------------------------------------------------

## 🎨 Key Features Implemented

✅ **Multi-Model Classification** - 6 different architectures (ResNet, DenseNet, MobileNet, EfficientNet, CNN, ViT)  
✅ **Object Detection** - YOLOv8 for cell detection with bounding boxes  
✅ **Cell Counting** - Accurate WBC and RBC counting  
✅ **Preprocessing Pipeline** - Automatic image preprocessing for classification  
✅ **Custom Keras Layers** - Support for Vision Transformer custom layers  
✅ **Label Visibility Control** - Toggle labels on detection results  
✅ **Unique Request Logging** - Individual log files per prediction request  
✅ **Error Handling** - Comprehensive error messages with toast notifications  
✅ **Result Caching** - Frontend caching for improved performance  
✅ **JWT Authentication** - Secure user authentication and authorization  
✅ **Prediction History** - Track and view all past predictions  
✅ **Dashboard Analytics** - Real-time statistics and visualizations  
✅ **Responsive UI** - Clean, modern interface with React  
✅ **Legacy Keras Compatibility** - Support for older TensorFlow models  
✅ **Automated Setup Scripts** - `setup.py` and `startup.py` for quick deployment  
✅ **Virtual Environment Management** - Isolated Python dependencies with auto-creation

------------------------------------------------------------------------

## �👨‍💻 Author

Developed by 
├── Munipalli Abhishek 
├── Sepuri Ram charan
└── BeemReddy Dinesh Reddy

Full-Stack AI Engineering Project
------------------------------------------------------------------------

## 📝 License

This project is developed for educational and research purposes.

------------------------------------------------------------------------

## 🙏 Acknowledgments

- **TensorFlow** - Deep learning framework
- **Ultralytics** - YOLOv8 implementation
- **FastAPI** - Modern Python web framework
- **MongoDB** - Database solution
- **React** - Frontend library

------------------------------------------------------------------------

## 📞 Contact & Support

For questions, issues, or contributions:
- 📧 Open an issue on GitHub
- 🌟 Star the repository if you find it helpful
- 🔗 [Repository Link](https://github.com/Sepuri30110/Blood-Cell-Classification-DeepLearning)

------------------------------------------------------------------------

**⭐ If this project helped you, please give it a star!**