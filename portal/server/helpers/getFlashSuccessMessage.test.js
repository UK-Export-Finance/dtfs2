import getFlashSuccessMessage from './getFlashSuccessMessage';

describe('getFlashSuccessMessage', () => {
  it('should return the first object in req.successMessage', () => {
    const mockFlash = {
      successMessage: [{ test: true }],
    };

    const mockReq = {
      flash: (str) => mockFlash[str],
    };

    const expected = mockReq.flash('successMessage')[0];
    expect(getFlashSuccessMessage(mockReq)).toEqual(expected);
  });
});
