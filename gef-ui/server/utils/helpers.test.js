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
  const data = () => ({
    details: {
      id: 123456,
    },
    required: [],
  });

  const displayItems = () => [
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
    const mockedData = data();
    const mockedDisplayItems = displayItems();

    expect(mapSummaryList(mockedData, mockedDisplayItems)).toEqual([{ actions: { items: [] }, key: { text: 'Id' }, value: { text: 123456 } }]);
  });

  it('returns populated items array if href property is required', () => {
    const mockedDisplayItems = displayItems();
    const mockedData = data();
    mockedDisplayItems[0].href = '/test';
    const { items } = mapSummaryList(mockedData, mockedDisplayItems)[0].actions;
    expect(items.length).toEqual(1);
  });

  it('returns the correct link label if href has been required', () => {
    const mockedDisplayItems = displayItems();
    const mockedData = data();
    mockedDisplayItems[0].href = '/test';
    const item = mapSummaryList(mockedData, mockedDisplayItems)[0].actions.items[0];
    expect(item).toEqual(expect.objectContaining({ href: '/test', text: 'Change' }));
    mockedData.details.id = null;
    const item2 = mapSummaryList(mockedData, mockedDisplayItems)[0].actions.items[0];
    expect(item2.text).toEqual('Add');
  });

  it('returns the `Required` html element if corresponding dataset is required', () => {
    const mockedDisplayItems = displayItems();
    const mockedData = data();

    mockedData.details.id = null;
    mockedData.required = ['id'];
    const { html } = mapSummaryList(mockedData, mockedDisplayItems)[0].value;
    expect(html).toMatch('required');
  });

  it('returns a long dash if value is emtpy and is NOT required', () => {
    const mockedDisplayItems = displayItems();
    const mockedData = data();

    mockedData.details.id = null;
    const { text } = mapSummaryList(mockedData, mockedDisplayItems)[0].value;
    expect(text).toMatch('—');
  });

  it('returns an unordered list if property contains an object', () => {
    const mockedDisplayItems = displayItems();
    const mockedData = data();

    mockedData.details.address = {};
    mockedData.details.address.line1 = 'Test Road';
    mockedData.details.address.line2 = null;
    mockedDisplayItems.slice(1);
    mockedDisplayItems[0].label = 'Address';
    mockedDisplayItems[0].id = 'address';

    const { html } = mapSummaryList(mockedData, mockedDisplayItems)[0].value;
    expect(html).toEqual('<ul class="is-unstyled"><li>Test Road</li></ul>');
  });
});
