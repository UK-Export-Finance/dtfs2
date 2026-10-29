import zod from 'zod';

const booleanLike = zod.union([zod.enum(['true', 'false', 'TRUE', 'FALSE', 'True', 'False', '0', '1']), zod.literal(0), zod.literal(1), zod.boolean()]);

/**
 * This function coerces a value to a boolean.
 * It only coerces values that are boolean-like, rather than coercing all values to boolean.
 * This addresses an issue where 'false' would be coerced to true -- causing issues in env vars.
 */
export const zBooleanStrictCoerce = booleanLike.transform((val) => {
  return ['true', '1'].includes(String(val).toLowerCase());
});
