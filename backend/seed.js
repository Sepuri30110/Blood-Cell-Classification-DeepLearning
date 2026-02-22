const mongoose = require('mongoose');
const Upload = require('./models/upload.model');
const User = require('./models/user.model');
require('dotenv').config({ quiet: true });

// Small 1x1 pixel base64 images for testing (different colors for different cell types)
const testImages = {
    Eosinophil: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
    Lymphocyte: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==',
    Monocyte: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==',
    Neutrophil: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    Basophil: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP4/5+hHgAH+AJ/PgZnvQAAAABJRU5ErkJggg==',
};

const cellTypes = ['Eosinophil', 'Lymphocyte', 'Monocyte', 'Neutrophil', 'Basophil'];
const models = ['ResNet50', 'VGG16', 'MobileNetV2', 'InceptionV3'];

// Generate random date within last 30 days
const randomDate = () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date;
};

// Generate random confidence between 85-99
const randomConfidence = () => {
    return Math.floor(Math.random() * 15) + 85;
};

// Generate sample upload data
const generateSampleUploads = (userId, count = 50) => {
    const uploads = [];
    
    for (let i = 0; i < count; i++) {
        const cellType = cellTypes[Math.floor(Math.random() * cellTypes.length)];
        const model = models[Math.floor(Math.random() * models.length)];
        const confidence = randomConfidence();
        const createdAt = randomDate();
        
        uploads.push({
            userId,
            imageData: testImages[cellType] || testImages.Eosinophil,
            imageOriginalName: `blood_cell_sample_${i + 1}.png`,
            imageSize: 245 + Math.floor(Math.random() * 1000),
            imageMimeType: 'image/png',
            prediction: {
                cellType,
                confidence,
                modelUsed: model
            },
            processingTime: Math.floor(Math.random() * 2000) + 500,
            status: 'completed',
            metadata: {
                imageWidth: 640,
                imageHeight: 480,
                fileFormat: 'png'
            },
            createdAt,
            updatedAt: createdAt
        });
    }
    
    return uploads;
};

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find first user or use a specific user
        let user = await User.findOne();
        
        if (!user) {
            console.log('No users found in database. Please create a user first.');
            process.exit(1);
        }

        console.log(`Using user: ${user.uname} (${user.email})`);

        // Check if uploads already exist
        const existingUploads = await Upload.countDocuments({ userId: user._id });
        
        if (existingUploads > 0) {
            console.log(`Found ${existingUploads} existing uploads. Do you want to delete them? (y/n)`);
            console.log('Skipping deletion. Adding new uploads...');
        }

        // Generate and insert sample uploads
        const sampleUploads = generateSampleUploads(user._id, 50);
        
        console.log(`Inserting ${sampleUploads.length} sample uploads...`);
        await Upload.insertMany(sampleUploads);
        
        console.log('✅ Successfully seeded database with sample uploads!');
        
        // Display summary
        const stats = await Upload.aggregate([
            { $match: { userId: user._id } },
            { $group: { _id: '$prediction.cellType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('\n📊 Upload Statistics:');
        stats.forEach(stat => {
            console.log(`   ${stat._id}: ${stat.count}`);
        });
        
        const totalUploads = await Upload.countDocuments({ userId: user._id });
        console.log(`\nTotal uploads: ${totalUploads}`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    }
};

// Run the seed function
seedDatabase();
