import { getNowAsEpoch } from './date';

describe('helpers - date', () => {
  describe('getNowAsEpoch', () => {
    const now = 1702900314000;

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('gets the current date as a 13 digit epoch timestamp', () => {
      // Arrange
      jest.setSystemTime(new Date(now));

      // Act
      const nowAsEpoch = getNowAsEpoch();

      // Assert
      expect(nowAsEpoch).toBe(now);
      expect(nowAsEpoch.toString().length).toBe(13);
    });
  });
});
