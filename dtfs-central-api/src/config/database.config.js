import dotenv from 'dotenv';
import { asString } from '@ukef/dtfs2-common';

dotenv.config();

const dbName = asString(process.env.MONGO_INITDB_DATABASE, 'MONGO_INITDB_DATABASE');
const connectionString = asString(process.env.MONGODB_URI, 'MONGODB_URI');

export { dbName, connectionString as url };
