import dotenv from 'dotenv';
import initScheduler from './scheduler';

dotenv.config();

initScheduler();

// eslint-disable-next-line import/first
import app from './createApp';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.info('✅ Portal API micro-service initialised on :%O', PORT));
