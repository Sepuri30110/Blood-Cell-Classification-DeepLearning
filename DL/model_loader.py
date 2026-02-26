"""
Model Loader - Loads all deep learning models for blood cell analysis
"""
import os
# Force TensorFlow to use legacy Keras 2.x for compatibility with older models
os.environ['TF_USE_LEGACY_KERAS'] = '1'
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from ultralytics import YOLO


# Custom layers for Vision Transformer (ViT) model
class Patches(layers.Layer):
    """Layer to extract patches from images"""
    def __init__(self, patch_size, **kwargs):
        super(Patches, self).__init__(**kwargs)
        self.patch_size = patch_size

    def call(self, images):
        batch_size = tf.shape(images)[0]
        patches = tf.image.extract_patches(
            images=images,
            sizes=[1, self.patch_size, self.patch_size, 1],
            strides=[1, self.patch_size, self.patch_size, 1],
            rates=[1, 1, 1, 1],
            padding="VALID",
        )
        patch_dims = patches.shape[-1]
        patches = tf.reshape(patches, [batch_size, -1, patch_dims])
        return patches

    def get_config(self):
        config = super().get_config()
        config.update({"patch_size": self.patch_size})
        return config


class PatchEncoder(layers.Layer):
    """Layer to encode patches with position embeddings"""
    def __init__(self, num_patches, projection_dim, **kwargs):
        super(PatchEncoder, self).__init__(**kwargs)
        self.num_patches = num_patches
        self.projection_dim = projection_dim
        self.projection = layers.Dense(units=projection_dim)
        self.position_embedding = layers.Embedding(
            input_dim=num_patches, output_dim=projection_dim
        )

    def call(self, patch):
        positions = tf.range(start=0, limit=self.num_patches, delta=1)
        encoded = self.projection(patch) + self.position_embedding(positions)
        return encoded

    def get_config(self):
        config = super().get_config()
        config.update({
            "num_patches": self.num_patches,
            "projection_dim": self.projection_dim
        })
        return config

class ModelLoader:
    def __init__(self, models_dir="models"):
        """
        Initialize model loader
        Args:
            models_dir: Directory containing the model files
        """
        self.models_dir = models_dir
        
        # Multiple classification models
        self.classification_models = {
            'resnet-50': None,
            'densenet-121': None,
            'mobilenet-v2': None,
            'efficientnet-b0': None,
            'cnn': None,
            'vit-base': None
        }
        
        self.detection_model = None
        self.detection_count_model = None
        
        # Class names for classification (actual trained classes - 5 classes)
        self.classification_classes = [
            'basophil',
            'eosinophil',
            'lymphocyte',
            'monocyte',
            'neutrophil'
        ]
        
        # Class names for detection count
        self.detection_count_classes = ["RBC", "WBC"]
        
        # Model file mappings - mapped to actual files in models/
        self.model_files = {
            'resnet-50': 'best_resnet50.h5',
            'densenet-121': 'best_densenet121.h5',
            'mobilenet-v2': 'best_mobilenet.h5',
            'efficientnet-b0': 'best_EfficientNetB0.h5',
            'cnn': 'best_CNN.h5',
            'vit-base': 'best_vit.h5'
        }
    
    def load_classification_model(self, model_id='mobilenet-v2', model_path=None):
        """
        Load a specific classification model
        Args:
            model_id: Model identifier (resnet-50, densenet-121, mobilenet-v2, efficientnet-b0, cnn, vit-base)
            model_path: Optional custom path to the .h5 model file
        """
        if model_id not in self.classification_models:
            raise ValueError(f"Unknown model ID: {model_id}. Available: {list(self.classification_models.keys())}")
        
        if model_path is None:
            model_path = os.path.join(self.models_dir, self.model_files[model_id])
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Classification model not found at {model_path}")
        
        # Custom objects for ViT model
        custom_objects = {
            'Patches': Patches,
            'PatchEncoder': PatchEncoder
        }
        
        # Load model (using legacy Keras for compatibility)
        self.classification_models[model_id] = tf.keras.models.load_model(
            model_path, 
            compile=False,
            custom_objects=custom_objects
        )
        
        print(f"✓ Classification model '{model_id}' loaded from {model_path}")
        return self.classification_models[model_id]
    
    def load_all_classification_models(self):
        """
        Load all classification models
        """
        print("Loading all classification models...")
        loaded = []
        failed = []
        
        for model_id in self.classification_models.keys():
            try:
                self.load_classification_model(model_id)
                loaded.append(model_id)
            except FileNotFoundError as e:
                print(f"⚠ Skipping {model_id}: {str(e)}")
                failed.append(model_id)
            except Exception as e:
                print(f"✗ Error loading {model_id}: {str(e)}")
                failed.append(model_id)
        
        print(f"✓ Loaded {len(loaded)} classification model(s): {loaded}")
        if failed:
            print(f"⚠ Failed to load {len(failed)} model(s): {failed}")
        
        return loaded, failed
    
    def load_detection_model(self, model_path=None):
        """
        Load the detection model (YOLO v8n)
        Args:
            model_path: Path to the .pt model file
        """
        if model_path is None:
            model_path = os.path.join(self.models_dir, "yolov8n.pt")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Detection model not found at {model_path}")
        
        self.detection_model = YOLO(model_path)
        print(f"✓ Detection model (YOLOv8n) loaded from {model_path}")
        return self.detection_model
    
    def load_detection_count_model(self, model_path=None):
        """
        Load the detection count model (WBC/RBC counter)
        Args:
            model_path: Path to the .pt model file
        """
        if model_path is None:
            model_path = os.path.join(self.models_dir, "wbc_rbc_best.pt")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Detection count model not found at {model_path}")
        
        self.detection_count_model = YOLO(model_path)
        print(f"✓ Detection count model (WBC/RBC counter) loaded from {model_path}")
        return self.detection_count_model
    
    def load_all_models(self):
        """
        Load all models at once
        """
        print("="*60)
        print("Loading all models...")
        print("="*60)
        
        success = True
        
        # Load classification models
        loaded, failed = self.load_all_classification_models()
        if not loaded:
            print("⚠ Warning: No classification models loaded")
            success = False
        
        # Load detection model
        try:
            self.load_detection_model()
        except Exception as e:
            print(f"⚠ Detection model not loaded: {str(e)}")
            success = False
        
        # Load detection count model
        try:
            self.load_detection_count_model()
        except Exception as e:
            print(f"⚠ Detection count model not loaded: {str(e)}")
            success = False
        
        print("="*60)
        if success:
            print("✓ All models loaded successfully!")
        else:
            print("⚠ Some models failed to load. API will work with available models.")
        print("="*60)
        
        return success
    
    def get_classification_model(self, model_id='mobilenet-v2'):
        """
        Get a specific classification model
        Args:
            model_id: Model identifier
        """
        if model_id not in self.classification_models:
            raise ValueError(f"Unknown model ID: {model_id}. Available: {list(self.classification_models.keys())}")
        
        if self.classification_models[model_id] is None:
            # Try to load it on demand
            try:
                self.load_classification_model(model_id)
            except Exception as e:
                raise ValueError(f"Model '{model_id}' not loaded and failed to load: {str(e)}")
        
        return self.classification_models[model_id]
    
    def get_available_classification_models(self):
        """
        Get list of loaded classification models
        """
        return [model_id for model_id, model in self.classification_models.items() if model is not None]
    
    def get_detection_model(self):
        """Get detection model"""
        if self.detection_model is None:
            raise ValueError("Detection model not loaded. Call load_detection_model() first.")
        return self.detection_model
    
    def get_detection_count_model(self):
        """Get detection count model"""
        if self.detection_count_model is None:
            raise ValueError("Detection count model not loaded. Call load_detection_count_model() first.")
        return self.detection_count_model
