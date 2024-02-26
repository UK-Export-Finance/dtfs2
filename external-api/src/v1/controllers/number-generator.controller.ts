import * as dotenv from 'dotenv';
import axios, { AxiosResponse, HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { ENTITY_TYPE, NUMBER_TYPE, USER } from '../../constants';

dotenv.config();

const { APIM_MDM_URL, APIM_MDM_VALUE, APIM_MDM_KEY } = process.env;

const headers = {
  headers: {
    [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
    'Content-Type': 'application/json',
  },
};

/**
 * Determines the number type based on the entity type.
 * @param entityType - The type of entity for which the number type needs to be determined.
 * @returns A number based on the value of entityType.
 * @throws {Error} If entityType is invalid.
 */
const getNumberTypeId = (entityType: string): number => {
  switch (entityType) {
    case ENTITY_TYPE.DEAL:
      return NUMBER_TYPE.DEAL;
    case ENTITY_TYPE.FACILITY:
      return NUMBER_TYPE.FACILITY;
    default:
      throw new Error(`Invalid entityType ${entityType}`);
  }
};

/**
 * Handles an HTTP GET request to retrieve a number from a number generator API.
 * @param req - The HTTP request object containing the `entityType` and `dealId` in the `body` property.
 * @param res - The HTTP response object used to send the generated number as a response.
 * @returns The generated number as a response with a status code of 200 (OK) and the `status` and `message` properties containing the generated number.
 *          If an error occurs, an error response is sent with a status code of 500 (Internal Server Error)
 *          and the `status` and `message` properties containing the error message.
 */
export const get = async (req: Request, res: Response): Promise<object> => {
  try {
    const { entityType, dealId } = req.body;
    const numberTypeId = getNumberTypeId(entityType);
    const endpoint = `${APIM_MDM_URL}numbers`;
    const payload = {
      numberTypeId,
      createdBy: USER.DTFS,
      requestingSystem: USER.DTFS,
    };

    console.info('⚡️ Invoking number generator for deal %s', dealId);

    const response: AxiosResponse = await axios.post(endpoint, [payload], headers);

    if (!response.data) {
      console.error('❌ Void number generator response received for deal %s %o', dealId, response);
      return res.status(HttpStatusCode.UnprocessableEntity).send({});
    }

    const { status, data } = response.data;

    console.info('✅ UKEF ID received %o for deal %s', data, dealId);

    return res.status(HttpStatusCode.Ok).send({ status, message: data });
  } catch (error) {
    console.error('❌ Error getting number from number generator for deal %s %o', error);

    return res.status(HttpStatusCode.InternalServerError).send({ status: HttpStatusCode.InternalServerError, message: error });
  }
};
