import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/campusconnect";
const client = new MongoClient(uri);
let db = null;

export async function connectDb() {
  if (db) return db;
  await client.connect();
  db = client.db(process.env.MONGODB_DB_NAME || "campusconnect");
  return db;
}

export function getCollection(name) {
  return connectDb().then((database) => database.collection(name));
}

export async function closeDb() {
  await client.close();
  db = null;
}
