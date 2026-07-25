import mongoose from "mongoose";

export async function connectDatabase(uri) {
  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    autoIndex: process.env.NODE_ENV !== "production",
    serverSelectionTimeoutMS: 5_000,
  });

  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
