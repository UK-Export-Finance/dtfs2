import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import * as utils from '../../utils';
import { INDUSTRY_SECTORS } from '../../reference-data';

dotenv.config();

export const findACBSIndustrySector = async (industryId: any) => {
  const mdmEAurl: any = process.env.MULESOFT_API_UKEF_MDM_EA_URL;
  const username: any = process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_KEY;
  const password: any = process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_SECRET;
  const response = await axios({
    method: 'GET',
    url: `${mdmEAurl}/map-industry-sector?ukefIndustryId=${industryId}`,
    auth: { username, password },
  }).catch((error: any) => {
    console.error('Error calling Map Industry Sector API', error.response);
    return error.response;
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
