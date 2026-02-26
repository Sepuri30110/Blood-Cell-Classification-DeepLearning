"""
FastAPI Server for Blood Cell Analysis
Provides endpoints for classification, detection, and cell counting
"""
import os
# Force TensorFlow to use legacy Keras 2.x for compatibility with older models
os.environ['TF_USE_LEGACY_KERAS'] = '1'

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict
from contextlib import asynccontextmanager
import uvicorn
import base64
import io
from PIL import Image

from model_loader import ModelLoader
from interface import BloodCellPredictor
from logger_config import logger_manager

# Global variables for models and predictor
model_loader = None
predictor = None


# Pydantic models for request/response
class PredictRequest(BaseModel):
    image: str  # Base64 encoded image
    task: str  # 'classification', 'detection', or 'count'
    model_id: Optional[str] = 'mobilenet-v2'  # For classification task
    conf: Optional[float] = 0.25  # Confidence threshold for detection tasks


# ==================== LIFESPAN HANDLER ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup and cleanup on shutdown"""
    global model_loader, predictor
    
    # Startup
    print("=" * 60)
    print("Starting Blood Cell Analysis API...")
    print("=" * 60)
    
    try:
        model_loader = ModelLoader(models_dir="models")
        model_loader.load_all_models()
        predictor = BloodCellPredictor(model_loader)
        print("✓ API ready to serve predictions!")
        print("=" * 60)
    except Exception as e:
        print(f"✗ Error during startup: {str(e)}")
        print("⚠ API started but models may not be loaded properly")
        print("=" * 60)
    
    yield
    
    # Shutdown
    print("\nShutting down Blood Cell Analysis API...")


# Initialize FastAPI app with lifespan handler
app = FastAPI(
    title="Blood Cell Analysis API",
    description="Deep Learning API for blood cell classification, detection, and counting",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== ENDPOINTS ====================

@app.get("/models")
async def get_available_models():
    """
    Get list of available models
    Returns:
        Available classification, detection, and counting models
    """
    if model_loader is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    return JSONResponse(content={
        "success": True,
        "models": {
            "classification": model_loader.get_available_classification_models(),
            "detection": model_loader.detection_model is not None,
            "count": model_loader.detection_count_model is not None
        }
    })


@app.get("/logs")
async def list_logs():
    """
    List all available log files
    Returns:
        List of log files with metadata
    """
    import os
    from datetime import datetime
    
    logs_dir = "logs"
    log_files = []
    
    if os.path.exists(logs_dir):
        for filename in os.listdir(logs_dir):
            if filename.endswith('.log'):
                filepath = os.path.join(logs_dir, filename)
                stat = os.stat(filepath)
                
                log_files.append({
                    "filename": filename,
                    "size": stat.st_size,
                    "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
                })
    
    # Sort by creation time (newest first)
    log_files.sort(key=lambda x: x['created'], reverse=True)
    
    return JSONResponse(content={
        "success": True,
        "total_logs": len(log_files),
        "logs": log_files
    })


@app.get("/logs/{filename}")
async def get_log_content(filename: str):
    """
    Get content of a specific log file
    Args:
        filename: Name of the log file
    Returns:
        Log file content
    """
    import os
    
    logs_dir = "logs"
    filepath = os.path.join(logs_dir, filename)
    
    # Security check - prevent directory traversal
    if not filename.endswith('.log') or '/' in filename or '\\\\' in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Log file not found")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return JSONResponse(content={
            "success": True,
            "filename": filename,
            "content": content
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading log file: {str(e)}")


@app.delete("/logs/cleanup")
async def cleanup_old_logs(days: int = 7):
    """
    Clean up log files older than specified days
    Args:
        days: Number of days to keep logs (default: 7)
    Returns:
        Number of deleted log files
    """
    try:
        deleted_count = logger_manager.cleanup_old_logs(days)
        return JSONResponse(content={
            "success": True,
            "message": f"Cleaned up {deleted_count} log file(s) older than {days} days",
            "deleted_count": deleted_count
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning up logs: {str(e)}")


@app.post("/predict/classification")
async def predict_classification(
    image: UploadFile = File(...),
    model_id: str = Form('mobilenet-v2')
):
    """
    Classify blood cell type
    Args:
        image: Uploaded image file
        model_id: Classification model to use (resnet-50, densenet-121, mobilenet-v2, efficientnet-b0, cnn)
    Returns:
        Prediction results with cell type and confidence
    """
    # Create unique logger for this request
    logger, log_filename = logger_manager.create_logger('classification', model_id)
    
    logger.info(f"Endpoint: POST /predict/classification")
    logger.info(f"Model ID: {model_id}")
    logger.info(f"Image filename: {image.filename}")
    logger.info(f"Image content type: {image.content_type}")
    
    if predictor is None:
        logger.error("Predictor not loaded!")
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    try:
        # Read image
        logger.info("Step 1: Reading image bytes...")
        image_bytes = await image.read()
        logger.info(f"Step 1: Read {len(image_bytes)} bytes")
        
        logger.info("Step 2: Preprocessing upload...")
        pil_image = predictor.preprocess_upload(image_bytes, logger=logger)
        
        # Predict
        logger.info("Step 3: Running classification prediction...")
        result = predictor.predict_classification(pil_image, model_id=model_id, logger=logger)
        
        logger.info("SUCCESS: Classification complete!")
        logger.info(f"Result: {result['predicted_class']} ({result['confidence']:.2%})")
        logger.info(f"Log saved to: logs/{log_filename}")
        logger.info("="*60)
        
        # Add log filename to response
        result['log_file'] = log_filename
        
        return JSONResponse(content={
            "success": True,
            "task": "classification",
            "result": result
        })
    
    except Exception as e:
        logger.error(f"Classification failed: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        logger.info("="*60)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/predict/detection")
async def predict_detection(
    image: UploadFile = File(...),
    conf: float = Form(0.25),
    show_labels: bool = Form(True)
):
    """
    Detect blood cells with bounding boxes
    Args:
        image: Uploaded image file
        conf: Confidence threshold
        show_labels: Whether to show class labels and confidence on bounding boxes (default: True)
    Returns:
        Detection results with bounding boxes and annotated image
    """
    # Create unique logger for this request
    logger, log_filename = logger_manager.create_logger('detection')
    
    logger.info(f"Endpoint: POST /predict/detection")
    logger.info(f"Confidence threshold: {conf}")
    logger.info(f"Show labels: {show_labels}")
    logger.info(f"Image filename: {image.filename}")
    logger.info(f"Image content type: {image.content_type}")
    
    if predictor is None:
        logger.error("Predictor not loaded!")
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    try:
        # Read image
        logger.info("Step 1: Reading image bytes...")
        image_bytes = await image.read()
        logger.info(f"Step 1: Read {len(image_bytes)} bytes")
        
        logger.info("Step 2: Preprocessing upload...")
        pil_image = predictor.preprocess_upload(image_bytes, logger=logger)
        
        # Predict
        logger.info("Step 3: Running detection prediction...")
        result = predictor.predict_detection(pil_image, conf=conf, show_labels=show_labels, logger=logger)
        
        # Convert annotated image to base64
        logger.info("Step 4: Converting annotated image to base64...")
        annotated_base64 = predictor.image_to_base64(result['annotated_image'])
        
        logger.info("SUCCESS: Detection complete!")
        logger.info(f"Result: Found {result['count']} detections")
        logger.info(f"Log saved to: logs/{log_filename}")
        logger.info("="*60)
        
        return JSONResponse(content={
            "success": True,
            "task": "detection",
            "result": {
                "detections": result['detections'],
                "count": result['count'],
                "annotated_image": annotated_base64,
                "log_file": log_filename
            }
        })
    
    except Exception as e:
        logger.error(f"Detection failed: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        logger.info("="*60)
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


@app.post("/predict/count")
async def predict_count(
    image: UploadFile = File(...),
    conf: float = Form(0.25),
    show_labels: bool = Form(True)
):
    """
    Count RBC and WBC cells
    Args:
        image: Uploaded image file
        conf: Confidence threshold
        show_labels: Whether to show class labels and confidence on bounding boxes (default: True)
    Returns:
        Cell counts and annotated image
    """
    # Create unique logger for this request
    logger, log_filename = logger_manager.create_logger('count')
    
    logger.info(f"Endpoint: POST /predict/count")
    logger.info(f"Confidence threshold: {conf}")
    logger.info(f"Show labels: {show_labels}")
    logger.info(f"Image filename: {image.filename}")
    logger.info(f"Image content type: {image.content_type}")
    
    if predictor is None:
        logger.error("Predictor not loaded!")
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    try:
        # Read image
        logger.info("Step 1: Reading image bytes...")
        image_bytes = await image.read()
        logger.info(f"Step 1: Read {len(image_bytes)} bytes")
        
        logger.info("Step 2: Preprocessing upload...")
        pil_image = predictor.preprocess_upload(image_bytes, logger=logger)
        
        # Predict
        logger.info("Step 3: Running cell counting...")
        result = predictor.predict_detection_count(pil_image, conf=conf, show_labels=show_labels, logger=logger)
        
        # Convert annotated image to base64
        logger.info("Step 4: Converting annotated image to base64...")
        annotated_base64 = predictor.image_to_base64(result['annotated_image'])
        
        logger.info("SUCCESS: Cell counting complete!")
        logger.info(f"Result: RBC: {result['counts']['RBC']}, WBC: {result['counts']['WBC']}")
        logger.info(f"Log saved to: logs/{log_filename}")
        logger.info("="*60)
        
        return JSONResponse(content={
            "success": True,
            "task": "count",
            "result": {
                "counts": result['counts'],
                "total_cells": result['total_cells'],
                "detections": result['detections'],
                "annotated_image": annotated_base64,
                "log_file": log_filename
            }
        })
    
    except Exception as e:
        logger.error(f"Cell counting failed: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        logger.info("="*60)
        raise HTTPException(status_code=500, detail=f"Cell counting failed: {str(e)}")


@app.post("/predict")
async def predict_multi(request: PredictRequest):
    """
    Unified prediction endpoint supporting all tasks
    Args:
        request: PredictRequest with base64 image and task type
    Returns:
        Prediction results based on task type
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image)
        pil_image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # Route to appropriate prediction
        if request.task == "classification":
            model_id = request.model_id if request.model_id else 'mobilenet-v2'
            result = predictor.predict_classification(pil_image, model_id=model_id)
            return JSONResponse(content={
                "success": True,
                "task": "classification",
                "result": result
            })
        
        elif request.task == "detection":
            result = predictor.predict_detection(pil_image, conf=request.conf)
            annotated_base64 = predictor.image_to_base64(result['annotated_image'])
            return JSONResponse(content={
                "success": True,
                "task": "detection",
                "result": {
                    "detections": result['detections'],
                    "count": result['count'],
                    "annotated_image": annotated_base64
                }
            })
        
        elif request.task == "count":
            result = predictor.predict_detection_count(pil_image, conf=request.conf)
            annotated_base64 = predictor.image_to_base64(result['annotated_image'])
            return JSONResponse(content={
                "success": True,
                "task": "count",
                "result": {
                    "counts": result['counts'],
                    "total_cells": result['total_cells'],
                    "detections": result['detections'],
                    "annotated_image": annotated_base64
                }
            })
        
        else:
            raise HTTPException(status_code=400, detail="Invalid task. Use 'classification', 'detection', or 'count'")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("Blood Cell Analysis API")
    print("=" * 60)
    print("\nStarting server...")
    print("API will be available at: http://localhost:8000")
    print("Documentation: http://localhost:8000/docs")
    print("=" * 60 + "\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
