import { MongoClient } from "mongodb";

const uri = "mongodb://127.0.0.1:27017"; // try IP instead of "localhost"
const client = new MongoClient(uri);

try {
  await client.connect();
  console.log("✅ Connected to MongoDB!");
  const dbs = await client.db().admin().listDatabases();
  console.log("Databases:", dbs);
} catch (err) {
  console.error("❌ Connection failed:", err);
} finally {
  await client.close();
}
