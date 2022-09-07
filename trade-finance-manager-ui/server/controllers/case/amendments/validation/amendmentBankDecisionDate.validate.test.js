import { amendmentBankDecisionDateValidation } from './amendmentBankDecisionDate.validate';

const { set, getUnixTime } = require('date-fns');

describe('amendmentBankDecisionDateValidation()', () => {
  describe('date UKEF received the bank\'s decision', () => {
    const type = 'bankDecisionDate';
    const message = 'Enter the date UKEF received the bank\'s decision';

    it('should return an error if no date is entered at all', async () => {
      const body = {
        'amendment--bank-decision-date-day': '',
        'amendment--bank-decision-date-month': '',
        'amendment--bank-decision-date-year': '',
      };

      const result = await amendmentBankDecisionDateValidation(body, type, message);

      const expected = {
        amendmentBankRequestDate: null,
        errorsObject: {
          errors: {
            errorSummary: [
              {
                text: 'Enter the date UKEF received the bank\'s decision',
                href: '#bankDecisionDate',
              },
            ],
            fieldErrors: {
              bankDecisionDate: { text: 'Enter the date UKEF received the bank\'s decision' },
            },
          },
          amendmentBankDecisionDateDay: '',
          amendmentBankDecisionDateMonth: '',
          amendmentBankDecisionDateYear: '',
        },
        amendmentBankDecisionDateErrors: [
          {
            errRef: 'bankDecisionDate',
            errMsg: "Enter the date UKEF received the bank's decision",
          },
        ],
      };

      expect(result).toEqual(expected);
    });

    it('should return an error if the date is partially entered', async () => {
      const body = {
        'amendment--bank-decision-date-day': '5',
        'amendment--bank-decision-date-month': '2',
        'amendment--bank-decision-date-year': '',
      };

      const result = await amendmentBankDecisionDateValidation(body, type, message);

      const expected = {
        amendmentBankRequestDate: null,
        errorsObject: {
          errors: {
            errorSummary: [
              {
                text: 'Enter the date UKEF received the bank\'s decision',
                href: '#bankDecisionDate',
              },
            ],
            fieldErrors: {
              bankDecisionDate: { text: 'Enter the date UKEF received the bank\'s decision' },
            },
          },
          amendmentBankDecisionDateDay: '5',
          amendmentBankDecisionDateMonth: '2',
          amendmentBankDecisionDateYear: '',
        },
        amendmentBankDecisionDateErrors: [
          {
            errRef: 'bankDecisionDate',
            errMsg: "Enter the date UKEF received the bank's decision",
          },
        ],
      };

      expect(result).toEqual(expected);
    });

    it('should return an error if the year has 2 numbers', async () => {
      const body = {
        'amendment--bank-decision-date-day': '5',
        'amendment--bank-decision-date-month': '2',
        'amendment--bank-decision-date-year': '22',
      };

      const result = await amendmentBankDecisionDateValidation(body, type, message);

      const expected = {
        amendmentBankRequestDate: expect.any(Number),
        errorsObject: {
          errors: {
            errorSummary: [
              {
                text: 'The year must include 4 numbers',
                href: '#bankDecisionDate',
              },
            ],
            fieldErrors: {
              bankDecisionDate: { text: 'The year must include 4 numbers' },
            },
          },
          amendmentBankDecisionDateDay: '5',
          amendmentBankDecisionDateMonth: '2',
          amendmentBankDecisionDateYear: '22',
        },
        amendmentBankDecisionDateErrors: [
          {
            errRef: 'bankDecisionDate',
            errMsg: 'The year must include 4 numbers',
          },
        ],
      };

      expect(result).toEqual(expected);
    });

    it('should return an object in the correct format with no errors if date entered correctly', async () => {
      const body = {
        'amendment--bank-decision-date-day': '05',
        'amendment--bank-decision-date-month': '02',
        'amendment--bank-decision-date-year': '2022',
      };

      const result = await amendmentBankDecisionDateValidation(body, type, message);

      const amendmentRequestDateFormatted = set(new Date(), {
        year: '2022',
        month: '02' - 1,
        date: '05',
      });

      const expected = {
        amendmentBankRequestDate: getUnixTime(amendmentRequestDateFormatted),
        errorsObject: {
          errors: {
            errorSummary: [],
            fieldErrors: {},
          },
          amendmentBankDecisionDateDay: '05',
          amendmentBankDecisionDateMonth: '02',
          amendmentBankDecisionDateYear: '2022',
        },
        amendmentBankDecisionDateErrors: [],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('date the amendment will be effective from', () => {
    const type = 'bankDecisionDate';
    const message = 'Enter the date the amendment will be effective from';

    it('should return an error if no date is entered at all', async () => {
      const body = {
        'amendment--bank-decision-date-day': '',
        'amendment--bank-decision-date-month': '',
        'amendment--bank-decision-date-year': '',
      };

      const result = await amendmentBankDecisionDateValidation(body, type, message);

      const expected = {
        amendmentBankRequestDate: null,
        errorsObject: {
          errors: {
            errorSummary: [
              {
                text: 'Enter the date the amendment will be effective from',
                href: '#bankDecisionDate',
              },
            ],
            fieldErrors: {
              bankDecisionDate: { text: 'Enter the date the amendment will be effective from' },
            },
          },
          amendmentBankDecisionDateDay: '',
          amendmentBankDecisionDateMonth: '',
          amendmentBankDecisionDateYear: '',
        },
        amendmentBankDecisionDateErrors: [
          {
            errRef: 'bankDecisionDate',
            errMsg: 'Enter the date the amendment will be effective from',
          },
        ],
      };

      expect(result).toEqual(expected);
    });

    it('should return an error if the date is partially entered', async () => {
      const body = {
        'amendment--bank-decision-date-day': '5',
        'amendment--bank-decision-date-month': '2',
        'amendment--bank-decision-date-year': '',
      };

      const result = await amendmentBankDecisionDateValidation(body, type, message);

      const expected = {
        amendmentBankRequestDate: null,
        errorsObject: {
          errors: {
            errorSummary: [
              {
                text: 'Enter the date the amendment will be effective from',
                href: '#bankDecisionDate',
              },
            ],
            fieldErrors: {
              bankDecisionDate: { text: 'Enter the date the amendment will be effective from' },
            },
          },
          amendmentBankDecisionDateDay: '5',
          amendmentBankDecisionDateMonth: '2',
          amendmentBankDecisionDateYear: '',
        },
        amendmentBankDecisionDateErrors: [
          {
            errRef: 'bankDecisionDate',
            errMsg: 'Enter the date the amendment will be effective from',
          },
        ],
      };

      expect(result).toEqual(expected);
    });

    it('should return an object in the correct format with no errors if date entered correctly', async () => {
      const body = {
        'amendment--bank-decision-date-day': '05',
        'amendment--bank-decision-date-month': '02',
        'amendment--bank-decision-date-year': '2022',
      };

      const result = await amendmentBankDecisionDateValidation(body, type, message);

      const amendmentRequestDateFormatted = set(new Date(), {
        year: '2022',
        month: '02' - 1,
        date: '05',
      });

      const expected = {
        amendmentBankRequestDate: getUnixTime(amendmentRequestDateFormatted),
        errorsObject: {
          errors: {
            errorSummary: [],
            fieldErrors: {},
          },
          amendmentBankDecisionDateDay: '05',
          amendmentBankDecisionDateMonth: '02',
          amendmentBankDecisionDateYear: '2022',
        },
        amendmentBankDecisionDateErrors: [],
      };

      expect(result).toEqual(expected);
    });
  });
});
