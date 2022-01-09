import axios from 'axios';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { FACILITY_TYPE, PRODUCT_GROUP } from '../../constants';
dotenv.config();

const mapProductGroup = (facilityType: any) => {
  if (facilityType === FACILITY_TYPE.BOND) {
    return PRODUCT_GROUP.BOND;
  }

  if (facilityType === FACILITY_TYPE.LOAN) {
    return PRODUCT_GROUP.LOAN;
  }

  if (facilityType === FACILITY_TYPE.CASH) {
    // TODO: DTFS2-4633 - use correct product group.
    // TEMP whilst we don't know what product group to use for GEF.
    return PRODUCT_GROUP.LOAN;
  }

  if (facilityType === FACILITY_TYPE.CONTINGENT) {
    // TODO: DTFS2-4633 - use correct product group.
    // TEMP whilst we don't know what product group to use for GEF.
    return PRODUCT_GROUP.LOAN;
  }

  return null;
};

export const getExposurePeriod = async (req: Request, res: Response) => {
  const { startDate, endDate, facilityType } = req.params;

  const productGroup = mapProductGroup(facilityType);

  console.log('Calling Exposure Period API');
  const username: any = process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_KEY;
  const password: any = process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_SECRET;
  const exposurePeriodURL: any = process.env.MULESOFT_API_EXPOSURE_PERIOD_URL;

  const response = await axios({
    method: 'GET',
    url: `${exposurePeriodURL}?startdate=${startDate}&enddate=${endDate}&productgroup=${productGroup}`,
    auth: { username, password },
  }).catch((error) => {
    console.error('Error calling Exposure Period API', error.response);
    return error.response;
  });

  const { status, data } = response;

  const { exposurePeriod } = data;

  return res.status(status).send({
    exposurePeriodInMonths: exposurePeriod,
  });
};
