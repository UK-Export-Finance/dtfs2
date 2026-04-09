import { HEADERS, IndustrySectorInterface, industrySector } from '@ukef/dtfs2-common';
import { Request, Response } from 'express';
import axios, { AxiosError, HttpStatusCode } from 'axios';
import * as dotenv from 'dotenv';
import { INDUSTRY_SECTORS } from '../../external-api';
import { isValidIndustryId, sortArrayAlphabetically } from '../../helpers';

dotenv.config();
const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

/**
 * Maps industry ID to ACBS compliant sector ID
 * @param {number} industryId UKEF Industry ID
 * @returns ACBS compliant industry ID
 */
export const findACBSIndustrySector = async (industryId: number): Promise<{ data: string | Array<industrySector>; status: number }> => {
  if (!isValidIndustryId(industryId.toString())) {
    console.error('Invalid industry id provided %s', industryId);
    return { data: 'Invalid industry ID', status: HttpStatusCode.BadRequest };
  }

  const response = await axios({
    method: 'GET',
    url: `${APIM_MDM_URL}v1/sector-industries?ukefIndustryId=${industryId}`,
    headers,
  }).catch((error: AxiosError) => {
    console.error('Error calling ACBS industry sector %o %s', error?.response?.data, error?.response?.status);
    return { data: 'Failed to find ACBS industry sector', status: error?.response?.status || HttpStatusCode.InternalServerError };
  });

  return response;
};

/**
 * Sorts an array of industry sectors alphabetically by their `name` property,
 * and also sorts each sector's `classes` array alphabetically by `name`.
 *
 * @param industrySectors - The array of industry sector objects to sort.
 * @returns A new array of industry sector objects sorted by name, with each sector's `classes` also sorted by name.
 */
const sortIndustrySectors = (industrySectors: IndustrySectorInterface[]): Array<IndustrySectorInterface> => {
  const industrySectorsSorted = sortArrayAlphabetically(industrySectors, 'name') as IndustrySectorInterface[];

  industrySectorsSorted.map((sector: IndustrySectorInterface) => ({
    ...sector,
    classes: sortArrayAlphabetically(sector.classes, 'name'),
  }));

  return industrySectorsSorted;
};

/**
 * Finds and returns an industry sector object from the `INDUSTRY_SECTORS` array that matches the provided code.
 *
 * @param findCode - The code to search for within the industry sectors.
 * @returns The industry sector object with the matching code, or `undefined` if not found.
 */
const findOneIndustrySector = (findCode: any) => INDUSTRY_SECTORS.find(({ code }: any) => code === findCode);

/**
 * Handles the request to retrieve all industry sectors.
 * Sorts the industry sectors and returns them along with their count.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns A response with the count and sorted list of industry sectors.
 */
export const findAll = (req: Request, res: Response) => {
  const industrySectors = sortIndustrySectors(INDUSTRY_SECTORS);

  return res.status(HttpStatusCode.Ok).send({
    count: industrySectors.length,
    industrySectors,
  });
};

/**
 * Fetches the industry sector from code
 * @param req Express request
 * @param res Express Response
 * @returns Industry sector information
 */
export const findOne = (req: Request, res: Response) => {
  const sector = findOneIndustrySector(req.params.code);
  const status = sector ? HttpStatusCode.Ok : HttpStatusCode.NotFound;

  return res.status(status).send(sector);
};

/**
 * Handles the request to retrieve an ACBS industry sector by its code.
 *
 * @param req - Express request object containing the industry sector code in `req.params.code`.
 * @param res - Express response object used to send the retrieved industry sector data.
 * @returns Sends the first matching industry sector data with the corresponding HTTP status.
 */
export const getACBSIndustrySector = async (req: Request, res: Response) => {
  const { code } = req.params;

  const { status, data } = await findACBSIndustrySector(Number(code));

  return res.status(status).send(data[0]);
};
