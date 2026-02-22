# Database Seeding Instructions

## Overview
Scripts to populate the database with test data for development and testing.

## Prerequisites
1. MongoDB must be running
2. Backend server must be configured (`.env` file with `MONGO_URI`)
3. At least one user must exist in the database (signup first)

## Files Created

### 1. `seed.js`
Adds 50 sample blood cell upload records to the database with:
- Random cell types (Eosinophil, Lymphocyte, Monocyte, Neutrophil, Basophil)
- Random models (ResNet50, VGG16, MobileNetV2, InceptionV3)
- Random confidence scores (85-99%)
- Dates distributed over the last 30 days
- Small base64 test images (1x1 pixel PNGs)

### 2. `clearUploads.js`
Removes all upload records for the test user from the database.

## Usage

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Seed the Database
```bash
npm run seed
```

**Output:**
```
Connected to MongoDB
Using user: testuser (test@example.com)
Inserting 50 sample uploads...
✅ Successfully seeded database with sample uploads!

📊 Upload Statistics:
   Eosinophil: 12
   Lymphocyte: 11
   Neutrophil: 10
   Monocyte: 9
   Basophil: 8

Total uploads: 50
```

### Step 3: Clear Database (Optional)
To remove all test data:
```bash
npm run clear
```

## What Gets Created

Each upload record includes:
- **userId**: Links to your user account
- **imageData**: Small base64 encoded test image
- **imageOriginalName**: blood_cell_sample_[number].png
- **imageSize**: Random size between 245-1245 bytes
- **imageMimeType**: image/png
- **prediction**:
  - cellType: One of the 5 blood cell types
  - confidence: Random value between 85-99
  - modelUsed: One of the 4 AI models
- **processingTime**: Random time between 500-2500ms
- **status**: completed
- **metadata**:
  - imageWidth: 640
  - imageHeight: 480
  - fileFormat: png
- **createdAt**: Random date within last 30 days
- **updatedAt**: Same as createdAt

## Verifying the Data

### Backend API
Test the stats endpoint:
```bash
# Get dashboard stats
GET http://localhost:9001/api/uploads/stats

# Get all uploads
GET http://localhost:9001/api/uploads
```

### Frontend Dashboard
1. Start the backend: `npm start`
2. Start the frontend: `cd ../frontend && npm run dev`
3. Login to your account
4. Navigate to the Dashboard page
5. You should see:
   - Stats cards populated with data
   - Recent predictions table with entries
   - Pie chart showing cell type distribution

### MongoDB Compass (Optional)
Connect to your MongoDB instance and view the `uploads` collection.

## Notes

- The seed script will use the first user found in the database
- If no users exist, you'll need to signup first through the frontend
- Running `npm run seed` multiple times will add more data (50 uploads each time)
- Use `npm run clear` to reset and start fresh
- The test images are minimal (1x1 pixels) to keep database size small
- All timestamps are randomized for realistic testing

## Troubleshooting

**Error: "No users found in database"**
- Solution: Create a user account by signing up through the frontend first

**Error: "Connection failed"**
- Solution: Ensure MongoDB is running and MONGO_URI in `.env` is correct

**Error: "Module not found"**
- Solution: Run `npm install` in the backend directory

## Next Steps

After seeding:
1. Test the Dashboard page to see stats and charts
2. Test the History page to see all uploads
3. Test the cache functionality (data should load instantly on second visit)
4. Test the refresh button to update data
