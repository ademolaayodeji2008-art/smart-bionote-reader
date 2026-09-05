import mongoose from "mongoose";

/**
 * Connects to MongoDB Atlas using the connection string in MONGODB_URI.
 * Exits the process on failure since the API cannot function without a database.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
