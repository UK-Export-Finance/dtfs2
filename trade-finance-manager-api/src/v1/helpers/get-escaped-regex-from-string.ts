import escapeStringRegexp from 'escape-string-regexp';

export const getEscapedRegexFromString = (string: string) => new RegExp(`^${escapeStringRegexp(string)}$`, 'i');
