import { Request } from 'express';
import { getFlashSuccessMessage } from './get-flash-success-message';

describe('getFlashSuccessMessage', () => {
  it('should return the first object in req.successMessage', () => {
    const testMessage1 = 'testMessage1';
    const testMessage2 = 'testMessage2';

    const mockFlashResponse = {
      successMessage: [testMessage1, testMessage2],
    };

    const mockFlash = ((key: 'successMessage') => mockFlashResponse[key]) as Request['flash'];

    expect(getFlashSuccessMessage(mockFlash)).toEqual(testMessage1);
  });
});
