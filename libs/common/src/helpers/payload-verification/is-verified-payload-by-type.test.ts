import { isVerifiedPayloadByType } from './is-verified-payload-by-type';
import { withVerifiedPayloadTests } from './with-is-verified-payload.tests';

describe('isVerifiedPayloadByType', () => {
  withVerifiedPayloadTests({ verificationType: 'type', makePayloadRequest: isVerifiedPayloadByType });
});
