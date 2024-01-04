/**
 * Unit test cases for `constructPayload` method
 */
import { CHECKER, MAKER } from '../constants/roles';
import constructPayload from './constructPayload';

const mockBody = {
  _csrf: '3YyRfYmT',
  currentPassword: 'AbC!2345',
  password: 'AbC!23456',
  passwordConfirm: 'AbC!23456',
};

const mockExtraBody = {
  roles: [CHECKER, MAKER],
  _csrf: '3YyRfYmT',
  currentPassword: 'AbC!2345',
  password: 'AbC!23456',
  passwordConfirm: 'AbC!23456',
};

const payloadProperties = [
  'currentPassword',
  'password',
  'passwordConfirm',
];

const mockBodyWithEmptyValues = {
  _csrf: '3YyRfYmT',
  currentCurrencyValue: '',
  newCurrencyValue: 'value',
  anotherCurrenyValue: '',
  isSameAsDeal: false,
  exchangeRate: null,
  currencyObject: {},
  currencies: [],
};

const payloadPropertiesForEmptyValues = [
  'currentCurrencyValue',
  'newCurrencyValue',
  'anotherCurrenyValue',
  'exchangeRate',
  'currencyObject',
  'currencies',
  'isSameAsDeal',
];

describe('Unit test cases for constructPayload method', () => {
  it('Should return an empty payload, when both `body` and `properties` argument are null', () => {
    const expected = {};
    const returned = constructPayload(null, null);

    expect(expected).toEqual(returned);
  });

  it('Should return an empty payload, when `body` argument is null', () => {
    const expected = {};
    const returned = constructPayload(null, payloadProperties);

    expect(expected).toEqual(returned);
  });

  it('Should return an empty payload, when `properties` argument is null', () => {
    const expected = {};
    const returned = constructPayload(mockBody, null);

    expect(expected).toEqual(returned);
  });

  it('Should return expected payload as per `properties` and CSRF argument with extra data in body', () => {
    const expected = {
      _csrf: '3YyRfYmT',
      currentPassword: 'AbC!2345',
      password: 'AbC!23456',
      passwordConfirm: 'AbC!23456',
    };
    const returned = constructPayload(mockExtraBody, payloadProperties);

    expect(expected).toEqual(returned);
  });

  it('Should return expected payload as per `properties` and without CSRF argument with extra data in body', () => {
    const expected = {
      currentPassword: 'AbC!2345',
      password: 'AbC!23456',
      passwordConfirm: 'AbC!23456',
    };
    const returned = constructPayload(mockExtraBody, payloadProperties, true, false);

    expect(expected).toEqual(returned);
  });

  it('Should return expected payload as per `properties` and CSRF argument with data in standard body', () => {
    const expected = {
      _csrf: '3YyRfYmT',
      currentPassword: 'AbC!2345',
      password: 'AbC!23456',
      passwordConfirm: 'AbC!23456',
    };
    const returned = constructPayload(mockBody, payloadProperties);

    expect(expected).toEqual(returned);
  });

  it('Should return expected payload as per `properties` and without CSRF argument with data in standard body', () => {
    const expected = {
      currentPassword: 'AbC!2345',
      password: 'AbC!23456',
      passwordConfirm: 'AbC!23456',
    };
    const returned = constructPayload(mockExtraBody, payloadProperties, true, false);

    expect(expected).toEqual(returned);
  });

  it('Should delete all fields with empty values', () => {
    const expected = {
      newCurrencyValue: 'value',
      exchangeRate: null,
      currencyObject: {},
      currencies: [],
      isSameAsDeal: false,
    };
    const canPropertyBeEmpty = false;
    const returned = constructPayload(mockBodyWithEmptyValues, payloadPropertiesForEmptyValues, canPropertyBeEmpty, false);
    expect(expected).toEqual(returned);
  });

  it('Should delete all fields with empty values and keep CSRF', () => {
    const expected = {
      _csrf: '3YyRfYmT',
      newCurrencyValue: 'value',
      exchangeRate: null,
      currencyObject: {},
      currencies: [],
      isSameAsDeal: false,
    };
    const canPropertyBeEmpty = false;
    const returned = constructPayload(mockBodyWithEmptyValues, payloadPropertiesForEmptyValues, canPropertyBeEmpty, true);
    expect(expected).toEqual(returned);
  });
});
