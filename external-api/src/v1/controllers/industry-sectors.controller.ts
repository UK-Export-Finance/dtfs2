import { Request, Response } from 'express';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { INDUSTRY_SECTORS } from '../../external-api';
import { isValidIndustryId, sortArrayAlphabetically } from '../../helpers';

dotenv.config();
const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  'Content-Type': 'application/json',
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

/**
 * Maps industry ID to ACBS compliant sector ID
 * @param {String} industryId UKEF Industry ID
 * @returns ACBS compliant industry ID
 */
export const findACBSIndustrySector = async (industryId: any) => {
  if (!isValidIndustryId(industryId.toString())) {
    console.error('Invalid industry id provided %s', industryId);
    return { data: 'Invalid industry ID', status: 400 };
  }

  const response = await axios({
    method: 'GET',
    url: `${APIM_MDM_URL}sector-industries?ukefIndustryId=${industryId}`,
    headers,
  }).catch((error: any) => {
    console.error('Error calling ACBS industry sector %o %s', error.response.data, error.response.status);
    return { data: 'Failed to find ACBS industry sector', status: error?.response?.status || 500 };
  });
  return response;
};

const sortIndustrySectors = (industrySectors: any) =>
  sortArrayAlphabetically(industrySectors, 'name').map((sector: any) => ({
    ...sector,
    classes: sortArrayAlphabetically(sector.classes, 'name'),
  }));

const findOneIndustrySector = (findCode: any) => INDUSTRY_SECTORS.find(({ code }: any) => code === findCode);

export const findAll = (req: Request, res: Response) =>
  res.status(200).send({
    count: INDUSTRY_SECTORS.length,
    industrySectors: sortIndustrySectors(INDUSTRY_SECTORS),
  });

export const findOne = (req: Request, res: Response) => {
  const industrySector = findOneIndustrySector(req.params.code);
  const status = industrySector ? 200 : 404;
  res.status(status).send(industrySector);
};

export const getACBSIndustrySector = async (req: Request, res: Response) => {
  const { code } = req.params;

  const { status, data } = await findACBSIndustrySector(code);

  return res.status(status).send(data[0]);
};
