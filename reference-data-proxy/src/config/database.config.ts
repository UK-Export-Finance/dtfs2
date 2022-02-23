import * as dotenv from 'dotenv';
dotenv.config();

export const dbName: any = process.env.MONGO_INITDB_DATABASE;
export const url: any = process.env.MONGODB_URI;
