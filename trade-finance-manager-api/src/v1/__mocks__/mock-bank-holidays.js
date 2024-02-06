/**
 * @type {import('../../types/bank-holidays').BankHolidaysResponseBody}
 */
const MOCK_BANK_HOLIDAYS = {
  'england-and-wales': {
    division: 'england-and-wales',
    events: [
      {
        title: 'Christmas Day',
        date: '2023-12-25',
        notes: '',
        bunting: true,
      },
    ],
  },
  scotland: {
    division: 'scotland',
    events: [
      {
        title: 'St Andrew’s Day',
        date: '2023-11-30',
        notes: '',
        bunting: true,
      },
    ],
  },
  'northern-ireland': {
    division: 'northern-ireland',
    events: [
      {
        title: 'St Patrick’s Day',
        date: '2023-03-17',
        notes: '',
        bunting: true,
      },
    ],
  },
};

module.exports = MOCK_BANK_HOLIDAYS;
