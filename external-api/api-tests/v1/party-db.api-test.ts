/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable import/no-extraneous-dependencies */

import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';
import { COMPANY_REGISTRATION_NUMBER } from '@ukef/dtfs2-common';
import { app } from '../../src/createApp';
import { api } from '../api';

const { APIM_MDM_URL } = process.env;
const { VALID, VALID_WITH_LETTERS } = COMPANY_REGISTRATION_NUMBER.EXAMPLES;
const { get } = api(app);

const axiosMock = new MockAdapter(axios);
axiosMock.onGet(`${APIM_MDM_URL}customers?companyReg=${VALID}`).reply(HttpStatusCode.Ok, {});
axiosMock.onGet(`${APIM_MDM_URL}customers?companyReg=${VALID_WITH_LETTERS}`).reply(HttpStatusCode.Ok, {});

describe('/party-db', () => {
  describe('GET /party-db', () => {
    it('returns a 200 response with a valid companies house number', async () => {
      const { status } = await get(`/party-db/${VALID}`);

      expect(status).toEqual(200);
    });

    it('returns a 200 response with a valid companies house number', async () => {
      const { status } = await get(`/party-db/${VALID_WITH_LETTERS}`);

      expect(status).toEqual(200);
    });
  });

  const invalidCompaniesHouseNumberTestCases = [['ABC22'], ['127.0.0.1'], ['{}'], ['[]']];

  describe('when company house number is invalid', () => {
    test.each(invalidCompaniesHouseNumberTestCases)('returns a 400 if you provide an invalid company house number %s', async (companyHouseNumber) => {
      const { status, body } = await get(`/party-db/${companyHouseNumber}`);

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid company registration number', status: 400 });
    });
  });
});
