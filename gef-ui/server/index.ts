import { Express } from 'express';
import './azure-env/index.ts';
import app from './createApp';

const PORT = process.env.PORT || 5006;

(app as Express).listen(PORT, () => console.info('✅ GEF UI micro-service initialised on :%s', PORT));
