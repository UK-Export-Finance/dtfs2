import { MOCK_COMPANY_REGISTRATION_NUMBERS } from '@ukef/dtfs2-common/test-helpers';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';
import { PROBABILITY_OF_DEFAULT } from '@ukef/dtfs2-common';
import { app } from '../../server/createApp';
import { api } from '../api';
import { findACBSIndustrySector } from '../../server/v1/controllers/industry-sectors.controller';

let axiosMock: MockAdapter;

const { APIM_MDM_URL } = process.env;
const { VALID, VALID_WITH_LETTERS, INVALID_TOO_SHORT, INVALID_TOO_LONG } = MOCK_COMPANY_REGISTRATION_NUMBERS;
const { get, post } = api(app);

const mockIndustryResponse = {
  id: 1,
  ukefSectorId: '1001',
  ukefSectorName: 'Agriculture, Forestry and Fishing',
  internalNo: null,
  ukefIndustryId: '01110',
  ukefIndustryName: 'Growing of cereals (except rice), leguminous crops and oil seeds',
  acbsSectorId: '30',
  acbsSectorName: 'CIVIL: AGRICULTURE, HORTICULTURE & FISHERIES',
  acbsIndustryId: '3001',
  acbsIndustryName: 'AGRICULTURE, HORTICULTURE & FISHERIES',
  created: '2017-04-01T00:00:00.000Z',
  updated: '2017-06-28T11:01:29.040Z',
  effectiveFrom: '2017-04-01T00:00:00.000Z',
  effectiveTo: '9999-12-31T00:00:00.000Z',
};

jest.mock('../../server/v1/controllers/industry-sectors.controller', () => ({
  ...jest.requireActual<object>('../../server/v1/controllers/industry-sectors.controller'),
  findACBSIndustrySector: jest.fn(),
}));

describe('party-db.controller feature flag', () => {
  beforeEach(() => {
    axiosMock = new MockAdapter(axios);

    axiosMock.onGet(`${APIM_MDM_URL}v1/customers?companyReg=${VALID}`).reply(HttpStatusCode.Ok, {});
    axiosMock.onGet(`${APIM_MDM_URL}v1/customers?companyReg=${VALID_WITH_LETTERS}`).reply(HttpStatusCode.Ok, {});
    axiosMock.onPost(`${APIM_MDM_URL}v1/customers`).reply(HttpStatusCode.Ok);
  });

  afterEach(() => {
    axiosMock.resetHistory();
    jest.resetAllMocks();
  });

  describe('GET /party-db', () => {
    it(`should returns a ${HttpStatusCode.Ok} response with a valid companies house number`, async () => {
      const { status } = await get(`/party-db/${VALID}`);

      expect(status).toEqual(HttpStatusCode.Ok);
    });

    it(`should returns a ${HttpStatusCode.Ok} response with a valid companies house number with letters`, async () => {
      const { status } = await get(`/party-db/${VALID_WITH_LETTERS}`);

      expect(status).toEqual(HttpStatusCode.Ok);
    });

    const invalidCompaniesHouseNumberTestCases = [['ABC22'], ['127.0.0.1'], ['{}'], ['[]']];

    describe('when company house number is invalid', () => {
      test.each(invalidCompaniesHouseNumberTestCases)(
        `returns a ${HttpStatusCode.BadRequest} if you provide an invalid company house number %s`,
        async (companyHouseNumber) => {
          const { status, body } = await get(`/party-db/${companyHouseNumber}`);

          expect(status).toEqual(HttpStatusCode.BadRequest);
          expect(body).toMatchObject({ data: 'Invalid company registration number', status: HttpStatusCode.BadRequest });
        },
      );
    });
  });

  describe('POST /party-db', () => {
    const invalidPayloads = [
      { companyRegNo: null, companyName: 'Some name', probabilityOfDefault: 3 },
      { companyRegNo: VALID, companyName: null, probabilityOfDefault: 3 },
      { companyRegNo: INVALID_TOO_SHORT, companyName: 'Some name', probabilityOfDefault: 3 },
      { companyRegNo: INVALID_TOO_LONG, companyName: 'Some name', probabilityOfDefault: 3 },
      { companyRegNo: VALID, companyName: 'Some name', probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE, isUkEntity: '' },
      { companyRegNo: VALID, companyName: 'Some name', probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE, isUkEntity: true, code: '' },
      { companyRegNo: VALID, companyName: 'Some name', probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE, isUkEntity: false, code: 0 },
    ];

    const invalidIndustryCodes = [
      { companyRegNo: VALID, companyName: 'Some name', probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE, isUkEntity: false, code: 1 },
      { companyRegNo: VALID, companyName: 'Some name', probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE, isUkEntity: false, code: 12 },
      { companyRegNo: VALID, companyName: 'Some name', probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE, isUkEntity: false, code: 123 },
      { companyRegNo: VALID, companyName: 'Some name', probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE, isUkEntity: false, code: 1234 },
      { companyRegNo: VALID, companyName: 'Some name', probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE, isUkEntity: false, code: 'ABCD' },
      { companyRegNo: VALID, companyName: 'Some name', probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE, isUkEntity: false, code: 111111111 },
    ];

    it(`should returns a ${HttpStatusCode.Ok} response with a valid body`, async () => {
      // Arrange
      jest.mocked(findACBSIndustrySector).mockResolvedValueOnce({
        data: [mockIndustryResponse],
        status: HttpStatusCode.Ok,
      });

      const bodyValidWithProbabilityOfDefault = {
        companyRegNo: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID,
        companyName: 'test',
        probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE,
        isUkEntity: true,
        code: 10110,
      };

      // Act
      const { status } = await post(bodyValidWithProbabilityOfDefault).to(`/party-db/`);

      // Assert
      expect(status).toEqual(HttpStatusCode.Ok);
    });

    it.each(invalidPayloads)(`should returns a ${HttpStatusCode.BadRequest} if an invalid payload is supplied %s`, async (payload) => {
      // Act
      const { status } = await post(payload).to(`/party-db/`);

      // Arrange
      expect(status).toEqual(HttpStatusCode.BadRequest);
    });

    it.each(invalidIndustryCodes)(`should returns a ${HttpStatusCode.BadRequest} if an invalid industry code is supplied %s`, async (payload) => {
      // Act
      const { status } = await post(payload).to(`/party-db/`);

      // Arrange
      expect(status).toEqual(HttpStatusCode.InternalServerError);
    });
  });
});
