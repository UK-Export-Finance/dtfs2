require('dotenv').config();
const {
  getFacility,
  createParty,
  updateFacility,
  updateFacilityLoan,
} = require('./api');

describe('get function', () => {
  it('should test happy path returns api response object', async () => {
    const response = await getFacility('1');
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });

  it('should test happy path returns api response object for get facility', async () => {
    const response = await getFacility();
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });
});

describe('post function', () => {
  it('should test happy path returns api response object', async () => {
    const response = await createParty({});
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });

  it('should test happy path returns api response object for create party', async () => {
    const response = await createParty();
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });
});

describe('put function', () => {
  it('should test happy path returns api response object', async () => {
    const response = await updateFacility('1', 'amount', {}, 'abc123');
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });

  it('should test happy path returns api response object for update facility', async () => {
    const response = await updateFacility();
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });
});

describe('patch function', () => {
  it('should test happy path returns api response object', async () => {
    const response = await updateFacilityLoan('1', 'amount', {}, 'abc123');
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });

  it('should test happy path returns api response object for update facility loan', async () => {
    const response = await updateFacilityLoan();
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
  });
});
