import dotenv from 'dotenv';
dotenv.config();

export const dbName: string = process.env.MONGO_INITDB_DATABASE!;
export const url: string = process.env.MONGODB_URI!;
