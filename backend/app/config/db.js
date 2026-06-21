import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/eximarg';

export const connectDB = async () => {
  // On Vercel without a configured MONGO_URL, skip the 3s connection
  // timeout and use the in-memory mock DB immediately.
  if (process.env.VERCEL && (!process.env.MONGO_URL || process.env.MONGO_URL === 'mongodb://localhost:27017/eximarg')) {
    console.log('Running on Vercel without external MongoDB — using in-memory mock DB.');
    process.env.USE_MOCK_DB = 'true';
    return;
  }

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
