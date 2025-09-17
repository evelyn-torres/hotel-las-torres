import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
export const mongoConfig = {
    serverUrl: process.env.MONGO_URI,
    database: process.env.DB_NAME
  };

console.log("MONGO_URI from env:", process.env.MONGO_URI);
console.log("DB_NAME from env:", process.env.DB_NAME);