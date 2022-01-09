import { app } from '../../src/createApp';
const { get } = require('../api')(app);

const mockResponse = {
  status: 200,
  data: {
    company_number: '00000006',
    date_of_creation: '1862-10-25',
    last_full_members_list_date: '1986-07-02',
    type: 'private-unlimited-nsc',
    jurisdiction: 'england-wales',
    company_name: 'MARINE AND GENERAL MUTUAL LIFE ASSURANCE SOCIETY',
    registered_office_address: {
      postal_code: 'EC4N 6AF',
      address_line_2: '78 Cannon Street',
      country: 'England',
      address_line_1: 'Cms Cameron Mckenna Llp Cannon Place',
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

jest.mock('axios', () => jest.fn(() => Promise.resolve(mockResponse)));

describe('/companies-house', () => {
  describe('GET /companies-house', () => {
    it('returns a list of addresses', async () => {
      const { status, body } = await get('/companies-house/00000006');

      expect(status).toEqual(200);
      expect(body.company_number).toBeDefined();
      expect(body.company_name).toBeDefined();
      expect(body.registered_office_address).toBeDefined();
    });
  });
});
