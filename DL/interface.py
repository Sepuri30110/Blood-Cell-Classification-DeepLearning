"""
Interface - Prediction and Preprocessing functions for blood cell analysis
"""
import numpy as np
import cv2
from PIL import Image
import io
import base64


class BloodCellPredictor:
    def __init__(self, model_loader):
        """
        Initialize predictor with loaded models
        Args:
            model_loader: Instance of ModelLoader class
        """
        self.model_loader = model_loader
        self.IMG_SIZE = 224  # For classification
    
    # ==================== CLASSIFICATION ====================
    
    def preprocess_for_classification(self, image):
        """
        Preprocess image for classification model
        Args:
            image: PIL Image or numpy array
        Returns:
            Preprocessed numpy array ready for model
        """
        # Convert to PIL Image if numpy array
        if isinstance(image, np.ndarray):
            image = Image.fromarray(image)
        
        # Resize to 224x224
        image = image.resize((self.IMG_SIZE, self.IMG_SIZE))
        
        # Convert to array and normalize
        img_array = np.array(image) / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    def predict_classification(self, image, model_id='mobilenet-v2', logger=None):
        """
        Predict blood cell type classification
        Args:
            image: PIL Image, numpy array, or file path (string)
            model_id: Model identifier (resnet-50, densenet-121, mobilenet-v2, efficientnet-b0, cnn, vit-base)
            logger: Logger instance for this request
        Returns:
            dict with prediction results
        """
        log = logger.info if logger else print
        
        log(f"predict_classification called with model_id: {model_id}")
        log(f"Image type: {type(image)}")
        
        # Load image if path is provided
        if isinstance(image, str):
            log(f"Loading image from path: {image}")
            image = Image.open(image).convert('RGB')
        elif isinstance(image, np.ndarray):
            log(f"Converting numpy array to PIL Image, shape: {image.shape}")
            image = Image.fromarray(image).convert('RGB')
        
        log(f"PIL Image size: {image.size}")
        
        # Preprocess
        log("Preprocessing image for classification...")
        processed_img = self.preprocess_for_classification(image)
        log(f"Preprocessed image shape: {processed_img.shape}")
        
        # Get model
        log(f"Getting classification model: {model_id}")
        model = self.model_loader.get_classification_model(model_id)
        
        # Predict
        log("Running model prediction...")
        predictions = model.predict(processed_img, verbose=0)
        log(f"Predictions shape: {predictions.shape}")
        
        # Get predicted class
        pred_class_index = np.argmax(predictions[0])
        num_classes = predictions.shape[1]
        
        log(f"Model outputs {num_classes} classes")
        log(f"Predicted class index: {pred_class_index}")
        
        pred_class_name = self.model_loader.classification_classes[pred_class_index]
        confidence = float(predictions[0][pred_class_index])
        log(f"Predicted: {pred_class_name} with confidence: {confidence:.4f}")
        
        # Get all probabilities
        probabilities = {}
        for i, class_name in enumerate(self.model_loader.classification_classes):
            probabilities[class_name] = float(predictions[0][i])
            log(f"Probability[{class_name}] = {predictions[0][i]:.4f}")
        
        return {
            "predicted_class": pred_class_name,
            "confidence": confidence,
            "probabilities": probabilities,
            "model_used": model_id
        }
    
    # ==================== DETECTION ====================
    
    def predict_detection(self, image, conf=0.25, show_labels=True, logger=None):
        """
        Predict blood cell detection with bounding boxes
        Args:
            image: PIL Image, numpy array, or file path (string)
            conf: Confidence threshold
            show_labels: Whether to show class labels on bounding boxes
            logger: Logger instance for this request
        Returns:
            dict with detection results
        """
        log = logger.info if logger else print
        
        log(f"predict_detection called with conf={conf}")
        log(f"Image type: {type(image)}")
        
        # Get model
        model = self.model_loader.get_detection_model()
        log("Detection model loaded")
        
        # Convert to file path or numpy array for YOLO
        if isinstance(image, Image.Image):
            # Convert PIL to numpy
            log(f"Converting PIL to numpy, size: {image.size}")
            image = np.array(image)
            log(f"Numpy array shape: {image.shape}")
        
        # Predict
        log("Running YOLO detection...")
        results = model.predict(image, conf=conf, verbose=False)[0]
        log(f"Detection complete, found {len(results.boxes)} boxes")
        
        # Extract detections
        detections = []
        for i, box in enumerate(results.boxes):
            log(f"Processing box {i+1}/{len(results.boxes)}")
            log(f"box.cls type: {type(box.cls)}, shape: {box.cls.shape if hasattr(box.cls, 'shape') else 'N/A'}")
            log(f"box.conf type: {type(box.conf)}, shape: {box.conf.shape if hasattr(box.conf, 'shape') else 'N/A'}")
            
            # Fix: Extract scalar values from tensors
            cls = int(box.cls.cpu().numpy()[0])
            confidence = float(box.conf.cpu().numpy()[0])
            xyxy = box.xyxy[0].cpu().numpy().tolist()
            
            log(f"Box {i+1}: class={cls}, confidence={confidence:.4f}, bbox={xyxy}")
            
            detections.append({
                "class": model.names[cls],
                "confidence": confidence,
                "bbox": xyxy  # [x1, y1, x2, y2]
            })
        
        # Get annotated image (YOLO plot() returns RGB in recent versions)
        # Control label display: labels=False hides class names, conf=False hides confidence scores
        if show_labels:
            annotated_img = results.plot()
        else:
            annotated_img = results.plot(labels=False, conf=False)
        
        log(f"Annotated image shape: {annotated_img.shape}")
        log(f"Labels displayed: {show_labels}")
        
        return {
            "detections": detections,
            "count": len(detections),
            "annotated_image": annotated_img
        }
    
    # ==================== DETECTION COUNT ====================
    
    def predict_detection_count(self, image, conf=0.25, show_labels=True, logger=None):
        """
        Predict and count RBC and WBC cells
        Args:
            image: PIL Image, numpy array, or file path (string)
            conf: Confidence threshold
            show_labels: Whether to show class labels on bounding boxes
            logger: Logger instance for this request
        Returns:
            dict with count results
        """
        log = logger.info if logger else print
        
        log(f"predict_detection_count called with conf={conf}")
        log(f"Image type: {type(image)}")
        
        # Get model
        model = self.model_loader.get_detection_count_model()
        log("Detection count model loaded")
        
        # Convert to file path or numpy array for YOLO
        if isinstance(image, Image.Image):
            # Convert PIL to numpy
            log(f"Converting PIL to numpy, size: {image.size}")
            image = np.array(image)
            log(f"Numpy array shape: {image.shape}")
        
        # Predict
        log("Running YOLO cell counting...")
        results = model.predict(image, conf=conf, verbose=False)[0]
        log(f"Detection complete, found {len(results.boxes)} cells")
        
        # Count cells
        counts = {"RBC": 0, "WBC": 0}
        detections = []
        
        for i, box in enumerate(results.boxes):
            log(f"Processing cell {i+1}/{len(results.boxes)}")
            
            # Fix: Extract scalar values from tensors
            cls = int(box.cls.cpu().numpy()[0])
            label = self.model_loader.detection_count_classes[cls]
            confidence = float(box.conf.cpu().numpy()[0])
            xyxy = box.xyxy[0].cpu().numpy().tolist()
            
            log(f"Cell {i+1}: {label}, confidence={confidence:.4f}")
            
            counts[label] += 1
            detections.append({
                "class": label,
                "confidence": confidence,
                "bbox": xyxy
            })
        
        # Get annotated image (YOLO plot() returns RGB in recent versions)
        # Control label display: labels=False hides class names, conf=False hides confidence scores
        if show_labels:
            annotated_img = results.plot()
        else:
            annotated_img = results.plot(labels=False, conf=False)
        
        log(f"Annotated image shape: {annotated_img.shape}")
        log(f"Labels displayed: {show_labels}")
        
        return {
            "counts": counts,
            "total_cells": counts["RBC"] + counts["WBC"],
            "detections": detections,
            "annotated_image": annotated_img
        }
    
    # ==================== UTILITY FUNCTIONS ====================
    
    def image_to_base64(self, image_array):
        """
        Convert numpy array image to base64 string
        Args:
            image_array: numpy array (RGB)
        Returns:
            base64 encoded string
        """
        # Convert to PIL Image
        img = Image.fromarray(image_array.astype('uint8'))
        
        # Save to bytes
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG")
        
        # Encode to base64
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return img_str
    
    def preprocess_upload(self, file_bytes, logger=None):
        """
        Preprocess uploaded file bytes to PIL Image
        Args:
            file_bytes: Raw bytes from uploaded file
            logger: Logger instance for this request
        Returns:
            PIL Image
        """
        log = logger.info if logger else print
        
        log("preprocess_upload called")
        log(f"File bytes length: {len(file_bytes)}")
        
        image = Image.open(io.BytesIO(file_bytes)).convert('RGB')
        log(f"Converted to PIL Image, size: {image.size}, mode: {image.mode}")
        
        return image
