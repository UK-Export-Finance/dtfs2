const { isCountryDisabled } = require('./country');
const { countries } = require('../../../external-api/api');

countries.getCountry = jest.fn();
countries.getCountry
  .mockReturnValueOnce({ data: { disabled: false } })
  .mockReturnValueOnce({ data: { disabled: false } })
  .mockReturnValue({ data: { disabled: true } });

/**
 * This code snippet is a test case for the 'isCountryDisabled' function.
 * It tests the function's behavior for different country codes and expected results.
 * The function takes a country code as input and returns a boolean value indicating whether the country is disabled or not.
 * The test case uses the 'it.each' function to iterate over multiple test scenarios.
 * Each scenario includes a country code and the expected result.
 * The 'isCountryDisabled' function is called with the country code, and the response is compared with the expected result using the 'expect' function.
 * The test case ensures that the 'isCountryDisabled' function behaves correctly for various input cases.
 */
describe('isCountryDisabled ', () => {
  it.each`
    code         | expected
    ${'GBR'}     | ${false}
    ${'USA'}     | ${false}
    ${'AFG'}     | ${true}
    ${'INVALID'} | ${true}
    ${'123'}     | ${true}
    ${'!£$'}     | ${true}
    ${''}        | ${true}
    ${null}      | ${true}
    ${undefined} | ${true}
  `('Should return $expected for specified country code $code', async ({ code, expected }) => {
    const response = await isCountryDisabled(code);
    expect(response).toEqual(expected);
  });
});
