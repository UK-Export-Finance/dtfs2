import app from './createApp';
import { initialiseScheduler } from './scheduler';

initialiseScheduler();

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.info('✅ Central micro-service initialised on :%s', PORT));
