const { eachThreeMonthsOfInterval } = require('./eachThreeMonthsOfInterval');

// TODO FN-1249 write these tests
describe('eachThreeMonthsOfInterval', () => {
  const dateUkSummer = new Date('2023-07-05T16:26:35.123Z');
//   const dateUkWinter = new Date('2023-01-05T16:26:35.123Z');
//   const dateUkMidnight = new Date('2023-03-05T00:26:35.123Z');
//   const dateUkMidday = new Date('2023-03-05T12:26:35.123Z');

  const formattedDateBst = '5 July 2023 at 5:26 pm';
//   const formattedDateGmt = '5 January 2023 at 4:26 pm';
//   const formattedDateMidnight = '5 March 2023 at 12:26 am';
//   const formattedDateMidday = '5 March 2023 at 12:26 pm';

  it('should format date in UK summer to custom date format in BST', () => {
    const customDate = eachThreeMonthsOfInterval(dateUkSummer);

    expect(customDate).toEqual(formattedDateBst);
  });

  it('should format date in UK winter to custom date format in GMT', () => {
    // const customDate = eachThreeMonthsOfInterval(dateUkWinter);

    // expect(customDate).toEqual(formattedDateGmt);
  });

  it('should format date between midnight and 1 am to custom date format in GMT', () => {
    // const customDate = eachThreeMonthsOfInterval(dateUkMidnight);

    // expect(customDate).toEqual(formattedDateMidnight);
  });

  it('should format date between midday and 1 pm to custom date format in GMT', () => {
    // const customDate = eachThreeMonthsOfInterval(dateUkMidday);

    // expect(customDate).toEqual(formattedDateMidday);
  });
});
