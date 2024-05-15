const api = require('./deal.party-db');

const mockCompany = {
  partyUrn: '1234',
  name: 'Test',
  sfId: '0',
  companyRegNo: 'ABC123',
  type: null,
  subtype: null,
  isLegacyRecord: false,
};
const res = {
  redirect: jest.fn(),
  render: jest.fn(),
  status: jest.fn(),
};

const req = {
  params: {
    urn: '',
  },
};

describe('getCompany returns false', () => {
  it('should return `false` on an empty URN', async () => {
    const result = await api.getCompany(req, res);
    expect(result).toEqual(false);
  });

  it('should return `false` on an non-existent URN', async () => {
    req.params.urn = '12345';

    const result = await api.getCompany(req, res);
    expect(result).toEqual(false);
  });
});

describe('getCompany returns company', () => {
  beforeEach(() => {
    api.getCompany = () =>
      Promise.resolve({
        status: 200,
        data: mockCompany,
      });
  });

  it('should return company', async () => {
    req.params.urn = '12344';

    const result = await api.getCompany(req, res);

    expect(result.status).toEqual(200);
    expect(result.data).toEqual(mockCompany);
  });
});
