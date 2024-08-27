import { z } from 'zod';
import dotenv from 'dotenv';
import { zBooleanStrictCoerce } from '../helpers';

dotenv.config();

const changeStreamConfigSchema = z.object({
  CHANGE_STREAM_ENABLED: zBooleanStrictCoerce.optional().default(false),
});

export const changeStreamConfig = changeStreamConfigSchema.parse(process.env);
