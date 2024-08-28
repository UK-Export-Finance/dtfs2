/* eslint-disable max-len */
import { format } from 'date-fns';
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
  pastDate,
  sameDate,
  futureDateInRange,
  displayChangeSupportingInfo,
  returnToMakerNoFacilitiesChanged,
  getCurrentTimePlusMinutes,
} from './helpers';

import { getFacilityCoverStartDate } from './facility-helpers';

import { MOCK_ISSUED_FACILITY, MOCK_FACILITY, MOCK_ISSUED_FACILITY_UNCHANGED, MOCK_UNISSUED_FACILITY } from './mocks/mock_facilities';

import { makerCanReSubmit } from './deal-helpers';

import {
  MOCK_AIN_APPLICATION,
  MOCK_AIN_APPLICATION_RETURN_MAKER,
  MOCK_AIN_APPLICATION_CHECKER,
  MOCK_BASIC_DEAL,
  MOCK_AIN_APPLICATION_ISSUED_ONLY,
  MOCK_AIN_APPLICATION_FALSE_COMMENTS,
  MOCK_AIN_APPLICATION_SUPPORTING_INFO,
  MOCK_AIN_APPLICATION_UNISSUED_ONLY,
} from './mocks/mock_applications';

import { MOCK_REQUEST } from './mocks/mock_requests';
import { CHECKER } from '../constants/roles';

const CONSTANTS = require('../constants');

const mockDisplayItems = {
  name: {
    label: 'name',
    id: 'name',
  },
  stage: {
    label: 'Stage',
    id: 'hasBeenIssued',
  },
  coverStartDate: {
    label: 'Cover start date',
    id: 'coverStartDate',
  },
  coverEndDate: {
    label: 'Cover end date',
    id: 'coverEndDate',
  },
  isUsingFacilityEndDate: {
    label: 'Has a facility end date',
    id: 'isUsingFacilityEndDate',
  },
  bankReviewDate: {
    label: 'Bank review date',
    id: 'bankReviewDate',
  },
  facilityEndDate: {
    label: 'Facility end date',
    id: 'facilityEndDate',
  },
  value: {
    label: 'Facility value',
    id: 'value',
  },
  hasBeenIssued: {
    label: 'Stage',
    id: 'hasBeenIssued',
  },
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
      errorSummary: [
        {
          text: 'message',
          href: '#abc',
        },
      ],
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
      errorSummary: [
        {
          text: 'message',
          href: 'my-link#abc',
        },
      ],
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
    expect(
      isEmpty({
        foo: {
          bar: null,
          foo: null,
        },
      }),
    ).toBeTruthy();
    expect(
      isEmpty({
        foo: {
          bar: 'Text',
          foo: null,
        },
      }),
    ).toBeFalsy();
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
      href: 'href',
    },
  ];

  it('returns an empty array if Data object is empty ', () => {
    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };
    expect(mapSummaryList(null, null, mapSummaryParams, null)).toEqual([]);
    expect(mapSummaryList(undefined, undefined, mapSummaryParams, undefined)).toEqual([]);
  });

  it('returns an array populated by the correct properties', () => {
    const mockedData = MockedData();
    const mockedDisplayItems = MockedDisplayItems();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    expect(mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)).toEqual([
      {
        actions: {
          items: [
            {
              href: 'href',
              text: 'Change',
              visuallyHiddenText: 'Id',
              attributes: {
                'data-cy': 'id-action',
              },
            },
          ],
        },
        key: { text: 'Id' },
        value: { text: '123456' },
      },
    ]);
  });

  it('returns populated items array if href property is required', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();
    mockedDisplayItems[0].href = '/test';

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    const { items } = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].actions;
    expect(items.length).toEqual(1);
  });

  it('returns the correct link label if href has been required', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();
    mockedDisplayItems[0].href = '/test';

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    const item = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].actions.items[0];
    expect(item).toEqual(expect.objectContaining({ href: '/test', text: 'Change' }));
    mockedData.details.id = null;
    const item2 = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].actions.items[0];
    expect(item2.text).toEqual('Add');
  });

  it('returns the `Required` html element if corresponding dataset is required', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    mockedData.details.id = null;
    mockedData.validation.required = ['id'];
    const { html } = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].value;
    expect(html).toMatch('required');
  });

  it('returns a long dash if value is empty and is NOT required', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    mockedData.details.id = null;
    const { text } = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].value;
    expect(text).toMatch('—');
  });

  it('returns a long dash if Object contains only null values', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    mockedData.details.address = {};
    mockedData.details.address.line1 = null;
    mockedData.details.address.line2 = null;
    mockedDisplayItems.slice(1);
    mockedDisplayItems[0].label = 'Address';
    mockedDisplayItems[0].id = 'address';
    const { text } = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].value;
    expect(text).toMatch('—');
  });

  it('returns an unordered list if property contains an object', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    mockedData.details.address = {};
    mockedData.details.address.line1 = 'Test Road';
    mockedData.details.address.line2 = null;
    mockedDisplayItems.slice(1);
    mockedDisplayItems[0].label = 'Address';
    mockedDisplayItems[0].id = 'address';

    const { html } = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].value;
    expect(html).toEqual('<ul class="is-unstyled"><li>Test Road</li></ul>');
  });

  it('returns an unordered list with Provided on details if property contains an object', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    mockedData.details.details = ['Other'];
    mockedData.details.detailsOther = 'Other text';
    mockedDisplayItems.slice(1);
    mockedDisplayItems[0].isDetails = true;
    mockedDisplayItems[0].label = 'Provided on';
    mockedDisplayItems[0].id = 'details';

    const other = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].value;
    expect(other.html).toEqual('<ul class="is-unstyled"><li>Other - Other text</li></ul>');
  });

  it('returns selected industry ', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

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

    const { html } = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].value;
    expect(html).toEqual('Arts, entertainment and recreation<br>Artistic creation');
  });

  it('returns `null` if value is undefined', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    mockedData.details.id = '123';
    mockedDisplayItems[0].id = 'abc';

    const response = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0];
    expect(response).toEqual(null);
  });

  it('returns a value with currency', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    mockedDisplayItems[0].id = 'price';
    mockedDisplayItems[0].isCurrency = true;

    mockedData.details.price = 200;
    mockedData.details.currency = { id: 'GBP' };

    const { text } = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].value;
    expect(text).toEqual('200 GBP');
  });

  it('returns a value with a prefix', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    mockedDisplayItems[0].id = 'price';
    mockedDisplayItems[0].prefix = '£';

    mockedData.details.price = 200;

    const { text } = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].value;
    expect(text).toEqual('£200');
  });

  it('returns a value with a suffix', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    mockedDisplayItems[0].id = 'percentage';
    mockedDisplayItems[0].suffix = '%';

    mockedData.details.percentage = 15;

    const { text } = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].value;
    expect(text).toEqual('15%');
  });

  it('alters the value depending on the `method` passed', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    const reverseFunction = (val) => val.split('').reverse().join('');

    mockedDisplayItems[0].id = 'reverse';
    mockedDisplayItems[0].method = (value) => reverseFunction(value);

    mockedData.details.reverse = 'com';
    const { text } = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].value;
    expect(text).toEqual('moc');
  });

  it('coverStartDate should display as date when !startOnSubmission', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    mockedDisplayItems[0].id = 'coverStartDate';
    mockedDisplayItems[0].method = (value) => {
      // input value is an ISO-8601 string with milliseconds (e.g '2024-02-14T00:00:00.000+00:00')
      const date = new Date(value);
      return format(date, 'd MMMM yyyy');
    };

    mockedData.details.coverStartDate = '2021-12-20T00:00:00.000+00:00';
    const { text } = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].value;
    expect(text).toEqual('20 December 2021');
  });

  it('coverStartDate should display as text when startOnSubmission and !issueDate', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    mockedDisplayItems[0].id = 'coverStartDate';
    mockedDisplayItems[0].method = (value) => {
      // input value is an ISO-8601 string with milliseconds (e.g '2024-02-14T00:00:00.000+00:00')
      const date = new Date(value);
      return format(date, 'd MMMM yyyy');
    };

    mockedDisplayItems[0].shouldCoverStartOnSubmission = true;
    mockedDisplayItems[0].issueDate = null;

    mockedData.details.coverStartDate = '2021-12-20T00:00:00.000+00:00';
    const { text } = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].value;
    expect(text).toEqual('Date you submit the notice');
  });

  it('coverStartDate should display as date when startOnSubmission and issueDate', () => {
    const mockedDisplayItems = MockedDisplayItems();
    const mockedData = MockedData();

    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    mockedDisplayItems[0].id = 'coverStartDate';
    mockedDisplayItems[0].method = (value) => {
      // input value is an ISO-8601 string with milliseconds (e.g '2024-02-14T00:00:00.000+00:00')
      const date = new Date(value);
      return format(date, 'd MMMM yyyy');
    };

    mockedDisplayItems[0].shouldCoverStartOnSubmission = true;
    mockedDisplayItems[0].issueDate = '2021-12-25T00:00:00.000+00:00';

    mockedData.details.coverStartDate = null;
    mockedData.details.shouldCoverStartOnSubmission = true;
    mockedData.details.issueDate = '2021-12-25T00:00:00.000+00:00';

    const { text } = mapSummaryList(mockedData, mockedDisplayItems, mapSummaryParams)[0].value;
    expect(text).toEqual('25 December 2021');
  });

  /**
   * This mapping returns back the rows on the facilities table.
   * Testing when changing facility from unissued to issued with AIN
   * ensures that value and issued field cannot be editted on preview page
   */
  describe('should not be able to change certain fields on facility which has changed to issued', () => {
    it('cannot change value row', () => {
      const mapSummaryParams = {
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
      };

      const actionItems = mapSummaryList(MOCK_ISSUED_FACILITY, [mockDisplayItems.value], mapSummaryParams, true)[0].actions.items;
      // should have class govuk-!-display-none so cannot change
      expect(actionItems).toEqual([
        {
          attributes: {
            'data-cy': `value-action`,
          },
          classes: 'govuk-!-display-none',
        },
      ]);
    });
    it('can change issued back to unissued', () => {
      const mapSummaryParams = {
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
      };

      const { text, href } = mapSummaryList(MOCK_ISSUED_FACILITY, [mockDisplayItems.hasBeenIssued], mapSummaryParams, true)[0].actions.items[0];

      expect(text).toEqual('Change');
      expect(href).toContain('/change-to-unissued');
    });
  });

  /**
   * This mapping returns back the rows on the facilities table.
   * Testing when changing already changed facility to issued with AIN
   * ensures that name, coverStartDate and coverEndDate fields can be editted on preview page
   */
  describe('maps and returns summary list with change button for relevant rows for facilities changed to issued on preview page', () => {
    it.each(['name', 'coverStartDate', 'coverEndDate', 'isUsingFacilityEndDate', 'bankReviewDate', 'facilityEndDate'])('%s', (id) => {
      const mapSummaryParams = {
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
      };

      const facility = {
        ...MOCK_ISSUED_FACILITY,
        details: {
          ...MOCK_ISSUED_FACILITY.details,
          isUsingFacilityEndDate: true,
          bankReviewDate: new Date().toISOString(),
          facilityEndDate: new Date().toISOString(),
        },
      };

      const { text } = mapSummaryList(facility, [mockDisplayItems[id]], mapSummaryParams, true)[0].actions.items[0];
      // should be allowed to change so should display change
      expect(text).toEqual('Change');
    });
  });

  /**
   * This mapping returns back the rows on the facilities table.
   * Testing when changing facility from unissued to issued with AIN
   * ensures that name, coverStartDate and coverEndDate fields cannot be editted yet on preview page
   */
  describe('maps and returns summary list with change button for relevant rows for facilities not changed to issued on preview page', () => {
    it.each(['name', 'coverStartDate', 'coverEndDate', 'isUsingFacilityEndDate', 'bankReviewDate', 'facilityEndDate'])('%s', (id) => {
      const facility = {
        ...MOCK_UNISSUED_FACILITY,
        details: {
          ...MOCK_UNISSUED_FACILITY.details,
          isUsingFacilityEndDate: true,
          bankReviewDate: new Date().toISOString(),
          facilityEndDate: new Date().toISOString(),
        },
      };

      const mapSummaryParams = {
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
      };

      const actionItems = mapSummaryList(facility, [mockDisplayItems[id]], mapSummaryParams, true)[0].actions.items;
      // should be allowed to change so should display change
      expect(actionItems).toEqual([
        {
          attributes: {
            'data-cy': `${id}-action`,
          },
          classes: 'govuk-!-display-none',
        },
      ]);
    });
  });

  /**
   * This mapping returns back the rows on the facilities table.
   * Testing when facility already issued with AIN
   * ensures that name, coverStartDate and coverEndDate hasBeenIssued fields cannot be editted on preview page
   */
  describe('facility has already been issued (and not changed)', () => {
    it.each(['name', 'coverStartDate', 'coverEndDate', 'isUsingFacilityEndDate', 'bankReviewDate', 'facilityEndDate', 'hasBeenIssued'])('%s', (id) => {
      const facility = {
        ...MOCK_ISSUED_FACILITY_UNCHANGED,
        details: {
          ...MOCK_ISSUED_FACILITY_UNCHANGED.details,
          isUsingFacilityEndDate: true,
          bankReviewDate: new Date().toISOString(),
          facilityEndDate: new Date().toISOString(),
        },
      };

      const mapSummaryParams = {
        app: MOCK_AIN_APPLICATION_ISSUED_ONLY,
        user: MOCK_REQUEST,
      };

      const result = mapSummaryList(facility, [mockDisplayItems[id]], mapSummaryParams, true)[0].actions.items;
      const response = [
        {
          attributes: {
            'data-cy': `${id}-action`,
          },
          classes: 'govuk-!-display-none',
        },
      ];
      expect(result).toEqual(response);
    });
  });

  it('Stage row should show Change', () => {
    const mapSummaryParams = {
      app: MOCK_AIN_APPLICATION,
      user: MOCK_REQUEST,
    };

    const { text } = mapSummaryList(MOCK_UNISSUED_FACILITY, [mockDisplayItems.hasBeenIssued], mapSummaryParams, true)[0].actions.items[0];
    // should be allowed to change so should display change
    expect(text).toEqual('Change');
  });

  describe('when with checker when changedToIssuedFacilities', () => {
    it.each(['hasBeenIssued', 'coverStartDate', 'coverEndDate', 'isUsingFacilityEndDate', 'bankReviewDate', 'facilityEndDate'])(
      '%s action should have class display-none',
      (id) => {
        const facility = {
          ...MOCK_ISSUED_FACILITY,
          details: {
            ...MOCK_ISSUED_FACILITY.details,
            isUsingFacilityEndDate: true,
            bankReviewDate: new Date().toISOString(),
            facilityEndDate: new Date().toISOString(),
          },
        };

        const mapSummaryParams = {
          app: MOCK_AIN_APPLICATION_CHECKER,
          user: MOCK_REQUEST,
        };

        const result = mapSummaryList(facility, [mockDisplayItems[id]], mapSummaryParams, true)[0].actions.items;
        // should have class display-none as unable to change on checker
        expect(result).toEqual([
          {
            attributes: {
              'data-cy': `${id}-action`,
            },
            classes: 'govuk-!-display-none',
          },
        ]);
      },
    );
  });

  describe('when returning to maker with changed to issued facilities', () => {
    it('should be able to change stage', () => {
      const mapSummaryParams = {
        app: MOCK_AIN_APPLICATION_RETURN_MAKER,
        user: MOCK_REQUEST,
      };

      const { text, href } = mapSummaryList(MOCK_ISSUED_FACILITY, [mockDisplayItems.hasBeenIssued], mapSummaryParams, true)[0].actions.items[0];
      // should be allowed to change so should display change
      expect(text).toEqual('Change');
      expect(href).toContain('/change-to-unissued');
    });

    it.each(['coverStartDate', 'coverEndDate', 'isUsingFacilityEndDate', 'bankReviewDate', 'facilityEndDate'])(
      'should be able to change %s on an issued facility',
      (id) => {
        const facility = {
          ...MOCK_ISSUED_FACILITY,
          details: {
            ...MOCK_ISSUED_FACILITY.details,
            isUsingFacilityEndDate: true,
            bankReviewDate: new Date().toISOString(),
            facilityEndDate: new Date().toISOString(),
          },
        };

        const mapSummaryParams = {
          app: MOCK_AIN_APPLICATION_RETURN_MAKER,
          user: MOCK_REQUEST,
        };

        const { text } = mapSummaryList(facility, [mockDisplayItems[id]], mapSummaryParams, true)[0].actions.items[0];
        // should be allowed to change so should display change
        expect(text).toEqual('Change');
      },
    );

    it('Should show change for stage when unissued facility', () => {
      const mapSummaryParams = {
        app: MOCK_AIN_APPLICATION_RETURN_MAKER,
        user: MOCK_REQUEST,
      };

      const { text } = mapSummaryList(MOCK_UNISSUED_FACILITY, [mockDisplayItems.hasBeenIssued], mapSummaryParams, true)[0].actions.items[0];
      // should be allowed to change so should display change
      expect(text).toEqual('Change');
    });

    it.each(['coverStartDate', 'coverEndDate', 'isUsingFacilityEndDate', 'bankReviewDate', 'facilityEndDate'])(
      'should not show change for %s when unissued facility',
      (id) => {
        const facility = {
          ...MOCK_UNISSUED_FACILITY,
          details: {
            ...MOCK_UNISSUED_FACILITY.details,
            isUsingFacilityEndDate: true,
            bankReviewDate: new Date().toISOString(),
            facilityEndDate: new Date().toISOString(),
          },
        };

        const mapSummaryParams = {
          app: MOCK_AIN_APPLICATION_RETURN_MAKER,
          user: MOCK_REQUEST,
        };

        const actionItems = mapSummaryList(facility, [mockDisplayItems[id]], mapSummaryParams, true)[0].actions.items;
        expect(actionItems).toEqual([
          {
            attributes: {
              'data-cy': `${id}-action`,
            },
            classes: 'govuk-!-display-none',
          },
        ]);
      },
    );

    it('Should not show change for stage when already issued facility', () => {
      const mapSummaryParams = {
        app: MOCK_AIN_APPLICATION_RETURN_MAKER,
        user: MOCK_REQUEST,
      };

      const result = mapSummaryList(MOCK_ISSUED_FACILITY_UNCHANGED, [mockDisplayItems.hasBeenIssued], mapSummaryParams, true)[0].actions.items;
      expect(result).toEqual([
        {
          attributes: {
            'data-cy': 'hasBeenIssued-action',
          },
          classes: 'govuk-!-display-none',
        },
      ]);
    });

    it.each(['coverStartDate', 'coverEndDate', 'isUsingFacilityEndDate', 'bankReviewDate', 'facilityEndDate'])(
      'Should not see the `Change` link for %s when already issued facility for AIN and Makers input required',
      (id) => {
        const mapSummaryParams = {
          app: MOCK_AIN_APPLICATION_RETURN_MAKER,
          user: MOCK_REQUEST,
        };

        const facility = {
          ...MOCK_ISSUED_FACILITY_UNCHANGED,
          details: {
            ...MOCK_ISSUED_FACILITY_UNCHANGED.details,
            isUsingFacilityEndDate: true,
            bankReviewDate: new Date().toISOString(),
            facilityEndDate: new Date().toISOString(),
          },
        };

        const result = mapSummaryList(facility, [mockDisplayItems[id]], mapSummaryParams, true)[0].actions.items;
        expect(result).toEqual([
          {
            attributes: {
              'data-cy': `${id}-action`,
            },
            classes: 'govuk-!-display-none',
          },
        ]);
      },
    );

    it.each(['coverStartDate', 'coverEndDate', 'isUsingFacilityEndDate', 'bankReviewDate', 'facilityEndDate'])(
      'should not show change for %s when already issued facility',
      (id) => {
        const facility = {
          ...MOCK_ISSUED_FACILITY_UNCHANGED,
          details: {
            ...MOCK_ISSUED_FACILITY_UNCHANGED.details,
            isUsingFacilityEndDate: true,
            bankReviewDate: new Date().toISOString(),
            facilityEndDate: new Date().toISOString(),
          },
        };

        const mapSummaryParams = {
          app: MOCK_AIN_APPLICATION_RETURN_MAKER,
          user: MOCK_REQUEST,
        };

        const result = mapSummaryList(facility, [mockDisplayItems[id]], mapSummaryParams, true)[0].actions.items;
        expect(result).toEqual([
          {
            attributes: {
              'data-cy': `${id}-action`,
            },
            classes: 'govuk-!-display-none',
          },
        ]);
      },
    );
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
    const summaryItemsObj = {
      preview: true,
      item: mockDisplayItems.name,
      details: MOCK_ISSUED_FACILITY_UNCHANGED,
      app: MOCK_AIN_APPLICATION_ISSUED_ONLY,
      user: MOCK_REQUEST,
      data: MOCK_AIN_APPLICATION_ISSUED_ONLY.facilities.items[0],
    };
    const result = summaryItemsConditions(summaryItemsObj);

    const expected = [
      {
        attributes: {
          'data-cy': 'name-action',
        },
        classes: 'govuk-!-display-none',
      },
    ];

    expect(result).toEqual(expected);
  });

  describe('if changed to issued', () => {
    it.each(['name', 'coverStartDate', 'coverEndDate', 'isUsingFacilityEndDate'])('Should be able to change %s', (id) => {
      const summaryItemsObj = {
        preview: true,
        item: mockDisplayItems[id],
        details: MOCK_ISSUED_FACILITY,
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
        data: MOCK_AIN_APPLICATION.facilities.items[1],
      };

      const { text, href } = summaryItemsConditions(summaryItemsObj)[0];

      expect(text).toEqual('Change');
      expect(href).toContain('/unissued-facilities/');
      expect(href).toContain('/change');
    });

    it('Should be able to change facilityEndDate', () => {
      const summaryItemsObj = {
        preview: true,
        item: mockDisplayItems.facilityEndDate,
        details: MOCK_ISSUED_FACILITY,
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
        data: MOCK_AIN_APPLICATION.facilities.items[1],
      };

      const { text, href } = summaryItemsConditions(summaryItemsObj)[0];

      expect(text).toEqual('Change');
      expect(href).toContain('/unissued-facilities/');
      expect(href).toContain('/facility-end-date/change');
    });

    it('Should be able to change bankReviewDate', () => {
      const summaryItemsObj = {
        preview: true,
        item: mockDisplayItems.bankReviewDate,
        details: MOCK_ISSUED_FACILITY,
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
        data: MOCK_AIN_APPLICATION.facilities.items[1],
      };

      const { text, href } = summaryItemsConditions(summaryItemsObj)[0];

      expect(text).toEqual('Change');
      expect(href).toContain('/unissued-facilities/');
      expect(href).toContain('/change');
    });

    it('Should be able to change issued', () => {
      const summaryItemsObj = {
        preview: true,
        item: mockDisplayItems.hasBeenIssued,
        details: MOCK_ISSUED_FACILITY,
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
        data: MOCK_AIN_APPLICATION.facilities.items[1],
      };

      const { text, href } = summaryItemsConditions(summaryItemsObj)[0];
      expect(text).toEqual('Change');
      expect(href).toContain('/change-to-unissued');
    });
  });

  describe('if not changed and unissued', () => {
    it.each(['name', 'coverStartDate', 'coverEndDate', 'isUsingFacilityEndDate', 'bankReviewDate', 'facilityEndDate'])(
      'Should not be able to change %s',
      (id) => {
        const summaryItemsObj = {
          preview: true,
          item: mockDisplayItems[id],
          details: MOCK_UNISSUED_FACILITY,
          app: MOCK_AIN_APPLICATION,
          user: MOCK_REQUEST,
          data: MOCK_AIN_APPLICATION.facilities.items[0],
        };

        const result = summaryItemsConditions(summaryItemsObj);
        expect(result).toEqual([
          {
            attributes: {
              'data-cy': `${id}-action`,
            },
            classes: 'govuk-!-display-none',
          },
        ]);
      },
    );

    it('Should be able to change issued', () => {
      const summaryItemsObj = {
        preview: true,
        item: mockDisplayItems.hasBeenIssued,
        details: MOCK_UNISSUED_FACILITY,
        app: MOCK_AIN_APPLICATION,
        user: MOCK_REQUEST,
        data: MOCK_AIN_APPLICATION.facilities.items[0],
      };

      const { text, href } = summaryItemsConditions(summaryItemsObj)[0];
      expect(text).toEqual('Change');
      expect(href).toContain('/unissued-facilities/');
      expect(href).toContain('/change');
    });
  });

  it('Should return FALSE as the Maker is from a different Bank', () => {
    MOCK_REQUEST.bank.id = 10;
    expect(makerCanReSubmit(MOCK_REQUEST, MOCK_BASIC_DEAL)).toEqual(false);
  });

  it('Should return FALSE as the user does not have `maker` role', () => {
    MOCK_REQUEST.roles = [CHECKER];
    expect(makerCanReSubmit(MOCK_REQUEST, MOCK_BASIC_DEAL)).toEqual(false);
  });

  it('Should return FALSE as the Application maker is from a different current logged-in maker', () => {
    MOCK_BASIC_DEAL.bank = { id: 1 };
    expect(makerCanReSubmit(MOCK_REQUEST, MOCK_BASIC_DEAL)).toEqual(false);
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

describe('pastDate', () => {
  it('Should return TRUE for the specified date', () => {
    expect(pastDate({ day: 1, month: 1, year: 1970 })).toEqual(true);
  });
  it('Should return TRUE for the specified date', () => {
    expect(pastDate({ day: 20, month: 9, year: 1989 })).toEqual(true);
  });
  it('Should return FALSE for the specified date', () => {
    const date = new Date();
    expect(pastDate({ day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() })).toEqual(false);
  });
});

describe('sameDate()', () => {
  // TODO: make test dynamic with now
  it('should return TRUE if dates are the same', () => {
    const coverEndDate = new Date('2022-05-25');
    expect(sameDate({ day: 25, month: 5, year: 2022 }, coverEndDate)).toEqual(true);
  });

  it('should return FALSE if dates are different', () => {
    const coverEndDate = new Date('2022-05-26');
    expect(sameDate({ day: 25, month: 5, year: 2022 }, coverEndDate)).toEqual(false);
  });

  it('should return FALSE if coverEndDate is null', () => {
    const coverEndDate = null;
    expect(sameDate({ day: 25, month: 5, year: 2022 }, coverEndDate)).toEqual(false);
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
    expect(futureDateInRange({ day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() }, 365)).toEqual(true);
  });
});

describe('getCurrentTimePlusMinutes', () => {
  it('should add the specified number of minutes to the current time', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01 12:00:00'));

    expect(getCurrentTimePlusMinutes(15)).toEqual(new Date('2020-01-01 12:15:00'));
  });

  it('should allow adding more than sixty minutes', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01 12:00:00'));

    expect(getCurrentTimePlusMinutes(80)).toEqual(new Date('2020-01-01 13:20:00'));
  });

  it('should subtract minutes when given a negative number', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01 12:00:00'));

    expect(getCurrentTimePlusMinutes(-15)).toEqual(new Date('2020-01-01 11:45:00'));
  });

  it('should allow passing into a new day', () => {
    jest.useFakeTimers().setSystemTime(new Date('2019-12-31 23:50:00'));

    expect(getCurrentTimePlusMinutes(15)).toEqual(new Date('2020-01-01 00:05:00'));
  });

  it('should default to adding zero minutes', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01 12:00:00'));

    expect(getCurrentTimePlusMinutes()).toEqual(new Date('2020-01-01 12:00:00'));
  });
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

describe('displayChangeSupportingInfo()', () => {
  it('Should return false if preview mode', () => {
    const result = displayChangeSupportingInfo(MOCK_AIN_APPLICATION_SUPPORTING_INFO(CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL, 0), true);
    expect(result).toEqual(false);
  });

  it('Should return false if preview mode and submission count over 0', () => {
    const result = displayChangeSupportingInfo(MOCK_AIN_APPLICATION_SUPPORTING_INFO(CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL, 1), true);
    expect(result).toEqual(false);
  });

  it('Should return true if not preview mode and submission count is 0', () => {
    const result = displayChangeSupportingInfo(MOCK_AIN_APPLICATION_SUPPORTING_INFO(CONSTANTS.DEAL_STATUS.DRAFT, 0), false);
    expect(result).toEqual(true);
  });

  it('Should return true if not preview mode and submission count is 0', () => {
    const result = displayChangeSupportingInfo(MOCK_AIN_APPLICATION_SUPPORTING_INFO(CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED, 0), false);
    expect(result).toEqual(true);
  });
});

describe('displayChangeSupportingInfo()', () => {
  it('Should return false if preview mode', () => {
    const result = displayChangeSupportingInfo(MOCK_AIN_APPLICATION_SUPPORTING_INFO(CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL, 0), true);
    expect(result).toEqual(false);
  });

  it('Should return false if preview mode and submission count over 0', () => {
    const result = displayChangeSupportingInfo(MOCK_AIN_APPLICATION_SUPPORTING_INFO(CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL, 1), true);
    expect(result).toEqual(false);
  });

  it('Should return true if not preview mode and submission count is 0', () => {
    const result = displayChangeSupportingInfo(MOCK_AIN_APPLICATION_SUPPORTING_INFO(CONSTANTS.DEAL_STATUS.DRAFT, 0), false);
    expect(result).toEqual(true);
  });

  it('Should return true if not preview mode and submission count is 0', () => {
    const result = displayChangeSupportingInfo(MOCK_AIN_APPLICATION_SUPPORTING_INFO(CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED, 0), false);
    expect(result).toEqual(true);
  });
});

describe('returnToMakerNoFacilitiesChanged()', () => {
  it('returns false if wrong status and no hasChangedFacilities', () => {
    const result = returnToMakerNoFacilitiesChanged(MOCK_AIN_APPLICATION_UNISSUED_ONLY, false);
    expect(result).toEqual(false);
  });

  it('returns false if wrong status and hasChangedFacilities', () => {
    const result = returnToMakerNoFacilitiesChanged(MOCK_AIN_APPLICATION_UNISSUED_ONLY, true);
    expect(result).toEqual(false);
  });

  it('returns false if right status and hasChangedFacilities', () => {
    const result = returnToMakerNoFacilitiesChanged(MOCK_AIN_APPLICATION_RETURN_MAKER, true);
    expect(result).toEqual(false);
  });

  it('returns true changes required and no hasChangedFacilities', () => {
    const result = returnToMakerNoFacilitiesChanged(MOCK_AIN_APPLICATION_RETURN_MAKER, false);
    expect(result).toEqual(true);
  });
});
