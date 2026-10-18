import mongoose from 'mongoose';
import { MONGODB_URI } from './gameConfig.js';

let isConnected = false;

export const connectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[DATABASE ERROR] Failed to connect to MongoDB: ${error.message}`);
    // Don't exit immediately so tests or fallback mock can run if needed
    throw error;
  }
};

export default connectDB;
