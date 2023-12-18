export const isString = (value: unknown): value is string => typeof value === 'string' || value instanceof String;

export const isEmptyString = (str: unknown): boolean => !str || (isString(str) && !str.trim().length);

export const hasValue = (str: unknown): boolean => !!str && !isEmptyString(str);
