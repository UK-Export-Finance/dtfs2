import axios, { HttpStatusCode } from 'axios';
import * as dotenv from 'dotenv';
import { getOrCreateParty } from './party-db.controller';
import { mockReq, mockRes } from '../../test-mocks';
import { PROBABILITY_OF_DEFAULT } from '@ukef/dtfs2-common';
import { findACBSIndustrySector } from './industry-sectors.controller';
import { HEADERS } from '@ukef/dtfs2-common';

dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

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

const mockBody = {
  companyRegNo: '12312312',
  companyName: 'test',
  probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE,
  isUkEntity: true,
  code: 0o1110,
};

const mockMdmResponse = [
  { companyRegNo: '12312312', isLegacyRecord: false, name: 'string', partyUrn: '00327339', sfId: '001S900000Ym3', subtype: null, type: null },
];

let mockRequest = mockReq();
let mockResponse = mockRes();

jest.mock('./industry-sectors.controller', () => ({
  ...jest.requireActual('./industry-sectors.controller'),
  findACBSIndustrySector: jest.fn(),
}));

jest.mock('axios');

describe('getOrCreateParty', () => {
  beforeEach(() => {
    mockRequest = mockReq();
    mockResponse = mockRes();

    console.info = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it(`should return ${HttpStatusCode.BadRequest} when an invalid company registration number is provided`, async () => {
    // Arrange
    mockRequest.body = {
      ...mockBody,
      companyRegNo: '',
    };

    // Act
    await getOrCreateParty(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Invalid company registration number was provided %s', '');

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
    expect(mockResponse.send).toHaveBeenCalledWith({ status: HttpStatusCode.BadRequest, data: 'Invalid company registration number' });
  });

  it(`should return ${HttpStatusCode.BadRequest} when an invalid company name is provided`, async () => {
    // Arrange
    mockRequest.body = {
      ...mockBody,
      companyName: '',
    };

    // Act
    await getOrCreateParty(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Invalid company name was provided %s', '');

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
    expect(mockResponse.send).toHaveBeenCalledWith({ status: HttpStatusCode.BadRequest, data: 'Invalid company name' });
  });

  it(`should return ${HttpStatusCode.InternalServerError} when an error is thrown`, async () => {
    // Arrange
    const mockError = new Error('Test');

    jest.mocked(findACBSIndustrySector).mockRejectedValueOnce(mockError);

    mockRequest.body = {
      ...mockBody,
    };

    // Act
    await getOrCreateParty(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error calling Party DB API %o', mockError);

    expect(findACBSIndustrySector).toHaveBeenCalledTimes(1);
    expect(findACBSIndustrySector).toHaveBeenCalledWith(mockRequest.body.code);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
    expect(mockResponse.send).toHaveBeenCalledWith({ status: HttpStatusCode.InternalServerError, message: 'An unknown error occurred' });
  });

  it(`should return ${HttpStatusCode.InternalServerError} when UKEF industry code is not found`, async () => {
    // Arrange
    const mockError = new Error('Unable to get industry sector data');

    jest.mocked(findACBSIndustrySector).mockResolvedValueOnce({
      data: 'No results found for your search criteria',
      status: HttpStatusCode.NotFound,
    });

    mockRequest.body = {
      ...mockBody,
      code: 12312,
    };

    // Act
    await getOrCreateParty(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error calling Party DB API %o', mockError);

    expect(findACBSIndustrySector).toHaveBeenCalledTimes(1);
    expect(findACBSIndustrySector).toHaveBeenCalledWith(mockRequest.body.code);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
    expect(mockResponse.send).toHaveBeenCalledWith({ status: HttpStatusCode.InternalServerError, message: 'An unknown error occurred' });
  });

  it(`should return ${HttpStatusCode.Ok} when the payload is valid`, async () => {
    // Arrange
    jest.mocked(findACBSIndustrySector).mockResolvedValueOnce({
      data: [mockIndustryResponse],
      status: HttpStatusCode.Ok,
    });

    jest.mocked(axios).mockResolvedValueOnce({
      data: mockMdmResponse,
      status: HttpStatusCode.Ok,
    });

    mockRequest.body = {
      ...mockBody,
    };

    // Act
    await getOrCreateParty(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);

    expect(findACBSIndustrySector).toHaveBeenCalledTimes(1);
    expect(findACBSIndustrySector).toHaveBeenCalledWith(mockRequest.body.code);

    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenLastCalledWith({
      method: 'post',
      url: `${APIM_MDM_URL}customers`,
      headers,
      data: {
        companyRegistrationNumber: mockBody.companyRegNo,
        companyName: mockBody.companyName,
        probabilityOfDefault: mockBody.probabilityOfDefault,
        ukEntity: "Yes",
        ukefIndustryId: mockIndustryResponse.acbsIndustryId,
        ukefSectorId: mockIndustryResponse.acbsSectorId,
      },
    });

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
    expect(mockResponse.send).toHaveBeenCalledWith(mockMdmResponse);
  });
});
