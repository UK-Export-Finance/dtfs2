export const isString = (value: unknown): value is string => typeof value === 'string' || value instanceof String;

export const isEmptyString = (str: unknown) => !str || (isString(str) && !str.trim().length);

export const hasValue = (str: unknown) => str && !isEmptyString(str);
