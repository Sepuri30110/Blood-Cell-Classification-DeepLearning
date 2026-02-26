# Logging System Documentation

## Overview

The DL service now creates **unique log files** for each prediction request instead of printing to console. Each request gets its own timestamped log file with complete debugging information.

---

## Features

✅ **Unique log files** for every request  
✅ **Automatic filename generation** with timestamp + task type + unique ID  
✅ **Structured logging** with severity levels (INFO, ERROR, DEBUG)  
✅ **Complete request tracking** from upload to prediction to response  
✅ **Error tracebacks** saved to file for debugging  
✅ **Log management APIs** to list, view, and cleanup old logs  
✅ **Log filename returned** in API response for easy reference  

---

## Log File Format

### Filename Pattern
```
YYYYMMDD_HHMMSS_<task>_<model_id>_<unique_id>.log
```

**Examples:**
- `20260226_143025_classification_mobilenet-v2_a3f8b12c.log`
- `20260226_143156_detection_7d4e9f21.log`
- `20260226_143302_count_c5a1b3d4.log`

### Log Content Structure
```
2026-02-26 14:30:25 - INFO - ============================================================
2026-02-26 14:30:25 - INFO - New CLASSIFICATION Request
2026-02-26 14:30:25 - INFO - Model: mobilenet-v2
2026-02-26 14:30:25 - INFO - Log File: 20260226_143025_classification_mobilenet-v2_a3f8b12c.log
2026-02-26 14:30:25 - INFO - ============================================================
2026-02-26 14:30:25 - INFO - Endpoint: POST /predict/classification
2026-02-26 14:30:25 - INFO - Model ID: mobilenet-v2
2026-02-26 14:30:25 - INFO - Image filename: blood_cell.jpg
2026-02-26 14:30:25 - INFO - Image content type: image/jpeg
2026-02-26 14:30:25 - INFO - Step 1: Reading image bytes...
2026-02-26 14:30:25 - INFO - Step 1: Read 21792 bytes
2026-02-26 14:30:25 - INFO - Step 2: Preprocessing upload...
2026-02-26 14:30:25 - INFO - preprocess_upload called
2026-02-26 14:30:25 - INFO - File bytes length: 21792
2026-02-26 14:30:25 - INFO - Converted to PIL Image, size: (360, 363), mode: RGB
2026-02-26 14:30:25 - INFO - Step 3: Running classification prediction...
2026-02-26 14:30:25 - INFO - predict_classification called with model_id: mobilenet-v2
2026-02-26 14:30:25 - INFO - Image type: <class 'PIL.Image.Image'>
2026-02-26 14:30:25 - INFO - PIL Image size: (360, 363)
2026-02-26 14:30:25 - INFO - Preprocessing image for classification...
2026-02-26 14:30:25 - INFO - Preprocessed image shape: (1, 224, 224, 3)
2026-02-26 14:30:25 - INFO - Getting classification model: mobilenet-v2
2026-02-26 14:30:25 - INFO - Running model prediction...
2026-02-26 14:30:26 - INFO - Predictions shape: (1, 5)
2026-02-26 14:30:26 - INFO - Model outputs 5 classes
2026-02-26 14:30:26 - INFO - Predicted class index: 0
2026-02-26 14:30:26 - INFO - Predicted: basophil with confidence: 0.9973
2026-02-26 14:30:26 - INFO - Probability[basophil] = 0.9973
2026-02-26 14:30:26 - INFO - Probability[eosinophil] = 0.0015
2026-02-26 14:30:26 - INFO - Probability[lymphocyte] = 0.0008
2026-02-26 14:30:26 - INFO - Probability[monocyte] = 0.0003
2026-02-26 14:30:26 - INFO - Probability[neutrophil] = 0.0001
2026-02-26 14:30:26 - INFO - SUCCESS: Classification complete!
2026-02-26 14:30:26 - INFO - Result: basophil (99.73%)
2026-02-26 14:30:26 - INFO - Log saved to: logs/20260226_143025_classification_mobilenet-v2_a3f8b12c.log
2026-02-26 14:30:26 - INFO - ============================================================
```

---

## API Response Changes

Each prediction response now includes the **log filename**:

### Classification Response
```json
{
  "success": true,
  "task": "classification",
  "result": {
    "predicted_class": "basophil",
    "confidence": 0.9973,
    "probabilities": { ... },
    "model_used": "mobilenet-v2",
    "log_file": "20260226_143025_classification_mobilenet-v2_a3f8b12c.log"
  }
}
```

### Detection/Count Response
```json
{
  "success": true,
  "task": "detection",
  "result": {
    "detections": [ ... ],
    "count": 15,
    "annotated_image": "base64...",
    "log_file": "20260226_143156_detection_7d4e9f21.log"
  }
}
```

---

## Log Management APIs

### 1. List All Logs
**GET** `/logs`

Returns list of all log files with metadata.

**Response:**
```json
{
  "success": true,
  "total_logs": 25,
  "logs": [
    {
      "filename": "20260226_143025_classification_mobilenet-v2_a3f8b12c.log",
      "size": 2458,
      "created": "2026-02-26T14:30:25",
      "modified": "2026-02-26T14:30:26"
    },
    ...
  ]
}
```

**Example:**
```bash
curl http://localhost:8000/logs
```

---

### 2. View Specific Log
**GET** `/logs/{filename}`

Returns content of a specific log file.

**Response:**
```json
{
  "success": true,
  "filename": "20260226_143025_classification_mobilenet-v2_a3f8b12c.log",
  "content": "2026-02-26 14:30:25 - INFO - ..."
}
```

**Example:**
```bash
curl http://localhost:8000/logs/20260226_143025_classification_mobilenet-v2_a3f8b12c.log
```

---

### 3. Cleanup Old Logs
**DELETE** `/logs/cleanup?days=7`

Deletes log files older than specified days (default: 7 days).

**Response:**
```json
{
  "success": true,
  "message": "Cleaned up 15 log file(s) older than 7 days",
  "deleted_count": 15
}
```

**Example:**
```bash
# Delete logs older than 7 days
curl -X DELETE http://localhost:8000/logs/cleanup?days=7

# Delete logs older than 30 days
curl -X DELETE http://localhost:8000/logs/cleanup?days=30
```

---

## Directory Structure

```
DL/
├── logs/                                      # Log files directory
│   ├── 20260226_143025_classification_mobilenet-v2_a3f8b12c.log
│   ├── 20260226_143156_detection_7d4e9f21.log
│   ├── 20260226_143302_count_c5a1b3d4.log
│   └── ...
├── logger_config.py                          # Logger configuration
├── main.py                                   # FastAPI server (uses logger)
├── interface.py                              # Predictor (uses logger)
└── model_loader.py
```

---

## Implementation Details

### `logger_config.py`
- `RequestLogger` class manages logger creation
- Generates unique log filenames with timestamp + UUID
- Creates logs directory if it doesn't exist
- Provides cleanup functionality for old logs

### `interface.py`
- All prediction methods accept optional `logger` parameter
- Uses `log = logger.info if logger else print` for backwards compatibility
- Logs detailed information at each step

### `main.py`
- Creates unique logger for each API request
- Passes logger to predictor methods
- Returns log filename in API response
- Provides log management endpoints

---

## Benefits

### 1. **Better Debugging**
- Each request has complete isolated logs
- Error tracebacks saved permanently
- Easy to trace specific request flow

### 2. **Production Ready**
- Console stays clean (only critical errors)
- Logs can be analyzed later
- Supports log rotation and cleanup

### 3. **Request Tracking**
- Unique ID for each request
- Timestamp for temporal tracking
- Task type and model ID in filename

### 4. **Performance Monitoring**
- Can analyze processing times
- Identify slow operations
- Track model performance

---

## Usage Examples

### Frontend/Backend Integration

After receiving a prediction response, you can:

1. **Display log filename to user** (optional)
2. **Fetch log content** for debugging
3. **Store log reference** in database with prediction

```javascript
// Frontend example
const response = await predictImage(imageData);
console.log(`Prediction logged to: ${response.result.log_file}`);

// Fetch log content if needed
const logResponse = await fetch(`http://localhost:8000/logs/${response.result.log_file}`);
const logData = await logResponse.json();
console.log(logData.content);
```

---

## Maintenance

### Automatic Cleanup Cron Job (Optional)

You can set up automatic log cleanup:

```python
# In main.py, add a background task
from fastapi import BackgroundTasks
import asyncio

async def auto_cleanup_logs():
    while True:
        await asyncio.sleep(86400)  # 24 hours
        logger_manager.cleanup_old_logs(days=7)
        print("Log cleanup completed")

# Start on server startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # ... existing code ...
    
    # Start cleanup task
    asyncio.create_task(auto_cleanup_logs())
    
    yield
    
    # Shutdown
    print("Shutting down...")
```

---

## Summary

✅ **Unique log file per request**  
✅ **Logs stored in `logs/` directory**  
✅ **Filename format: `YYYYMMDD_HHMMSS_task_model_uuid.log`**  
✅ **Log filename returned in API response**  
✅ **APIs to list, view, and cleanup logs**  
✅ **Console stays clean (only errors shown)**  

**Test it:**
1. Start server: `python main.py`
2. Make a prediction request
3. Check `logs/` directory for new log file
4. View logs via API: `GET /logs`

---

**Date:** February 26, 2026  
**Status:** ✅ IMPLEMENTED
