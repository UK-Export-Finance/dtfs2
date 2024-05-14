import { isVerifiedPayloadByZod } from './is-verified-payload-by-zod';
import { withVerifiedPayloadTests } from './with-is-verified-payload.tests';

describe('isVerifiedPayloadByZod', () => {
  withVerifiedPayloadTests({ verificationType: 'zod', makePayloadRequest: isVerifiedPayloadByZod });
});
