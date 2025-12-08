process.env.NODE_ENV = "test";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import connectDB from "../config/database.js";

let mongoServer;

// Export for use by other test files
export { mongoServer };

before(async function () {
  this.timeout(60000); // Increase timeout for server startup
  try {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect using our database utility
    await connectDB(mongoUri);
  } catch (error) {
    console.error("Test setup failed:", error);
    throw error;
  }
});

after(async function () {
  this.timeout(60000);
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error("Test cleanup failed:", error);
  }
});
