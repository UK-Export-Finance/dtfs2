/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as dotenv from 'dotenv';
import { app } from './createApp';

dotenv.config();

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => console.info('✅ External micro-service initialised on %s', PORT));
