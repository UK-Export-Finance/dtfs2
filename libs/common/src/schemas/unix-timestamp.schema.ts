import zod from 'zod';

export const UNIX_TIMESTAMP_SCHEMA = zod.number().int().positive();

export const UNIX_TIMESTAMP_MILLISECONDS_SCHEMA = zod.number().int().positive();

export const UNIX_TIMESTAMP_SECONDS_SCHEMA = zod.number().int().positive();
