import z from 'zod';

export const UNIX_TIMESTAMP_SCHEMA = z.number().int().positive();

export const UNIX_TIMESTAMP_MILLISECONDS_SCHEMA = z.number().int().positive();

export const UNIX_TIMESTAMP_SECONDS_SCHEMA = z.number().int().positive();
