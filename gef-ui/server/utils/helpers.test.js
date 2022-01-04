/* eslint-disable max-len */
import moment from 'moment';
import {
  userToken,
  isObject,
  validationErrorHandler,
  isEmpty,
  mapSummaryList,
  apiErrorHandler,
  isTrueSet,
  stringToBoolean,
  getUTCDate,
  getEpoch,
  summaryItemsConditions,
  displayTaskComments,
} from './helpers';

import { makerCanReSubmit } from './deal-helpers';

import {
  MOCK_AIN_APPLICATION,
  MOCK_DEAL,
  MOCK_AIN_APPLICATION_ISSUED_ONLY,
  MOCK_AIN_APPLICATION_FALSE_COMMENTS,
} from './MOCKS/mock_applications';

import {
  MOCK_UNISSUED_FACILITY,
  MOCK_ISSUED_FACILITY,
  MOCK_ISSUED_FACILITY_UNCHANGED,
} from './MOCKS/mock_facilities';

import { MOCK_REQUEST } from './MOCKS/mock_requests';

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
      currency: { id: 'GBP' },
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

    expect(mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)).toEqual([{ actions: { items: [] }, key: { text: 'Id' }, value: { text: '123456' } }]);
  });

  it('returns populated items array if href property is required', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();
    mockedDisplayItems[0].href = '/test';
    const { items } = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].actions;
    expect(items.length).toEqual(1);
  });

  it('returns the correct link label if href has been required', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();
    mockedDisplayItems[0].href = '/test';
    const item = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].actions.items[0];
    expect(item).toEqual(expect.objectContaining({ href: '/test', text: 'Change' }));
    mockedData.details.id = null;
    const item2 = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].actions.items[0];
    expect(item2.text).toEqual('Add');
  });

  it('returns the `Required` html element if corresponding dataset is required', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedData.details.id = null;
    mockedData.validation.required = ['id'];
    const { html } = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].value;
    expect(html).toMatch('required');
  });

  it('returns a long dash if value is empty and is NOT required', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedData.details.id = null;
    const { text } = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].value;
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
    const { text } = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].value;
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

    const { html } = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].value;
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

    const other = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].value;
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

    const { html } = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].value;
    expect(html).toEqual('Arts, entertainment and recreation<br>Artistic creation');
  });

  it('returns `null` if value is undefined', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedData.details.id = '123';
    mockedDisplayItems[0].id = 'abc';

    const response = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0];
    expect(response).toEqual(null);
  });

  it('returns a value with currency', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedDisplayItems[0].id = 'price';
    mockedDisplayItems[0].isCurrency = true;

    mockedData.details.price = 200;
    mockedData.details.currency = { id: 'GBP' };

    const { text } = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].value;
    expect(text).toEqual('200 GBP');
  });

  it('returns a value with a prefix', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedDisplayItems[0].id = 'price';
    mockedDisplayItems[0].prefix = '£';

    mockedData.details.price = 200;

    const { text } = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].value;
    expect(text).toEqual('£200');
  });

  it('returns a value with a suffix', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedDisplayItems[0].id = 'percentage';
    mockedDisplayItems[0].suffix = '%';

    mockedData.details.percentage = 15;

    const { text } = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].value;
    expect(text).toEqual('15%');
  });

  it('alters the value depending on the `method` passed', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const reverseFunction = (val) => val.split('').reverse().join('');

    mockedDisplayItems[0].id = 'reverse';
    mockedDisplayItems[0].method = (callback) => reverseFunction(callback);

    mockedData.details.reverse = 'abcd';
    const { text } = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].value;
    expect(text).toEqual('dcba');
  });

  it('coverStartDate should display as date when !startOnSubmission', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedDisplayItems[0].id = 'coverStartDate';
    mockedDisplayItems[0].method = (callback) => moment(callback)
      .format('D MMMM YYYY');

    mockedData.details.coverStartDate = '2021-12-20T00:00:00.000+00:00';
    const { text } = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].value;
    expect(text).toEqual('20 December 2021');
  });

  it('coverStartDate should display as text when startOnSubmission and !issueDate', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedDisplayItems[0].id = 'coverStartDate';
    mockedDisplayItems[0].method = (callback) => moment(callback)
      .format('D MMMM YYYY');
    mockedDisplayItems[0].shouldCoverStartOnSubmission = true;
    mockedDisplayItems[0].issueDate = null;

    mockedData.details.coverStartDate = '2021-12-20T00:00:00.000+00:00';
    const { text } = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].value;
    expect(text).toEqual('Date you submit the notice');
  });

  it('coverStartDate should display as date when startOnSubmission and issueDate', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    mockedDisplayItems[0].id = 'coverStartDate';
    mockedDisplayItems[0].method = (callback) => moment(callback)
      .format('D MMMM YYYY');
    mockedDisplayItems[0].shouldCoverStartOnSubmission = true;
    mockedDisplayItems[0].issueDate = '2021-12-25T00:00:00.000+00:00';

    mockedData.details.coverStartDate = null;
    mockedData.details.shouldCoverStartOnSubmission = true;
    mockedData.details.issueDate = '2021-12-25T00:00:00.000+00:00';

    const { text } = mapSummaryList(mockedData, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST)[0].value;
    expect(text).toEqual('25 December 2021');
  });

  /**
   * This mapping returns back the rows on the facilities table.
   * Testing when changing facility from unissued to issued with AIN
   * ensures that value and issued field cannot be editted on preview page
  */
  describe('should not be able to change certain fields on facility which has changed to issued', () => {
    it('cannot change value row', () => {
    // 'key' for value row
      const MockedDisplayItemsIssued = () => [
        {
          label: 'Facility value',
          id: 'value',
        },
      ];
      const mockedDisplayItems = MockedDisplayItemsIssued();

      const { text } = mapSummaryList(MOCK_ISSUED_FACILITY, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST, true)[0].actions.items[0];
      // should be blank so cannot change
      expect(text).toEqual('');
    });
    it('cannot change issued (back to unissued)', () => {
      // 'key' for value row
      const MockedDisplayItemsIssued = () => [
        {
          label: 'Stage',
          id: 'hasBeenIssued',
        },
      ];
      const mockedDisplayItems = MockedDisplayItemsIssued();

      const { text } = mapSummaryList(MOCK_ISSUED_FACILITY, mockedDisplayItems, MOCK_AIN_APPLICATION, MOCK_REQUEST, true)[0].actions.items[0];
      // should be blank so cannot change
      expect(text).toEqual('');
    });
  });

  /**
   * This mapping returns back the rows on the facilities table.
   * Testing when changing already changed facility to issued with AIN
   * ensures that name, coverStartDate and coverEndDate fields can be editted on preview page
  */
  describe('maps and returns summary list with change button for relevant rows for facilities changed to issued on preview page', () => {
    it('name', () => {
    // 'key' for value row
      const MockedDisplayItemsName = () => [
        {
          label: 'Name',
          id: 'name',
        },
      ];
      const mockedDisplayItemsName = MockedDisplayItemsName();

      const { text } = mapSummaryList(MOCK_ISSUED_FACILITY, mockedDisplayItemsName, MOCK_AIN_APPLICATION, MOCK_REQUEST, true)[0].actions.items[0];
      // should be allowed to change so should display change
      expect(text).toEqual('Change');
    });
    it('coverStartDate', () => {
      const MockedDisplayItemsStartDate = () => [
        {
          label: 'Cover start date',
          id: 'coverStartDate',
        },
      ];
      const mockedDisplayItemsStartDate = MockedDisplayItemsStartDate();

      const { text } = mapSummaryList(MOCK_ISSUED_FACILITY, mockedDisplayItemsStartDate, MOCK_AIN_APPLICATION, MOCK_REQUEST, true)[0].actions.items[0];
      // should be allowed to change so should display change
      expect(text).toEqual('Change');
    });
    it('coverEndDate', () => {
      const MockedDisplayItemsStartEnd = () => [
        {
          label: 'Cover end date',
          id: 'coverEndDate',
        },
      ];
      const mockedDisplayItemsEnd = MockedDisplayItemsStartEnd();

      const { text } = mapSummaryList(MOCK_ISSUED_FACILITY, mockedDisplayItemsEnd, MOCK_AIN_APPLICATION, MOCK_REQUEST, true)[0].actions.items[0];
      // should be allowed to change so should display change
      expect(text).toEqual('Change');
    });
  });

  /**
   * This mapping returns back the rows on the facilities table.
   * Testing when changing facility from unissued to issued with AIN
   * ensures that name, coverStartDate and coverEndDate fields cannot be editted yet on preview page
  */
  describe('maps and returns summary list with change button for relevant rows for facilities changed to issued on preview page', () => {
    it('name', () => {
      // 'key' for value row
      const MockedDisplayItemsName = () => [
        {
          label: 'Name',
          id: 'name',
        },
      ];
      const mockedDisplayItemsName = MockedDisplayItemsName();

      const { text } = mapSummaryList(MOCK_UNISSUED_FACILITY, mockedDisplayItemsName, MOCK_AIN_APPLICATION, MOCK_REQUEST, true)[0].actions.items[0];
      // should be allowed to change so should display change
      expect(text).toEqual('');
    });
    it('coverStartDate', () => {
      const MockedDisplayItemsStartDate = () => [
        {
          label: 'Cover start date',
          id: 'coverStartDate',
        },
      ];
      const mockedDisplayItemsStartDate = MockedDisplayItemsStartDate();

      const { text } = mapSummaryList(MOCK_UNISSUED_FACILITY, mockedDisplayItemsStartDate, MOCK_AIN_APPLICATION, MOCK_REQUEST, true)[0].actions.items[0];
      // should be allowed to change so should display change
      expect(text).toEqual('');
    });
    it('coverEndDate', () => {
      const MockedDisplayItemsStartEnd = () => [
        {
          label: 'Cover end date',
          id: 'coverEndDate',
        },
      ];
      const mockedDisplayItemsEnd = MockedDisplayItemsStartEnd();

      const { text } = mapSummaryList(MOCK_UNISSUED_FACILITY, mockedDisplayItemsEnd, MOCK_AIN_APPLICATION, MOCK_REQUEST, true)[0].actions.items[0];
      // should be allowed to change so should display change
      expect(text).toEqual('');
    });
  });

  /**
   * This mapping returns back the rows on the facilities table.
   * Testing when facility already issued with AIN
   * ensures that name, coverStartDate and coverEndDate hasBeenIssued fields cannot be editted on preview page
  */
  describe('facility has already been issued (and not changed)', () => {
    it('name', () => {
      // 'key' for value row
      const MockedDisplayItemsName = () => [
        {
          label: 'Name',
          id: 'name',
        },
      ];
      const mockedDisplayItemsName = MockedDisplayItemsName();

      const result = mapSummaryList(MOCK_ISSUED_FACILITY_UNCHANGED, mockedDisplayItemsName, MOCK_AIN_APPLICATION_ISSUED_ONLY, MOCK_REQUEST, true)[0].actions.items;
      const response = [];
      expect(result).toEqual(response);
    });

    it('coverStartDate', () => {
      const MockedDisplayItemsStartDate = () => [
        {
          label: 'Cover start date',
          id: 'coverStartDate',
        },
      ];
      const mockedDisplayItemsStartDate = MockedDisplayItemsStartDate();

      const result = mapSummaryList(MOCK_ISSUED_FACILITY_UNCHANGED, mockedDisplayItemsStartDate, MOCK_AIN_APPLICATION_ISSUED_ONLY, MOCK_REQUEST, true)[0].actions.items;
      const response = [];
      expect(result).toEqual(response);
    });

    it('coverEndDate', () => {
      const MockedDisplayItemsStartEnd = () => [
        {
          label: 'Cover end date',
          id: 'coverEndDate',
        },
      ];
      const mockedDisplayItemsEnd = MockedDisplayItemsStartEnd();

      const result = mapSummaryList(MOCK_ISSUED_FACILITY_UNCHANGED, mockedDisplayItemsEnd, MOCK_AIN_APPLICATION_ISSUED_ONLY, MOCK_REQUEST, true)[0].actions.items;
      const response = [];
      expect(result).toEqual(response);
    });

    it('hasBeenIssued', () => {
      const MockedDisplayItemsIssued = () => [
        {
          label: 'Stage',
          id: 'hasBeenIssued',
        },
      ];
      const mockedDisplayItemsIssued = MockedDisplayItemsIssued();

      const result = mapSummaryList(MOCK_ISSUED_FACILITY_UNCHANGED, mockedDisplayItemsIssued, MOCK_AIN_APPLICATION_ISSUED_ONLY, MOCK_REQUEST, true)[0].actions.items;
      const response = [];
      expect(result).toEqual(response);
    });
  });

  it('Stage row should show Add', () => {
    // 'key' for value row
    const MockedDisplayItemsStage = () => [
      {
        label: 'Stage',
        id: 'hasBeenIssued',
      },
    ];
    const mockedDisplayItemsName = MockedDisplayItemsStage();

    const { text } = mapSummaryList(MOCK_UNISSUED_FACILITY, mockedDisplayItemsName, MOCK_AIN_APPLICATION, MOCK_REQUEST, true)[0].actions.items[0];
    // should be allowed to change so should display change
    expect(text).toEqual('Change');
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

describe('summaryItemsConditions()', () => {
  it('should return an empty array for name', () => {
    const item = {
      label: 'Name',
      id: 'name',
    };

    const summaryItemsObj = {
      preview: true,
      item,
      details: MOCK_ISSUED_FACILITY_UNCHANGED,
      app: MOCK_AIN_APPLICATION_ISSUED_ONLY,
      user: MOCK_REQUEST,
      data: MOCK_AIN_APPLICATION_ISSUED_ONLY.facilities.items[0],
    };
    const result = summaryItemsConditions(summaryItemsObj);

    const expected = [];

    expect(result).toEqual(expected);
  });

  describe('if changed to issued', () => {
    it('Should be able to change name', () => {
      const item = {
        label: 'Name',
        id: 'name',
      };

      const summaryItemsObj = {
        preview: true,
        item,
        details: MOCK_ISSUED_FACILITY,
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
        data: MOCK_AIN_APPLICATION.facilities.items[1],
      };

      const { text } = summaryItemsConditions(summaryItemsObj)[0];
      expect(text).toEqual('Change');
    });

    it('Should be able to change coverStartDate', () => {
      const item = {
        label: 'Cover start date',
        id: 'coverStartDate',
      };

      const summaryItemsObj = {
        preview: true,
        item,
        details: MOCK_ISSUED_FACILITY,
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
        data: MOCK_AIN_APPLICATION.facilities.items[1],
      };

      const { text } = summaryItemsConditions(summaryItemsObj)[0];
      expect(text).toEqual('Change');
    });

    it('Should be able to change coverEndDate', () => {
      const item = {
        label: 'Cover end date',
        id: 'coverEndDate',
      };

      const summaryItemsObj = {
        preview: true,
        item,
        details: MOCK_ISSUED_FACILITY,
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
        data: MOCK_AIN_APPLICATION.facilities.items[1],
      };

      const { text } = summaryItemsConditions(summaryItemsObj)[0];
      expect(text).toEqual('Change');
    });

    it('Should not be able to change issued', () => {
      const item = {
        label: 'Stage',
        id: 'hasBeenIssued',
      };

      const summaryItemsObj = {
        preview: true,
        item,
        details: MOCK_ISSUED_FACILITY,
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
        data: MOCK_AIN_APPLICATION.facilities.items[1],
      };

      const { text } = summaryItemsConditions(summaryItemsObj)[0];
      expect(text).toEqual('');
    });
  });

  describe('if not changed and unissued', () => {
    it('Should not be able to change name', () => {
      const item = {
        label: 'Name',
        id: 'name',
      };

      const summaryItemsObj = {
        preview: true,
        item,
        details: MOCK_UNISSUED_FACILITY,
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
        data: MOCK_AIN_APPLICATION.facilities.items[0],
      };

      const { text } = summaryItemsConditions(summaryItemsObj)[0];
      expect(text).toEqual('');
    });

    it('Should be able to change coverStartDate', () => {
      const item = {
        label: 'Cover start date',
        id: 'coverStartDate',
      };

      const summaryItemsObj = {
        preview: true,
        item,
        details: MOCK_UNISSUED_FACILITY,
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
        data: MOCK_AIN_APPLICATION.facilities.items[0],
      };

      const { text } = summaryItemsConditions(summaryItemsObj)[0];
      expect(text).toEqual('');
    });

    it('Should be able to change coverEndDate', () => {
      const item = {
        label: 'Cover end date',
        id: 'coverEndDate',
      };

      const summaryItemsObj = {
        preview: true,
        item,
        details: MOCK_UNISSUED_FACILITY,
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
        data: MOCK_AIN_APPLICATION.facilities.items[0],
      };

      const { text } = summaryItemsConditions(summaryItemsObj)[0];
      expect(text).toEqual('');
    });

    it('Should not be able to change issued', () => {
      const item = {
        label: 'Stage',
        id: 'hasBeenIssued',
      };

      const summaryItemsObj = {
        preview: true,
        item,
        details: MOCK_UNISSUED_FACILITY,
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
        data: MOCK_AIN_APPLICATION.facilities.items[0],
      };

      const { text } = summaryItemsConditions(summaryItemsObj)[0];
      expect(text).toEqual('Change');
    });
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
    MOCK_DEAL.bank = { id: 1 };
    expect(makerCanReSubmit(MOCK_REQUEST, MOCK_DEAL)).toEqual(false);
  });
});

describe('displayTaskComments()', () => {
  it('should return true if any conditions are true', () => {
    const result = displayTaskComments(MOCK_AIN_APPLICATION);

    expect(result).toEqual(true);
  });

  it('should return false if all conditions are false', () => {
    const result = displayTaskComments(MOCK_AIN_APPLICATION_FALSE_COMMENTS);

    expect(result).toEqual(false);
  });
});
