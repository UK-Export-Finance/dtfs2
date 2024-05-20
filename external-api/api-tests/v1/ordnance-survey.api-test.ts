import { app } from '../../src/createApp';
import { api } from '../api';
import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';

const { APIM_MDM_URL } = process.env;
const { get } = api(app);

const mockResponse = {
  status: 200,
  data: {
    header: {
      uri: 'https://api.os.co.uk/search/places/v1/postcode?postcode=WR90DJ',
      query: 'postcode=WR90DJ',
      offset: 0,
      totalresults: 46,
      format: 'JSON',
      dataset: 'DPA',
      lr: 'EN,CY',
      maxresults: 100,
      epoch: '82',
      output_srs: 'EPSG:27700',
    },
    results: [
      {
        DPA: {
          UPRN: '100120684064',
          UDPRN: '26788471',
          ADDRESS: '1, NUFFIELD DRIVE, DROITWICH, WR9 0DJ',
          BUILDING_NUMBER: '1',
          THOROUGHFARE_NAME: 'NUFFIELD DRIVE',
          POST_TOWN: 'DROITWICH',
          POSTCODE: 'WR9 0DJ',
          RPC: '2',
          X_COORDINATE: 388468.3,
          Y_COORDINATE: 263305.6,
          STATUS: 'APPROVED',
          LOGICAL_STATUS_CODE: '1',
          CLASSIFICATION_CODE: 'RD02',
          CLASSIFICATION_CODE_DESCRIPTION: 'Detached',
          LOCAL_CUSTODIAN_CODE: 1840,
          LOCAL_CUSTODIAN_CODE_DESCRIPTION: 'WYCHAVON',
          POSTAL_ADDRESS_CODE: 'D',
          POSTAL_ADDRESS_CODE_DESCRIPTION: 'A record which is linked to PAF',
          BLPU_STATE_CODE: null,
          BLPU_STATE_CODE_DESCRIPTION: 'Unknown/Not applicable',
          TOPOGRAPHY_LAYER_TOID: 'mock-1',
          LAST_UPDATE_DATE: '10/02/2016',
          ENTRY_DATE: '22/09/2000',
          LANGUAGE: 'EN',
          MATCH: 1,
          MATCH_DESCRIPTION: 'EXACT',
        },
      },
      {
        DPA: {
          UPRN: '100120684065',
          UDPRN: '26788481',
          ADDRESS: '2, NUFFIELD DRIVE, DROITWICH, WR9 0DJ',
          BUILDING_NUMBER: '2',
          THOROUGHFARE_NAME: 'NUFFIELD DRIVE',
          POST_TOWN: 'DROITWICH',
          POSTCODE: 'WR9 0DJ',
          RPC: '2',
          X_COORDINATE: 388504.3,
          Y_COORDINATE: 263362.3,
          STATUS: 'APPROVED',
          LOGICAL_STATUS_CODE: '1',
          CLASSIFICATION_CODE: 'RD02',
          CLASSIFICATION_CODE_DESCRIPTION: 'Detached',
          LOCAL_CUSTODIAN_CODE: 1840,
          LOCAL_CUSTODIAN_CODE_DESCRIPTION: 'WYCHAVON',
          POSTAL_ADDRESS_CODE: 'D',
          POSTAL_ADDRESS_CODE_DESCRIPTION: 'A record which is linked to PAF',
          BLPU_STATE_CODE: null,
          BLPU_STATE_CODE_DESCRIPTION: 'Unknown/Not applicable',
          TOPOGRAPHY_LAYER_TOID: 'mock-2',
          LAST_UPDATE_DATE: '17/03/2020',
          ENTRY_DATE: '22/09/2000',
          LANGUAGE: 'EN',
          MATCH: 1,
          MATCH_DESCRIPTION: 'EXACT',
        },
      },
    ],
  },
};

// Mock Axios
const axiosMock = new MockAdapter(axios);

axiosMock
  .onGet(`${APIM_MDM_URL}geospatial/addresses/postcode?postcode=WR90DJ`)
  .reply(HttpStatusCode.Ok, mockResponse.data);

describe('/ordnance-survey', () => {
  describe('GET /ordnance-survey', () => {
    it('returns a list of addresses', async () => {
      const { status, body } = await get('/ordnance-survey/WR90DJ');

      expect(status).toEqual(200);
      expect(body.results).toBeDefined();
    });
  });

  const invalidPostcodeTestCases = [['ABC22'], ['127.0.0.1'], ['{}'], ['[]']];

  describe('when postcode is invalid', () => {
    test.each(invalidPostcodeTestCases)('returns a 400 if you provide an invalid postcode %s', async (postcode) => {
      const { status, body } = await get(`/ordnance-survey/${postcode}`);

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid postcode', status: 400 });
    });
  });
});
