import { Request, Response } from 'express';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as utils from '../../utils';
import { INDUSTRY_SECTORS } from '../../reference-data';

dotenv.config();
const mdmEAurl: any = process.env.MULESOFT_API_UKEF_MDM_EA_URL;
const username: any = process.env.APIM_MDM_KEY;
const password: any = process.env.APIM_MDM_VALUE;

export const findACBSIndustrySector = async (industryId: any) => {
  const response = await axios({
    method: 'GET',
    url: `${mdmEAurl}/map-industry-sector?ukefIndustryId=${industryId}`,
    auth: { username, password },
  }).catch((error: any) => {
    console.error('Error calling Map Industry Sector API', error.response.data, error.response.status);
    return { data: error.response.data, status: error.response.status };
  });
  return response;
};

const sortIndustrySectors = (industrySectors: any) =>
  utils.sortArrayAlphabetically(industrySectors, 'name').map((sector: any) => ({
    ...sector,
    classes: utils.sortArrayAlphabetically(sector.classes, 'name'),
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
