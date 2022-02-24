import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const postToEstore = async (apiEndpoint: string, apiData: any) => {
  const eStoreUrl: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_URL;
  const username: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_KEY;
  const password: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_SECRET;

  if (!eStoreUrl) {
    return false;
  }

  console.info(`Calling eStore API (/${apiEndpoint})`);

  const response = await axios({
    method: 'post',
    url: `${eStoreUrl}/${apiEndpoint}`,
    auth: { username, password },
    headers: {
      'Content-Type': 'application/json',
    },
    data: [apiData],
  }).catch((catchErr: any) => {
    console.error(`Error calling eStore API (/${apiEndpoint}): ${catchErr.response.status} \n`, catchErr.response.data);
    return catchErr.response;
  });

  return response;
};

export const createExporterSite = (exporterName: any) => postToEstore('site', { exporterName });
export const createBuyerFolder = ({ siteName, ...apiData }: any) => postToEstore(`site/${siteName}/buyer`, apiData);
export const createDealFolder = ({ siteName, ...apiData }: any) => postToEstore(`site/${siteName}/deal`, apiData);
export const createFacilityFolder = ({ siteName, dealIdentifier, ...apiData }: any) =>
  postToEstore(`site/${siteName}/deal/${dealIdentifier}/facility`, apiData);
