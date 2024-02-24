import app from './createApp';
import { initScheduler } from './scheduler';

initScheduler();

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.info('✅ Central micro-service initialised on :%d', PORT));
