import dotenv from 'dotenv';
import { app } from './createApp';
dotenv.config();

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => console.log(`External APIs listening on port ${PORT}`));
