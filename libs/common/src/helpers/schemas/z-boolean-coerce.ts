import z from 'zod';

export const zBooleanCoerce = z.preprocess((val) => {
  if (typeof val === 'string' && ['true', 'false', '1', '0'].includes(val.toLowerCase())) {
    return val.toLowerCase() === 'true' || val === '1';
  }

  if (typeof val === 'number' && [0, 1].includes(val)) {
    return val === 1;
  }

  if (typeof val === 'boolean') {
    return val;
  }
  return null;
}, z.boolean());
