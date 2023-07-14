import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import { isValidPartyDbCompaniesNumber } from '../../utils/inputValidations';
dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  'Content-Type': 'application/json',
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

export const lookup = async (req: Request, res: Response) => {
  const { partyDbCompanyRegistrationNumber: companyReg } = req.params;

  if (!isValidPartyDbCompaniesNumber(companyReg)) {
    console.error('Invalid company registration number provided: %s', companyReg);
    return res.status(400).send({ status: 400, data: 'Invalid company registration number' });
  }

  const response = await axios({
    method: 'get',
    url: `${APIM_MDM_URL}customers?companyReg=${companyReg}`,
    headers,
  }).catch((error: any) => {
    console.error('Error calling Party DB API', { error });
    return { data: error?.response?.data, status: error?.response?.status };
  });

  const { status, data } = response;

  return res.status(status).send(data);
};
