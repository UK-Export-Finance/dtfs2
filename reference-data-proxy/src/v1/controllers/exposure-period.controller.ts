import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { FACILITY_TYPE, PRODUCT_GROUP } from '../../constants';
dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

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

  console.info('Calling Exposure Period API');

  try {
    const response = await axios({
      method: 'get',
      url: `${APIM_MDM_URL}exposure-period?startdate=${startDate}&enddate=${endDate}&productgroup=${productGroup}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response) {
      return res.status(400).send({});
    }

    const { status, data } = response;

    const { exposurePeriod } = data;

    return res.status(status).send({
      exposurePeriodInMonths: exposurePeriod,
    });
  } catch (err) {
    console.error('Error calling Exposure Period API try catch', { err });
    return res.status(400).send({});
  }
};
