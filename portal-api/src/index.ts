import dotenv from 'dotenv';
import app from './createApp';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.info('✅ Portal API micro-service initialised on :%s', PORT));
