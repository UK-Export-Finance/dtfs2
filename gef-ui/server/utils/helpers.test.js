import {
  userToken,
  isObject,
  validationErrorHandler,
  isEmpty,
  mapSummaryList,
  apiErrorHandler,
  isTrueSet,
  stringToBoolean,
  isNotice,
  isUkefReviewAvailable,
  isUkefReviewPositive,
  getUTCDate,
  getEpoch,
  pastDate,
  futureDateInRange,
  getFacilityCoverStartDate,
  getIssuedFacilitiesAsArray,
  coverDatesConfirmed,
  makerCanReSubmit,
} from './helpers';
import CONSTANTS from '../constants';

const MOCK_REQUEST = {
  username: 'BANK1_MAKER1',
  firstname: 'ABC',
  surname: 'DEF',
  email: 'test',
  roles: ['maker'],
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
    emails: [
      'maker1@ukexportfinance.gov.uk',
      'checker1@ukexportfinance.gov.uk',
    ],
    companiesHouseNo: 'UKEF0001',
    partyUrn: '00318345',
  },
  timezone: 'Europe/London',
  lastLogin: '1638791497263',
  'user-status': 'active',
  _id: '619bae3467cc7c002069fc1e',
};

const MOCK_DEAL = {
  _id: '61a7710b2ae62b0013dae687',
  dealType: 'GEF',
  userId: '619bae3467cc7c002069fc1e',
  status: CONSTANTS.DEAL_STATUS.BANK_CHECK,
  bankId: '9',
  eligibility: {
    criteria: [],
    updatedAt: 1638535562287,
    status: CONSTANTS.DEAL_STATUS.COMPLETED,
  },
  bankInternalRefName: 'abc',
  mandatoryVersionId: null,
  createdAt: 1638363403942,
  updatedAt: 1638983294975,
  submissionType: 'Manual Inclusion Application',
  submissionCount: 1,
  submissionDate: '1638363716309',
  supportingInformation: {
    manualInclusion: [],
    securityDetails: {},
    status: CONSTANTS.DEAL_STATUS.IN_PROGRESS,
    requiredFields: [],
  },
  ukefDealId: '0030113304',
  checkerId: '619bae3467cc7c002069fc21',
  editedBy: ['619bae3467cc7c002069fc1e'],
  additionalRefName: null,
  facilitiesUpdated: 1638542220497,
  comments: [],
  previousStatus: CONSTANTS.DEAL_STATUS.UKEF_IN_PROGRESS,
  ukefDecision: [],
  ukefDecisionAccepted: true,
  id: '61a7710b2ae62b0013dae687',
  exporter: { status: CONSTANTS.DEAL_STATUS.COMPLETED, details: [], validation: [] },
  facilities: { status: CONSTANTS.DEAL_STATUS.COMPLETED, items: [] },
  exporterStatus: { text: 'Completed', class: 'govuk-tag--green', code: 'COMPLETED' },
  eligibilityCriteriaStatus: { text: 'Completed', class: 'govuk-tag--green', code: 'COMPLETED' },
  facilitiesStatus: { text: 'Completed', class: 'govuk-tag--green', code: 'COMPLETED' },
  supportingInfoStatus: { text: 'Completed', class: 'govuk-tag--green', code: 'COMPLETED' },
  canSubmit: false,
  checkerCanSubmit: false,
  maker: {
    username: 'BANK1_MAKER1',
    firstname: 'ABC',
    surname: 'DEF',
    email: 'test',
    roles: [],
    bank: {},
    timezone: 'Europe/London',
    lastLogin: '1638807320335',
    'user-status': 'active',
    _id: '619bae3467cc7c002069fc1e',
  },
  checker: {
    username: 'BANK1_CHECKER1',
    firstname: 'DEF',
    surname: 'GHJ',
    email: 'test2',
    roles: ['maker'],
    bank: {},
    timezone: 'Europe/London',
    lastLogin: '1638964634607',
    'user-status': 'active',
    _id: '619bae3467cc7c002069fc21',
  },
};

const MOCK_FACILITY = {
  items: [
    {
      status: CONSTANTS.DEAL_STATUS.COMPLETED,
      details: {
        _id: '61a7714f2ae62b0013dae689',
        dealId: '61a7710b2ae62b0013dae687',
        type: 'CASH',
        hasBeenIssued: true,
        name: 'Facility one',
        shouldCoverStartOnSubmission: false,
        coverStartDate: '2021-12-03T00:00:00.000Z',
        coverEndDate: '2040-01-01T00:00:00.000Z',
        monthsOfCover: null,
        details: [],
        detailsOther: '',
        currency: 'GBP',
        value: 1000,
        coverPercentage: 80,
        interestPercentage: 1,
        paymentType: 'IN_ADVANCE_MONTHLY',
        createdAt: 1638363471661,
        updatedAt: 1638446928711,
        ukefExposure: 800,
        guaranteeFee: 0.9,
        submittedAsIssuedDate: '1638363717231',
        ukefFacilityId: '0030113306',
        feeType: 'in advance',
        feeFrequency: 'Monthly',
        dayCountBasis: 360,
        coverDateConfirmed: null,
      },
      validation: { required: [] },
    },
    {
      status: CONSTANTS.DEAL_STATUS.COMPLETED,
      details: {
        _id: '61a771cc2ae62b0013dae68a',
        dealId: '61a7710b2ae62b0013dae687',
        type: 'CASH',
        hasBeenIssued: true,
        name: 'Facility two',
        shouldCoverStartOnSubmission: true,
        coverStartDate: 1638403200000,
        coverEndDate: '2030-01-01T00:00:00.000Z',
        monthsOfCover: null,
        details: [],
        detailsOther: '',
        currency: 'GBP',
        value: 2000,
        coverPercentage: 80,
        interestPercentage: 1,
        paymentType: 'IN_ADVANCE_MONTHLY',
        createdAt: 1638363596947,
        updatedAt: 1638442632540,
        ukefExposure: 1600,
        guaranteeFee: 0.9,
        submittedAsIssuedDate: '1638363717231',
        ukefFacilityId: '0030113305',
        feeType: 'in advance',
        feeFrequency: 'Monthly',
        dayCountBasis: 365,
        coverDateConfirmed: true,
      },
      validation: { required: [] },
    },
  ],
};

describe('userToken()', () => {
  it('returns the correct user token', () => {
    const MOCK_REQ = {
      session: {
        userToken: '1234',
      },
    };

    expect(userToken(MOCK_REQ)).toEqual('1234');
  });
});

describe('isObject()', () => {
  it('returns the correct boolean', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject('')).toBe(false);
    expect(isObject(1)).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(false)).toBe(false);
  });
});

describe('apiErrorHandler', () => {
  it('returns a request time out error', () => {
    expect(() => apiErrorHandler({ code: 'ECONNABORTED' })).toThrow('Request timed out.');
  });

  it('returns the entire response object if there is a validation error', () => {
    const mockResponse = {
      response: {
        status: 422,
        data: [],
      },
    };
    expect(apiErrorHandler(mockResponse)).toEqual(mockResponse.response);
  });

  it('returns a standard error', () => {
    const mockResponse = {
      response: {
        status: 301,
        statusText: 'Error message',
      },
    };
    expect(() => apiErrorHandler(mockResponse)).toThrow('Error message');
  });
});

describe('validationErrorHandler()', () => {
  it('converts an error object into the correct validation errors', () => {
    const mockedError = {
      errRef: 'abc',
      errMsg: 'message',
    };

    expect(validationErrorHandler(mockedError)).toEqual({
      errorSummary: [{
        text: 'message',
        href: '#abc',
      }],
      fieldErrors: {
        abc: {
          text: 'message',
        },
      },
    });
  });

  it('passing a `href` arguments adds it before the #hash', () => {
    const mockedError = {
      errRef: 'abc',
      errMsg: 'message',
    };
    expect(validationErrorHandler(mockedError, 'my-link')).toEqual({
      errorSummary: [{
        text: 'message',
        href: 'my-link#abc',
      }],
      fieldErrors: {
        abc: {
          text: 'message',
        },
      },
    });
  });

  it('returns `false`, if no arguments are passed', () => {
    expect(validationErrorHandler()).toBeFalsy();
    expect(validationErrorHandler(null)).toBeFalsy();
    expect(validationErrorHandler(undefined)).toBeFalsy();
    expect(validationErrorHandler('')).toBeFalsy();
  });

  it('accepts errors as an array', () => {
    const mockedError = [
      {
        errRef: 'abc',
        errMsg: 'message',
      },
      {
        errRef: 'xyz',
        errMsg: 'message two',
      },
    ];
    expect(validationErrorHandler(mockedError)).toEqual({
      errorSummary: [
        {
          text: 'message',
          href: '#abc',
        },
        {
          text: 'message two',
          href: '#xyz',
        },
      ],
      fieldErrors: {
        abc: {
          text: 'message',
        },
        xyz: {
          text: 'message two',
        },
      },
    });
  });
  it('adds subField errors for things like dates', () => {
    const mockedError = [
      {
        errRef: 'abc',
        errMsg: 'message',
        subFieldErrorRefs: ['ref1', 'ref2'],
      },
      {
        errRef: 'xyz',
        errMsg: 'message two',
      },
    ];
    expect(validationErrorHandler(mockedError)).toEqual({
      errorSummary: [
        {
          text: 'message',
          href: '#abc',
        },
        {
          text: 'message two',
          href: '#xyz',
        },
      ],
      fieldErrors: {
        abc: {
          text: 'message',
        },
        xyz: {
          text: 'message two',
        },
        ref1: {
          text: 'message',
        },
        ref2: {
          text: 'message',
        },
      },
    });
  });
});

describe('isEmpty()', () => {
  it('returns True if the Value or Object is empty', () => {
    expect(isEmpty(null)).toBeTruthy();
    expect(isEmpty('')).toBeTruthy();
    expect(isEmpty({ foo: '' })).toBeTruthy();
    expect(isEmpty({ foo: null })).toBeTruthy();
    expect(isEmpty({ foo: 'Hello' })).toBeFalsy();
    expect(isEmpty({
      foo: {
        bar: null,
        foo: null,
      },
    })).toBeTruthy();
    expect(isEmpty({
      foo: {
        bar: 'Text',
        foo: null,
      },
    })).toBeFalsy();
  });
});

describe('mapSummaryList()', () => {
  const MockedData = () => ({
    details: {
      id: '123456',
    },
    validation: {
      required: [],
    },
  });

  const MockedDisplayItems = () => [
    {
      label: 'Id',
      id: 'id',
    },
  ];

  it('returns an empty array if Data object is empty ', () => {
    expect(mapSummaryList({})).toEqual([]);
    expect(mapSummaryList(null)).toEqual([]);
    expect(mapSummaryList(undefined)).toEqual([]);
  });

  it('returns an array populated by the correct properties', () => {
    const mockedData = MockedData();
    const mockedDisplayItems = MockedDisplayItems();

    expect(mapSummaryList(mockedData, mockedDisplayItems)).toEqual([{ actions: { items: [] }, key: { text: 'Id' }, value: { text: '123456' } }]);
  });

  it('returns populated items array if href property is required', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();
    mockedDisplayItems[0].href = '/test';
    const { items } = mapSummaryList(mockedData, mockedDisplayItems)[0].actions;
    expect(items.length).toEqual(1);
  });

  it('returns the correct link label if href has been required', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();
    mockedDisplayItems[0].href = '/test';
    const item = mapSummaryList(mockedData, mockedDisplayItems)[0].actions.items[0];
    expect(item).toEqual(expect.objectContaining({ href: '/test', text: 'Change' }));
    mockedData.details.id = null;
    const item2 = mapSummaryList(mockedData, mockedDisplayItems)[0].actions.items[0];
    expect(item2.text).toEqual('Add');
  });

  it('returns the `Required` html element if corresponding dataset is required', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedData.details.id = null;
    mockedData.validation.required = ['id'];
    const { html } = mapSummaryList(mockedData, mockedDisplayItems)[0].value;
    expect(html).toMatch('required');
  });

  it('returns a long dash if value is empty and is NOT required', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedData.details.id = null;
    const { text } = mapSummaryList(mockedData, mockedDisplayItems)[0].value;
    expect(text).toMatch('—');
  });

  it('returns a long dash if Object contains only null values', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedData.details.address = {};
    mockedData.details.address.line1 = null;
    mockedData.details.address.line2 = null;
    mockedDisplayItems.slice(1);
    mockedDisplayItems[0].label = 'Address';
    mockedDisplayItems[0].id = 'address';
    const { text } = mapSummaryList(mockedData, mockedDisplayItems)[0].value;
    expect(text).toMatch('—');
  });

  it('returns an unordered list if property contains an object', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedData.details.address = {};
    mockedData.details.address.line1 = 'Test Road';
    mockedData.details.address.line2 = null;
    mockedDisplayItems.slice(1);
    mockedDisplayItems[0].label = 'Address';
    mockedDisplayItems[0].id = 'address';

    const { html } = mapSummaryList(mockedData, mockedDisplayItems)[0].value;
    expect(html).toEqual('<ul class="is-unstyled"><li>Test Road</li></ul>');
  });

  it('returns an unordered list with Provided on details if property contains an object', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();
    mockedData.details.details = ['OTHER'];
    mockedData.details.detailsOther = 'Other text';
    mockedDisplayItems.slice(1);
    mockedDisplayItems[0].isDetails = true;
    mockedDisplayItems[0].label = 'Provided on';
    mockedDisplayItems[0].id = 'details';

    const other = mapSummaryList(mockedData, mockedDisplayItems)[0].value;
    expect(other.html).toEqual('<ul class="is-unstyled"><li>Other - Other text</li></ul>');
  });

  it('returns selected industry ', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedData.details.selectedIndustry = {
      code: '1017',
      name: 'Arts, entertainment and recreation',
      class: {
        code: '90030',
        name: 'Artistic creation',
      },
    };
    mockedDisplayItems[0].isIndustry = true;
    mockedDisplayItems[0].id = 'selectedIndustry';

    const { html } = mapSummaryList(mockedData, mockedDisplayItems)[0].value;
    expect(html).toEqual('Arts, entertainment and recreation<br>Artistic creation');
  });

  it('returns `null` if value is undefined', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedData.details.id = '123';
    mockedDisplayItems[0].id = 'abc';

    const response = mapSummaryList(mockedData, mockedDisplayItems)[0];
    expect(response).toEqual(null);
  });

  it('returns a value with currency', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedDisplayItems[0].id = 'price';
    mockedDisplayItems[0].isCurrency = true;

    mockedData.details.price = 200;
    mockedData.details.currency = 'GBP';

    const { text } = mapSummaryList(mockedData, mockedDisplayItems)[0].value;
    expect(text).toEqual('200 GBP');
  });

  it('returns a value with a prefix', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedDisplayItems[0].id = 'price';
    mockedDisplayItems[0].prefix = '£';

    mockedData.details.price = 200;

    const { text } = mapSummaryList(mockedData, mockedDisplayItems)[0].value;
    expect(text).toEqual('£200');
  });

  it('returns a value with a suffix', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedDisplayItems[0].id = 'percentage';
    mockedDisplayItems[0].suffix = '%';

    mockedData.details.percentage = 15;

    const { text } = mapSummaryList(mockedData, mockedDisplayItems)[0].value;
    expect(text).toEqual('15%');
  });

  it('alters the value depending on the `method` passed', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const reverseFunction = (val) => val.split('').reverse().join('');

    mockedDisplayItems[0].id = 'reverse';
    mockedDisplayItems[0].method = (callback) => reverseFunction(callback);

    mockedData.details.reverse = 'abcd';
    const { text } = mapSummaryList(mockedData, mockedDisplayItems)[0].value;
    expect(text).toEqual('dcba');
  });
});

describe('isTrueSet()', () => {
  it('returns null if value is not a string', () => {
    expect(isTrueSet(null)).toBe(null);
    expect(isTrueSet(10)).toBe(null);
    expect(isTrueSet('')).toBe(null);
    expect(isTrueSet(true)).toBe(null);
    expect(isTrueSet(false)).toBe(null);
    expect(isTrueSet(undefined)).toBe(null);
  });

  it('returns true boolean if string value is equal to `true`', () => {
    expect(isTrueSet('true')).toBe(true);
  });

  it('returns false boolean if string value is equal to `false`', () => {
    expect(isTrueSet('false')).toBe(false);
  });
});

describe('isNotice()', () => {
  it('Should return TRUE for any `Notice` submission type i.e. MIN or AIN', () => {
    expect(isNotice('Manual inclusion notice')).toEqual(true);
  });

  it('Should return FALSE for any `Application` submission type i.e. MIA', () => {
    expect(isNotice('Manual inclusion application')).toEqual(false);
  });

  it('Should return FALSE for any `Application` submission type i.e. MIA with mixed case', () => {
    expect(isNotice('manUAL InClUsIoN APPLICATION')).toEqual(false);
  });
});

describe('isUkefReviewAvailable()', () => {
  it('Should return TRUE for application with UKEF_APPROVED_WITH_CONDITIONS, UKEF_APPROVED_WITHOUT_CONDITIONS and UKEF_REFUSED status', () => {
    expect(isUkefReviewAvailable(CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS)).toEqual(true);
  });

  it('Should return FALSE for application with non UKEF_APPROVED_WITH_CONDITIONS, UKEF_APPROVED_WITHOUT_CONDITIONS and UKEF_REFUSED status', () => {
    expect(isUkefReviewAvailable(CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED)).toEqual(false);
  });
});

describe('isUkefReviewPositive()', () => {
  it('Should return TRUE for application with UKEF_APPROVED_WITHOUT_CONDITIONS status', () => {
    expect(isUkefReviewPositive(CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS)).toEqual(true);
  });

  it('Should return TRUE for application with UKEF_APPROVED_WITH_CONDITIONS status', () => {
    expect(isUkefReviewPositive(CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS)).toEqual(true);
  });

  it('Should return FALSE for application with UKEF_REFUSED status', () => {
    expect(isUkefReviewPositive(CONSTANTS.DEAL_STATUS.UKEF_REFUSED)).toEqual(false);
  });
});

describe('stringToBoolean', () => {
  it('returns `true` string as boolean', () => {
    expect(stringToBoolean('true')).toEqual(true);
  });

  it('returns `false` string as boolean', () => {
    expect(stringToBoolean('false')).toEqual(false);
  });
});

describe('getUTCDate', () => {
  it('Should return EPOCH for the current date time', () => {
    const date = new Date();
    const expected = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
    expect(getUTCDate()).toEqual(expected);
  });
});

describe('getEpoch', () => {
  it('Should return EPOCH for the specified day, month and year custom date object', () => {
    expect(getEpoch({ year: 1970, month: 1, day: 1 })).toEqual(0);
  });
  it('Should return EPOCH for the specified day, month and year custom date object', () => {
    expect(getEpoch({ year: 2021, month: 1, day: 1 })).toEqual(1609459200000);
  });
});

describe('pastDate', () => {
  it('Should return TRUE for the specified date', () => {
    expect(pastDate({ day: 1, month: 1, year: 1970 })).toEqual(true);
  });
  it('Should return TRUE for the specified date', () => {
    expect(pastDate({ day: 20, month: 9, year: 1989 })).toEqual(true);
  });
  it('Should return FALSE for the specified date', () => {
    const date = new Date();
    expect(pastDate({ day: date.getDate(), month: (date.getMonth() + 1), year: date.getFullYear() })).toEqual(false);
  });
});

describe('futureDateInRange', () => {
  it('Should return FALSE for the specified day and range days', () => {
    expect(futureDateInRange({ day: 1, month: 1, year: 1970 }, 30)).toEqual(false);
  });
  it('Should return FALSE for the specified day and range days', () => {
    expect(futureDateInRange({ day: 1, month: 1, year: 9999 }, 30)).toEqual(false);
  });
  it('Should return TRUE for the specified day and range days', () => {
    const date = new Date();
    expect(futureDateInRange({ day: date.getDate(), month: (date.getMonth() + 1), year: date.getFullYear() }, 365)).toEqual(true);
  });

  describe('getFacilityCoverStartDate', () => {
    it('Should return expected date object for mock facility', () => {
      const expected = {
        date: '2',
        month: '12',
        year: '2021',
      };
      expect(getFacilityCoverStartDate(MOCK_FACILITY.items[1])).toEqual(expected);
    });

    it('Should return expected date object for mock facility', () => {
      const expected = {
        date: '3',
        month: '12',
        year: '2021',
      };
      expect(getFacilityCoverStartDate(MOCK_FACILITY.items[0])).toEqual(expected);
    });
  });
});

describe('getIssuedFacilitiesAsArray', () => {
  it('Should return the expected facilities object from mock facilities array where the facility date has not been confirmed by the bank', () => {
    const expected = [
      [
        { text: 'Facility one' },
        { text: '0030113306' },
        { text: 'GBP 1,000.00' },
        { html: "<a href = '/gef/application-details/61a7710b2ae62b0013dae687/61a7714f2ae62b0013dae689/confirm-cover-start-date' class = 'govuk-button govuk-button--secondary govuk-!-margin-0'>Update</a>" },
      ],
    ];
    expect(getIssuedFacilitiesAsArray(MOCK_FACILITY)).toEqual(expected);
  });

  it('Should return the empty array', () => {
    const expected = [];
    MOCK_FACILITY.items[0].details.hasBeenIssued = false;
    expect(getIssuedFacilitiesAsArray(MOCK_FACILITY)).toEqual(expected);
  });
});

describe('coverDatesConfirmed', () => {
  it('Should return FALSE as one of the facility\'s cover date has not been confirmed', () => {
    MOCK_FACILITY.items[0].details.hasBeenIssued = true;
    expect(coverDatesConfirmed(MOCK_FACILITY)).toEqual(false);
  });
});

describe('makerCanReSubmit', () => {
  it('Should return FALSE since the deal status is BANK_CHECK', () => {
    expect(makerCanReSubmit(MOCK_REQUEST, MOCK_DEAL)).toEqual(false);
  });
  it('Should return TRUE as the deal status has been changed to UKEF_APPROVED_WITH_CONDITIONS', () => {
    MOCK_DEAL.status = CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS;
    expect(makerCanReSubmit(MOCK_REQUEST, MOCK_DEAL)).toEqual(true);
  });
  it('Should return FALSE as the Maker is from a different Bank', () => {
    MOCK_REQUEST.bank.id = 10;
    expect(makerCanReSubmit(MOCK_REQUEST, MOCK_DEAL)).toEqual(false);
  });
  it('Should return FALSE as the user does not have `maker` role', () => {
    MOCK_REQUEST.roles = ['checker'];
    expect(makerCanReSubmit(MOCK_REQUEST, MOCK_DEAL)).toEqual(false);
  });
  it('Should return FALSE as the Application maker is from a different current logged-in maker', () => {
    MOCK_DEAL.bankId = 1;
    expect(makerCanReSubmit(MOCK_REQUEST, MOCK_DEAL)).toEqual(false);
  });
});
