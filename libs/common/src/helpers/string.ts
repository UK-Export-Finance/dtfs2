export const isString = (value: unknown): value is string => typeof value === 'string' || value instanceof String;

export const isNullUndefinedOrEmptyString = (value: unknown): boolean => !value || (isString(value) && !value.trim().length);

export const isNonEmptyString = (value: unknown): value is string => isString(value) && !isNullUndefinedOrEmptyString(value);
