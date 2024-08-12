const { getFacility, createParty, updateFacility, updateFacilityLoan, updateFacilityCovenant, updateFacilityGuarantee } = require('./api');

describe('getFacility', () => {
  withStandardHappyAndUnhappyPathTests({
    method: getFacility,
    happyPathArgsAsArray: ['1'],
  });
});

describe('createParty', () => {
  withStandardHappyAndUnhappyPathTests({
    method: createParty,
    happyPathArgsAsArray: [{ name: 'test' }],
  });
});
describe('updateFacility', () => {
  withStandardHappyAndUnhappyPathTests({
    method: updateFacility,
    happyPathArgsAsArray: ['1', 'amount', {}, 'abc123'],
  });
});

describe('updateFacilityLoan', () => {
  withStandardHappyAndUnhappyPathTests({
    method: updateFacilityLoan,
    happyPathArgsAsArray: ['1', 'amount', {}, 'abc123'],
  });
});

describe('updateFacilityCovenant', () => {
  withStandardHappyAndUnhappyPathTests({
    method: updateFacilityCovenant,
    happyPathArgsAsArray: ['1', { amount: '100,000', facilityGuaranteeDates: '2022-10-10' }],
  });
});

describe('updateFacilityGuarantee', () => {
  withStandardHappyAndUnhappyPathTests({
    method: updateFacilityGuarantee,
    happyPathArgsAsArray: ['1', { amount: '100,000', facilityGuaranteeDates: '2022-10-10' }],
  });
});

function withStandardHappyAndUnhappyPathTests({ method, happyPathArgsAsArray }) {
  describe('happy path', () => {
    it('test should return api response object', async () => {
      const response = await method(...happyPathArgsAsArray);
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('data');
    });
  });

  describe('unhappy path', () => {
    it('test should return api response object', async () => {
      const response = await method();
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('data');
    });
  });
}
