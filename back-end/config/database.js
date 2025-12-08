import mongoose from "mongoose";

const connectDB = async (uri = null) => {
  // If already connected, skip
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const mongodbURI = uri || process.env.MONGODB_URI;
  if (!mongodbURI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  await mongoose.connect(mongodbURI);
  console.log("MongoDB connected successfully");
};

export default connectDB;
