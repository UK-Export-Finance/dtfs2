import * as dotenv from 'dotenv';
import { HEADERS } from '@ukef/dtfs2-common';
import axios, { AxiosResponse, HttpStatusCode } from 'axios';

dotenv.config();

const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;

const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  'x-api-key': String(EXTERNAL_API_KEY),
};

/**
 * Makes a POST request to an external-api microservice
 * to get a number from APIM MDM.
 * @param entityType - The type of entity.
 * @param dealId - The ID of the deal.
 * @returns A Promise that resolves to an AxiosResponse object.
 */
export const getNumber = async (entityType: string, dealId: string): Promise<object> => {
  try {
    if (!entityType || !dealId) {
      console.error('❌ Invalid argument provided %s %s', entityType, dealId);
      throw new Error(`Invalid argument provided for ${dealId}`);
    }

    const response: AxiosResponse = await axios.post(
      `${EXTERNAL_API_URL}/number-generator`,
      {
        entityType,
        dealId,
      },
      {
        headers,
      },
    );

    if (!response.data) {
      console.error('❌ Invalid number generator response received from external-api for deal %s %o', dealId, response);
      throw new Error(`Invalid number generator response received from external-api for deal ${dealId}`, {
        cause: 'Invalid response from external-api',
      });
    }

    return response;
  } catch (error: unknown) {
    console.error('❌ Error sending payload to external-api microservice %o', error);

    return {
      status: HttpStatusCode.InternalServerError,
      error,
    };
  }
};
