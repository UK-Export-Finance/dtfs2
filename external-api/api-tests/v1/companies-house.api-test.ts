import { app } from '../../src/createApp';
import { api } from '../api';
import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';

const { COMPANIES_HOUSE_API_URL } = process.env;
const { get } = api(app);

// Mock Axios
const axiosMock = new MockAdapter(axios);

const mockResponse = {
  status: 200,
  data: {
    company_number: '00000006',
    date_of_creation: '1862-10-25',
    last_full_members_list_date: '1986-07-02',
    type: 'private-unlimited-nsc',
    jurisdiction: 'england-wales',
    company_name: 'Mock',
    registered_office_address: {
      postal_code: 'SW1A 1AA',
      address_line_2: '78 Cannon Street',
      country: 'England',
      address_line_1: 'Mock',
      locality: 'London',
    },
    accounts: {
      accounting_reference_date: {
        month: '12',
        day: '31',
      },
      last_accounts: {
        made_up_to: '2014-12-31',
        type: 'full',
        period_end_on: '2014-12-31',
      },
    },
    sic_codes: ['65110'],
    undeliverable_registered_office_address: false,
    has_insolvency_history: false,
    company_status: 'dissolved',
    etag: '0f74ad6c3c366269ac39899e0939851b2ebd15e3',
    has_charges: true,
    links: {
      self: '/company/00000006',
      filing_history: '/company/00000006/filing-history',
      officers: '/company/00000006/officers',
      charges: '/company/00000006/charges',
    },
    registered_office_is_in_dispute: false,
    date_of_cessation: '2018-07-10',
    can_file: false,
  },
};

axiosMock.onGet(`${COMPANIES_HOUSE_API_URL}/company/00000006`).reply(HttpStatusCode.Ok, mockResponse.data);

const companyHouseNumberTestCases = ['abc', '127.0.0.1', '{}', '[]'];

describe('/companies-house', () => {
  describe('GET /companies-house', () => {
    it('returns a list of addresses', async () => {
      const { status, body } = await get('/companies-house/00000006');

      expect(status).toEqual(200);
      expect(body.company_number).toBeDefined();
      expect(body.company_name).toBeDefined();
      expect(body.registered_office_address).toBeDefined();
    });

    test.each(companyHouseNumberTestCases)('returns a 400 if you provide an invalid company registration number: %s', async (companyHouseNumber) => {
      const { status, body } = await get(`/companies-house/${companyHouseNumber}`);

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid company registration number', status: 400 });
    });
  });
});
