import mongoose from 'mongoose';
import { MONGODB_URI } from './gameConfig.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[DATABASE ERROR] Failed to connect to MongoDB: ${error.message}`);
    // Don't exit immediately so tests or fallback mock can run if needed
    throw error;
  }
};

export default connectDB;
