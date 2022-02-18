import {
  sanitiseHasBeenIssued,
  sanitiseBody,
} from './sanitise-body';

describe('controllers/dashboard/facilities - sanitise-body', () => {
  describe('sanitiseHasBeenIssued', () => {
    describe('when hasBeenIssued is an array', () => {
      it('should transform string booleans into booleans', () => {
        const mockHasBeenIssued = ['true', 'false'];

        const result = sanitiseHasBeenIssued(mockHasBeenIssued);

        const expected = [true, false];
        expect(result).toEqual(expected);
      });
    });

    describe('when hasBeenIssued is a single string boolean - true', () => {
      it('should transform string boolean', () => {
        const mockHasBeenIssued = 'true';

        const result = sanitiseHasBeenIssued(mockHasBeenIssued);

        expect(result).toEqual(true);
      });
    });

    describe('when hasBeenIssued is a single string boolean - false', () => {
      it('should transform string boolean', () => {
        const mockHasBeenIssued = 'false';

        const result = sanitiseHasBeenIssued(mockHasBeenIssued);

        expect(result).toEqual(false);
      });
    });
  });

  describe('sanitiseBody', () => {
    describe('when hasBeenIssued is in the body', () => {
      it('should return result with sanitised hasBeenIssued', () => {
        const mockBody = {
          keyword: 'test',
          hasBeenIssued: 'true',
        };

        const result = sanitiseBody(mockBody);

        const expected = {
          ...mockBody,
          hasBeenIssued: sanitiseHasBeenIssued(mockBody.hasBeenIssued),
        };
        expect(result).toEqual(expected);
      });
    });

    it('should return the given body', () => {
      const mockBody = { keyword: 'test' };

      const result = sanitiseBody(mockBody);

      const expected = mockBody;
      expect(result).toEqual(expected);
    });
  });
});
