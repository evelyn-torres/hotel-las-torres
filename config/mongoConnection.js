import { MongoClient } from "mongodb";

let _connection;
let _db;

const dbConnection = async () => {
  if (!_connection) {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME;

    if (!uri) throw new Error("MongoDB connection string is undefined. Check your .env or Vercel env vars!");
    if (!dbName) throw new Error("Database name is undefined.");

    try {
      _connection = await MongoClient.connect(uri);
      _db = _connection.db(dbName);
      console.log("✅ MongoDB connected!");
    } catch (err) {
      console.error("DB Connection Error:", err);
      throw err;
    }
  }
  return _db;
};

const closeConnection = async () => {
  if (_connection) await _connection.close();
};

export { dbConnection, closeConnection };

