import mongoose from "mongoose";

class Database {
  constructor(uri) {
    this.uri = uri;
  }

  async connect() {
    try {
      mongoose.set("strictQuery", true);
      const conn = await mongoose.connect(this.uri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      console.error(err.message);
    }
  }
}

export default Database;
