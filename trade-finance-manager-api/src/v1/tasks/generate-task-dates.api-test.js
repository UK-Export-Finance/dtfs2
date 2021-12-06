const generateTaskDates = require('./generate-task-dates');

const api = require('../api');

describe('generateTaskDates', () => {
  it('should return object with lastEdited timestamp', () => {
    const result = generateTaskDates();

    const expected = {
      lastEdited: expect.any(Number),
    };

    expect(result).toEqual(expected);
  });

  describe('when statusFrom is `To do` and statusTo is `In progress`', () => {
    it('should return dateStarted', () => {
      const result = generateTaskDates('To do', 'In progress');

      const expected = {
        lastEdited: expect.any(Number),
        dateStarted: expect.any(Number),
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when statusFrom is `To do` and statusTo is `Done`', () => {
    it('should return dateStarted and dateCompleted', () => {
      const result = generateTaskDates('To do', 'Done');

      const expected = {
        lastEdited: expect.any(Number),
        dateStarted: expect.any(Number),
        dateCompleted: expect.any(Number),
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when statusFrom is `In progress` and statusTo is `Done`', () => {
    it('should return dateCompleted', () => {
      const result = generateTaskDates('In progress', 'Done');

      const expected = {
        lastEdited: expect.any(Number),
        dateCompleted: expect.any(Number),
      };

      expect(result).toEqual(expected);
    });
  });
});
