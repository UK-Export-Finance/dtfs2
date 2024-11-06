import { createMocks } from 'node-mocks-http';
import { getFlashSuccessMessage } from './get-flash-success-message';
import { CustomExpressRequest } from '../types/custom-express-request';

describe('getFlashSuccessMessage', () => {
  it('should return the first object in req.successMessage', () => {
    const testMessage1 = 'testMessage1';
    const testMessage2 = 'testMessage2';

    const mockFlash = {
      successMessage: [testMessage1, testMessage2],
    };

    const { req } = createMocks<CustomExpressRequest<any>>({
      flash: (key: 'successMessage') => mockFlash[key],
    });

    expect(getFlashSuccessMessage(req)).toEqual(testMessage1);
  });
});
