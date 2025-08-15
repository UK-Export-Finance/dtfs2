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
    url: `${APIM_MDM_URL}sector-industries?ukefIndustryId=${industryId}`,
    headers,
  }).catch((error: AxiosError) => {
    console.error('Error calling ACBS industry sector %o %s', error?.response?.data, error?.response?.status);
    return { data: 'Failed to find ACBS industry sector', status: error?.response?.status || HttpStatusCode.InternalServerError };
  });

  return response;
};

const sortIndustrySectors = (industrySectors: IndustrySectorInterface[]) => {
  const industrySectorsSorted = sortArrayAlphabetically(industrySectors, 'name') as IndustrySectorInterface[];

  industrySectorsSorted.map((sector: IndustrySectorInterface) => ({
    ...sector,
    classes: sortArrayAlphabetically(sector.classes, 'name'),
  }));
};

const findOneIndustrySector = (findCode: any) => INDUSTRY_SECTORS.find(({ code }: any) => code === findCode);

export const findAll = (req: Request, res: Response) =>
  res.status(HttpStatusCode.Ok).send({
    count: INDUSTRY_SECTORS.length,
    industrySectors: sortIndustrySectors(INDUSTRY_SECTORS),
  });

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

export const getACBSIndustrySector = async (req: Request, res: Response) => {
  const { code } = req.params;

  const { status, data } = await findACBSIndustrySector(Number(code));

  return res.status(status).send(data[0]);
};
