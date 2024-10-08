import * as dotenv from 'dotenv';

dotenv.config();

const { MONGO_INITDB_DATABASE, MONGODB_URI } = process.env;

export const dbName: string = String(MONGO_INITDB_DATABASE);
export const url: string = String(MONGODB_URI);
