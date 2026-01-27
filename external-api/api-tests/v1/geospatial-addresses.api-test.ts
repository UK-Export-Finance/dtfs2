/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';
import { ADDRESSES } from '@ukef/dtfs2-common';
import { app } from '../../server/createApp';
import { api } from '../api';

const { APIM_MDM_URL } = process.env;
const { get } = api(app);

const mockResponse = {
  status: HttpStatusCode.Ok,
  data: {
    header: {
      uri: `https://api.os.co.uk/search/places/v1/postcode?postcode=${ADDRESSES.EXAMPLES.POSTCODE_WITHOUT_SPACE}`,
      query: `postcode=${ADDRESSES.EXAMPLES.POSTCODE_WITHOUT_SPACE}`,
      offset: 0,
      totalresults: 1,
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
          UPRN: '10033548201',
          UDPRN: '23748017',
          ADDRESS: 'H M TREASURY, 1, HORSE GUARDS ROAD, LONDON, SW1A 2HQ',
          ORGANISATION_NAME: 'H M TREASURY',
          BUILDING_NUMBER: '1',
          THOROUGHFARE_NAME: 'HORSE GUARDS ROAD',
          POST_TOWN: 'LONDON',
          POSTCODE: 'SW1A 2HQ',
          RPC: '2',
          X_COORDINATE: 529944.0,
          Y_COORDINATE: 179754.0,
          STATUS: 'APPROVED',
          LOGICAL_STATUS_CODE: '1',
          CLASSIFICATION_CODE: 'CO01',
          CLASSIFICATION_CODE_DESCRIPTION: 'Office / Work Studio',
          LOCAL_CUSTODIAN_CODE: 5990,
          LOCAL_CUSTODIAN_CODE_DESCRIPTION: 'CITY OF WESTMINSTER',
          COUNTRY_CODE: 'E',
          COUNTRY_CODE_DESCRIPTION: 'This record is within England',
          POSTAL_ADDRESS_CODE: 'D',
          POSTAL_ADDRESS_CODE_DESCRIPTION: 'A record which is linked to PAF',
          BLPU_STATE_CODE: '2',
          BLPU_STATE_CODE_DESCRIPTION: 'In use',
          TOPOGRAPHY_LAYER_TOID: 'abcd1000042216423',
          WARD_CODE: 'E05013806',
          LAST_UPDATE_DATE: '12/11/2018',
          ENTRY_DATE: '27/04/2003',
          BLPU_STATE_DATE: '27/04/2003',
          LANGUAGE: 'EN',
          MATCH: 1.0,
          MATCH_DESCRIPTION: 'EXACT',
          DELIVERY_POINT_SUFFIX: '1A',
        },
      },
    ],
  },
};

const axiosMock = new MockAdapter(axios);

axiosMock
  .onGet(`${APIM_MDM_URL}v1/geospatial/addresses/postcode?postcode=${ADDRESSES.EXAMPLES.POSTCODE_WITHOUT_SPACE}`)
  .reply(HttpStatusCode.Ok, mockResponse.data);

describe('/geospatial/addresses/postcode', () => {
  describe('GET /geospatial/addresses/postcode', () => {
    it('returns a list of addresses', async () => {
      const { status, body } = await get(`/geospatial/addresses/postcode/${ADDRESSES.EXAMPLES.POSTCODE_WITHOUT_SPACE}`);

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body.results).toBeDefined();
    });

    it('returns a 500 response when MDM returns 500', async () => {
      axiosMock
        .onGet(`${APIM_MDM_URL}v1/geospatial/addresses/postcode?postcode=${ADDRESSES.EXAMPLES.POSTCODE_WITHOUT_SPACE}`)
        .reply(HttpStatusCode.InternalServerError, '');

      const { status, body } = await get(`/geospatial/addresses/postcode/${ADDRESSES.EXAMPLES.POSTCODE_WITHOUT_SPACE}`);

      expect(status).toEqual(HttpStatusCode.InternalServerError);
      expect(body).toStrictEqual({});
    });
  });

  const invalidPostcodeTestCases = [['ABC22'], ['127.0.0.1'], ['{}'], ['[]']];

  describe('when postcode is invalid', () => {
    test.each(invalidPostcodeTestCases)('returns a 400 if you provide an invalid postcode %s', async (postcode) => {
      const { status, body } = await get(`/geospatial/addresses/postcode/${postcode}`);

      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body).toMatchObject({ data: 'Invalid postcode', status: HttpStatusCode.BadRequest });
    });
  });
});
