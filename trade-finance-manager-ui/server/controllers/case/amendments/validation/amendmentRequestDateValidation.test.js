import { add, format } from 'date-fns';

import requestDateValidation from './amendmentRequestDate.validate';

describe('requestDateValidation()', () => {
  it('returns error if no request amendment date', async () => {
    const body = {
      'amendment-request-date-day': '',
      'amendment-request-date-month': '',
      'amendment-request-date-year': '',
    };

    const mockFacility = {
      _id: '12345',
      facilitySnapshot: {
        _id: '12345',
        dealId: '4567',
        dates: {
          inclusionNoticeReceived: 1650538933299,
        },
      },
      amendments: [],
    };

    const result = await requestDateValidation.amendmentRequestDateValidation(body, mockFacility);

    const expected = {
      amendmentRequestDate: null,
      errorsObject: {
        errors: {
          errorSummary: [
            {
              href: '#amendmentRequestDate',
              text: 'Enter the date the bank requested the amendment',
            },
          ],
          fieldErrors:
              {
                amendmentRequestDate: {
                  text: 'Enter the date the bank requested the amendment',
                },
              },

        },
        amendmentRequestDateDay: '',
        amendmentRequestDateMonth: '',
        amendmentRequestDateYear: '',
      },
      amendmentRequestDateErrors: [
        {
          errRef: 'amendmentRequestDate',
          errMsg: 'Enter the date the bank requested the amendment',
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('returns error if amendment date in the past', async () => {
    const body = {
      'amendment-request-date-day': '5',
      'amendment-request-date-month': '04',
      'amendment-request-date-year': '2022',
    };

    const mockFacility = {
      _id: '12345',
      facilitySnapshot: {
        _id: '12345',
        dealId: '4567',
        dates: {
          inclusionNoticeReceived: 1650538933299,
        },
      },
      amendments: [],
    };

    const result = await requestDateValidation.amendmentRequestDateValidation(body, mockFacility);

    const expected = {
      amendmentRequestDate: result.amendmentRequestDate,
      errorsObject: {
        errors: {
          errorSummary: [
            {
              href: '#amendmentRequestDate',
              text: 'Amendment request date cannot be before the notice submission date',
            },
          ],
          fieldErrors:
            {
              amendmentRequestDate: {
                text: 'Amendment request date cannot be before the notice submission date',
              },
            },

        },
        amendmentRequestDateDay: '5',
        amendmentRequestDateMonth: '04',
        amendmentRequestDateYear: '2022',
      },
      amendmentRequestDateErrors: [
        {
          errRef: 'amendmentRequestDate',
          errMsg: 'Amendment request date cannot be before the notice submission date',
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('returns error if amendment date in the future', async () => {
    const today = new Date();
    const future = add(today, { days: 7 });

    const futureDay = format(future, 'dd');
    const futureMonth = format(future, 'MM');
    const futureYear = format(future, 'yyyy');

    const body = {
      'amendment-request-date-day': futureDay.toString(),
      'amendment-request-date-month': futureMonth.toString(),
      'amendment-request-date-year': futureYear.toString(),
    };

    const mockFacility = {
      _id: '12345',
      facilitySnapshot: {
        _id: '12345',
        dealId: '4567',
        dates: {
          inclusionNoticeReceived: 1650538933299,
        },
      },
      amendments: [],
    };

    const result = await requestDateValidation.amendmentRequestDateValidation(body, mockFacility);

    const expected = {
      amendmentRequestDate: result.amendmentRequestDate,
      errorsObject: {
        errors: {
          errorSummary: [
            {
              href: '#amendmentRequestDate',
              text: 'Amendment request date cannot be in the future',
            },
          ],
          fieldErrors:
            {
              amendmentRequestDate: {
                text: 'Amendment request date cannot be in the future',
              },
            },

        },
        amendmentRequestDateDay: futureDay.toString(),
        amendmentRequestDateMonth: futureMonth.toString(),
        amendmentRequestDateYear: futureYear.toString(),
      },
      amendmentRequestDateErrors: [
        {
          errRef: 'amendmentRequestDate',
          errMsg: 'Amendment request date cannot be in the future',
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('returns error if amendment date has 2 numbers for year', async () => {
    const today = new Date();
    const future = add(today, { days: 7 });

    const futureDay = format(future, 'dd');
    const futureMonth = format(future, 'MM');

    const body = {
      'amendment-request-date-day': futureDay.toString(),
      'amendment-request-date-month': futureMonth.toString(),
      'amendment-request-date-year': '22',
    };

    const mockFacility = {
      _id: '12345',
      facilitySnapshot: {
        _id: '12345',
        dealId: '4567',
        dates: {
          inclusionNoticeReceived: 1650538933299,
        },
      },
      amendments: [],
    };

    const result = await requestDateValidation.amendmentRequestDateValidation(body, mockFacility);

    const expected = {
      amendmentRequestDate: result.amendmentRequestDate,
      errorsObject: {
        errors: {
          errorSummary: [
            {
              href: '#amendmentRequestDate',
              text: 'Amendment request date cannot be before the notice submission date',
            },
            {
              href: '#amendmentRequestDate',
              text: 'The year for the amendment request date must include 4 numbers',
            },
          ],
          fieldErrors:
            {
              amendmentRequestDate: {
                text: 'The year for the amendment request date must include 4 numbers',
              },
            },

        },
        amendmentRequestDateDay: futureDay.toString(),
        amendmentRequestDateMonth: futureMonth.toString(),
        amendmentRequestDateYear: '22',
      },
      amendmentRequestDateErrors: [
        {
          errRef: 'amendmentRequestDate',
          errMsg: 'Amendment request date cannot be before the notice submission date',
        },
        {
          errRef: 'amendmentRequestDate',
          errMsg: 'The year for the amendment request date must include 4 numbers',
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('returns error if amendment date has space between numbers for year', async () => {
    const today = new Date();
    const future = add(today, { days: 7 });

    const futureDay = format(future, 'dd');
    const futureMonth = format(future, 'MM');

    const body = {
      'amendment-request-date-day': futureDay.toString(),
      'amendment-request-date-month': futureMonth.toString(),
      'amendment-request-date-year': '2 22',
    };

    const mockFacility = {
      _id: '12345',
      facilitySnapshot: {
        _id: '12345',
        dealId: '4567',
        dates: {
          inclusionNoticeReceived: 1650538933299,
        },
      },
      amendments: [],
    };

    const result = await requestDateValidation.amendmentRequestDateValidation(body, mockFacility);

    const expected = {
      amendmentRequestDate: result.amendmentRequestDate,
      errorsObject: {
        errors: {
          errorSummary: [
            {
              href: '#amendmentRequestDate',
              text: 'The year for the amendment request date must include 4 numbers',
            },
          ],
          fieldErrors:
            {
              amendmentRequestDate: {
                text: 'The year for the amendment request date must include 4 numbers',
              },
            },

        },
        amendmentRequestDateDay: futureDay.toString(),
        amendmentRequestDateMonth: futureMonth.toString(),
        amendmentRequestDateYear: '2 22',
      },
      amendmentRequestDateErrors: [
        {
          errRef: 'amendmentRequestDate',
          errMsg: 'The year for the amendment request date must include 4 numbers',
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('returns no errors if amendment date now', async () => {
    const today = new Date();

    const todayDay = format(today, 'dd');
    const todayMonth = format(today, 'MM');
    const todayYear = format(today, 'yyyy');

    const body = {
      'amendment-request-date-day': todayDay.toString(),
      'amendment-request-date-month': todayMonth.toString(),
      'amendment-request-date-year': todayYear.toString(),
    };

    const mockFacility = {
      _id: '12345',
      facilitySnapshot: {
        _id: '12345',
        dealId: '4567',
        dates: {
          inclusionNoticeReceived: 1650538933299,
        },
      },
      amendments: [],
    };

    const result = await requestDateValidation.amendmentRequestDateValidation(body, mockFacility);

    const expected = {
      amendmentRequestDate: result.amendmentRequestDate,
      errorsObject: {
        errors: {
          errorSummary: [],
          fieldErrors: {},

        },
        amendmentRequestDateDay: todayDay.toString(),
        amendmentRequestDateMonth: todayMonth.toString(),
        amendmentRequestDateYear: todayYear.toString(),
      },
      amendmentRequestDateErrors: [],
    };

    expect(result).toEqual(expected);
  });
});
