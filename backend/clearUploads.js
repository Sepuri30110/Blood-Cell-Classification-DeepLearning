const mongoose = require('mongoose');
const Upload = require('./models/upload.model');
const User = require('./models/user.model');
require('dotenv').config({ quiet: true });

const clearDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find first user
        const user = await User.findOne();
        
        if (!user) {
            console.log('No users found in database.');
            process.exit(1);
        }

        console.log(`Clearing uploads for user: ${user.uname} (${user.email})`);

        // Delete all uploads for this user
        const result = await Upload.deleteMany({ userId: user._id });
        
        console.log(`✅ Successfully deleted ${result.deletedCount} uploads`);

    } catch (error) {
        console.error('Error clearing database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
};

// Run the clear function
clearDatabase();
