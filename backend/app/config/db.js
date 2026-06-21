import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/eximarg';

export const connectDB = async () => {
  try {
    // Attempt Mongoose connection with a short 3s timeout
    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB connection established successfully.');
    process.env.USE_MOCK_DB = 'false';
  } catch (error) {
    console.warn('\n================================================================');
    console.warn('WARNING: Could not connect to MongoDB server.');
    console.warn('REASON:', error.message);
    console.warn('FALLBACK ACTIVATED: Starting EXIMARG with local JSON file-based database.');
    console.warn('No installation needed. Running standalone.');
    console.warn('================================================================\n');
    process.env.USE_MOCK_DB = 'true';
  }
};
