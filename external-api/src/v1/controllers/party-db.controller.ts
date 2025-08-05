import { CustomExpressRequest, HEADERS, isValidCompanyRegistrationNumber, industrySector } from '@ukef/dtfs2-common';
import { Request, Response } from 'express';
import axios, { AxiosError, HttpStatusCode } from 'axios';
import * as dotenv from 'dotenv';
import { findACBSIndustrySector } from './industry-sectors.controller';

dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

export const lookup = async (req: Request, res: Response) => {
  try {
    const { partyDbCompanyRegistrationNumber: companyReg } = req.params;

    if (!isValidCompanyRegistrationNumber(companyReg)) {
      console.error('Invalid company registration number provided %s', companyReg);
      return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, data: 'Invalid company registration number' });
    }

    const response: { status: number; data: unknown } = await axios({
      method: 'get',
      url: `${APIM_MDM_URL}customers?companyReg=${companyReg}`,
      headers,
    });

    const { status, data } = response;
    return res.status(status).send(data);
  } catch (error) {
    console.error('Error calling Party DB API %o', error);
    if (error instanceof AxiosError) {
      return res.status(error?.response?.status || HttpStatusCode.InternalServerError).send('Error calling Party DB API');
    }
    return res.status(HttpStatusCode.InternalServerError).send({ status: HttpStatusCode.InternalServerError, message: 'An unknown error occurred' });
  }
};

/**
 * Handles the creation or retrieval of a party (customer) in the Party DB.
 *
 * Validates the provided company registration number and company name.
 * If valid, sends a POST request to the Party DB API to create or retrieve the party.
 * Responds with the API response or appropriate error messages.
 *
 * @param req - Express request object containing the party details in the body.
 * @param res - Express response object used to send the response.
 * @returns Sends an HTTP response with the result of the Party DB API call or an error message.
 */
export const getOrCreateParty = async (
  req: CustomExpressRequest<{
    reqBody: { companyRegNo: string; companyName: string; probabilityOfDefault: number; isUkEntity: number; code: number };
  }>,
  res: Response,
) => {
  try {
    const { companyRegNo: companyRegistrationNumber, companyName, probabilityOfDefault, isUkEntity, code } = req.body;

    if (!companyRegistrationNumber || !isValidCompanyRegistrationNumber(companyRegistrationNumber)) {
      console.error('Invalid company registration number provided %s', companyRegistrationNumber);
      return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, data: 'Invalid company registration number' });
    }

    if (!companyName) {
      console.error('No company name provided');
      return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, data: 'Invalid company name' });
    }

    const industryData = await findACBSIndustrySector(code);

    if (!Array.isArray(industryData.data) || !industryData?.data?.length) {
      throw new Error('Unable to get industry sector data');
    }

    const { acbsIndustryId: ukefIndustryId, acbsSectorId: ukefSectorId } = industryData.data[0] as industrySector;

    const response: { status: number; data: unknown } = await axios({
      method: 'post',
      url: `${APIM_MDM_URL}customers`,
      headers,
      data: {
        companyRegistrationNumber,
        companyName,
        probabilityOfDefault,
        isUkEntity,
        ukefIndustryId,
        ukefSectorId,
      },
    });

    console.log('===============>', { response });

    const { status, data } = response;

    return res.status(status).send(data);
  } catch (error) {
    console.error('Error calling Party DB API %o', error);
    if (error instanceof AxiosError) {
      return res.status(error?.response?.status || HttpStatusCode.InternalServerError).send('Error calling Party DB API');
    }
    return res.status(HttpStatusCode.InternalServerError).send({ status: HttpStatusCode.InternalServerError, message: 'An unknown error occurred' });
  }
};
