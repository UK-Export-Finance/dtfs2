import app from './createApp';

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => console.info('✅ TFM API micro-service initialised on %s', PORT));
