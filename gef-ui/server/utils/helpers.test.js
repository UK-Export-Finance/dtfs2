import {
  userToken,
  parseBool,
  isObject,
  validationErrorHandler,
  mapSummaryList,
} from './helpers';

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

describe('parseBool()', () => {
  it('returns a boolean', () => {
    expect(parseBool('true')).toBe(true);
    expect(parseBool('false')).toBe(false);
    expect(parseBool('')).toBe(false);
    expect(parseBool(undefined)).toBe(false);
    expect(parseBool('0')).toBe(false);
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
});

describe('mapSummaryList()', () => {
  const mockedData = {
    id: 123456,
    name: '',
    address: {
      line1: 'Addres line 1',
      line2: 'Address line 2',
    },
  };
  const displayItems = [
    {
      label: 'Id',
      id: 'id',
    },
    {
      label: 'Name',
      id: 'name',
      href: '/name',
    },
  ];

  it('returns an empty array if Data object is empty ', () => {
    expect(mapSummaryList({}, displayItems)).toEqual([]);
    expect(mapSummaryList(null, displayItems)).toEqual([]);
    expect(mapSummaryList(undefined, displayItems)).toEqual([]);
  });

  it('returns the correct Array', () => {
    expect(mapSummaryList(mockedData, displayItems)).toEqual([
      {
        actions: { items: [{ href: null, text: 'Change', visuallyHiddenText: 'Id' }] },
        key: { text: 'Id' },
        value: { text: 123456 },
      },
      {
        actions: { items: [{ href: '/name', text: 'Add', visuallyHiddenText: 'Name' }] },
        key: { text: 'Name' },
        value: { text: '—' },
      }]);
  });
});
