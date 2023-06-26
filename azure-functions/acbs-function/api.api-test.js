require('dotenv').config();
const {
  getFacility,
  createParty,
  updateFacility,
  updateFacilityLoan,
} = require('./api');

describe('get function', () => {
  // Tests that the function returns an API response object when endpoint is provided
  it('should test happy path returns api response object', async () => {
    const response = await getFacility('1');
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });

  // Tests that the function returns an API response object for getFacility
  it('should test happy path returns api response object for get facility', async () => {
    const response = await getFacility();
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });
});

describe('post function', () => {
  // Tests that the function returns an API response object when endpoint is provided
  it('should test happy path returns api response object', async () => {
    const response = await createParty({});
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });

  // Tests that the function returns an API response object for getFacility
  it('should test happy path returns api response object for create party', async () => {
    const response = await createParty();
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });
});

describe('put function', () => {
  // Tests that the function returns an API response object when endpoint is provided
  it('should test happy path returns api response object', async () => {
    const response = await updateFacility('1', 'amount', {}, 'abc123');
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });

  // Tests that the function returns an API response object for getFacility
  it('should test happy path returns api response object for update facility', async () => {
    const response = await updateFacility();
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });
});

describe('patch function', () => {
  // Tests that the function returns an API response object when endpoint is provided
  it('should test happy path returns api response object', async () => {
    const response = await updateFacilityLoan('1', 'amount', {}, 'abc123');
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });

  // Tests that the function returns an API response object for getFacility
  it('should test happy path returns api response object for update facility loan', async () => {
    const response = await updateFacilityLoan();
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });
});
