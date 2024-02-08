import app from './createApp';

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.info('✅ Central micro-service initialised on :%O', PORT));
