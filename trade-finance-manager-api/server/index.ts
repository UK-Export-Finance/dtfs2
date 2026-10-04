import dotenv from 'dotenv';
import app from './createApp';

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => console.info('✅ TFM API micro-service initialised on %s', PORT));
