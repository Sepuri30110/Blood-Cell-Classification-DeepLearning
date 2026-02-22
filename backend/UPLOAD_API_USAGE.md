# Upload API Usage Guide

## Overview
The Upload API stores blood cell image predictions along with the actual image data (as base64 encoded strings).

## Authentication
All endpoints require authentication. Include the JWT token in cookies or Authorization header.

## Endpoints

### 1. Create Upload (Store Prediction with Image)
**POST** `/api/uploads`

**Request Body:**
```json
{
  "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "imageOriginalName": "blood_cell_sample.png",
  "imageSize": 245678,
  "imageMimeType": "image/png",
  "prediction": {
    "cellType": "Eosinophil",
    "confidence": 94.5,
    "modelUsed": "ResNet50"
  },
  "processingTime": 1250,
  "metadata": {
    "imageWidth": 640,
    "imageHeight": 480,
    "fileFormat": "png"
  }
}
```

**Frontend Example (React):**
```javascript
const handleUpload = async (file, prediction) => {
  // Convert file to base64
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64Data = reader.result; // This includes the data:image/...;base64, prefix
    
    const uploadData = {
      imageData: base64Data,
      imageOriginalName: file.name,
      imageSize: file.size,
      imageMimeType: file.type,
      prediction: {
        cellType: prediction.cellType,
        confidence: prediction.confidence,
        modelUsed: prediction.model
      },
      processingTime: prediction.processingTime,
      metadata: {
        imageWidth: prediction.width,
        imageHeight: prediction.height,
        fileFormat: file.type.split('/')[1]
      }
    };

    try {
      const response = await axios.post(
        'http://localhost:9001/api/uploads',
        uploadData,
        { withCredentials: true }
      );
      console.log('Upload saved:', response.data);
    } catch (error) {
      console.error('Error saving upload:', error);
    }
  };
  reader.readAsDataURL(file);
};
```

### 2. Get All Uploads (History)
**GET** `/api/uploads?page=1&limit=10&includeImage=false`

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page
- `sortBy` (default: createdAt) - Field to sort by
- `order` (default: desc) - Sort order (asc/desc)
- `includeImage` (default: false) - Include base64 image data (set to 'true' to include)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### 3. Get Single Upload (with Image)
**GET** `/api/uploads/:id`

Returns full upload details including the base64 image data.

### 4. Get Image Only
**GET** `/api/uploads/:id/image`

Returns only the image data for a specific upload (lighter payload).

**Response:**
```json
{
  "success": true,
  "data": {
    "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "imageMimeType": "image/png",
    "imageOriginalName": "blood_cell_sample.png"
  }
}
```

**Frontend Example (Display Image):**
```javascript
const [imageData, setImageData] = useState(null);

useEffect(() => {
  const fetchImage = async () => {
    const response = await axios.get(
      `http://localhost:9001/api/uploads/${uploadId}/image`,
      { withCredentials: true }
    );
    setImageData(response.data.data.imageData);
  };
  fetchImage();
}, [uploadId]);

return <img src={imageData} alt="Blood cell" />;
```

### 5. Get Upload Statistics (Dashboard)
**GET** `/api/uploads/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUploads": 150,
    "uploadsToday": 12,
    "mostUsedModel": "ResNet50",
    "uniqueCellTypes": 8,
    "distribution": [
      { "name": "Eosinophil", "value": 45 },
      { "name": "Neutrophil", "value": 38 },
      { "name": "Lymphocyte", "value": 35 }
    ]
  }
}
```

### 6. Delete Upload
**DELETE** `/api/uploads/:id`

Deletes an upload (including the stored image).

## Notes

- Images are stored as base64 encoded strings in MongoDB
- For list views (history page), use `includeImage=false` to reduce payload size
- For individual upload details or image display, use the specific endpoints
- The API automatically handles the base64 prefix (data:image/...;base64,)
- Recommended: Compress images on frontend before uploading to keep database size manageable
