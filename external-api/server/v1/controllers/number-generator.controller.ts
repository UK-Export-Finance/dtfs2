/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as dotenv from 'dotenv';
import axios, { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import {
  HEADERS,
  isNumberGeneratorMocked,
  generateMockedNumberGeneratorIds,
  NumberGeneratorResponse,
  ENTITY_TYPE,
  NUMBER_TYPE,
  USER,
} from '@ukef/dtfs2-common';
import { NumberGeneratorErrorResponse } from '../../interfaces';
import { InvalidEntityTypeError } from '../errors';

dotenv.config();

const { APIM_MDM_URL, APIM_MDM_VALUE, APIM_MDM_KEY } = process.env;

const headers = {
  headers: {
    [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
    [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  },
};

/**
 * Determines the number type based on the entity type.
 * @param entityType - The type of entity for which the number type needs to be determined.
 * @returns A number based on the value of entityType.
 * @throws {Error} If entityType is invalid.
 */
export const getNumberTypeId = (entityType: string): number => {
  switch (entityType) {
    case ENTITY_TYPE.DEAL:
      return NUMBER_TYPE.DEAL;
    case ENTITY_TYPE.FACILITY:
      return NUMBER_TYPE.FACILITY;
    default:
      throw new InvalidEntityTypeError(entityType);
  }
};

/**
 * Retrieves a number from a number generator API based on the provided `entityType` and `dealId`.
 * @param req - The HTTP request object containing the `entityType` and `dealId` in the `body` property.
 * @param res - The HTTP response object used to send the response back to the client.
 * @returns {Promise<object>} The retrieved number in the response body.
 */
export const getNumber = async (req: Request, res: Response): Promise<Response<NumberGeneratorResponse> | Response<NumberGeneratorErrorResponse>> => {
  try {
    const { entityType, dealId } = req.body;
    const numberTypeId = getNumberTypeId(String(entityType));
    const endpoint = `${APIM_MDM_URL}v1/numbers`;
    const payload = {
      numberTypeId,
      createdBy: USER.DTFS,
      requestingSystem: USER.DTFS,
    };

    console.info('⚡️ Invoking number generator for deal %s', dealId);

    /**
     * if number generator is mocked
     * generate random mocked number generator IDs
     * and return them with correct mocked status and data
     */
    if (isNumberGeneratorMocked()) {
      console.info('⚠️ Mocking Number Generator API call ⚠️');
      const data = generateMockedNumberGeneratorIds();

      const { maskedId: ukefId } = data[0];

      console.info('✅ UKEF ID received %d for deal %s', ukefId, dealId);

      return res.status(HttpStatusCode.Ok).send({
        status: HttpStatusCode.Created,
        data,
      });
    }

    const response: NumberGeneratorResponse = await axios.post(endpoint, [payload], headers);

    if (!response.data) {
      console.error('❌ Invalid number generator response received for deal %s %o', dealId, response);
      throw new Error(`Invalid number generator response received for deal ${dealId}`, {
        cause: 'Invalid response from APIM MDM',
      });
    }

    const { status, data } = response;

    if (!data.length) {
      throw new Error(`Empty number generator response received for deal ${dealId}`, {
        cause: 'Empty response from APIM MDM',
      });
    }

    const { maskedId: ukefId } = data[0];

    console.info('✅ UKEF ID received %d for deal %s', ukefId, dealId);

    return res.status(HttpStatusCode.Ok).send({
      status,
      data,
    });
  } catch (error: any) {
    console.error('❌ Error getting number from number generator %o', error);

    if (error instanceof InvalidEntityTypeError) {
      return res.status(HttpStatusCode.BadRequest).send({
        status: HttpStatusCode.BadRequest,
        error,
      });
    }

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      error: {
        cause: error.message,
      },
    });
  }
};
