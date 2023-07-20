import { Request, Response } from 'express';
import addMinutes from 'date-fns/addMinutes';
import { getCollection } from '../../../database';
import { Estore } from '../../../interfaces';
import { ESTORE_SITE_STATUS, ESTORE_CRON_STATUS, UKEF_ID } from '../../../constants';
import { eStoreCronJobManager, eStoreTermStoreAndBuyerFolder, eStoreSiteCreationJob } from '../../../cronJobs';
import { createExporterSite, siteExists } from './eStoreApi';
import { objectIsEmpty } from '../../../utils';
const siteCreationTimer = addMinutes(new Date(), 7);

const validateEstoreInput = (eStoreData: any) => {
  const { dealIdentifier, facilityIdentifiers } = eStoreData;
  if (dealIdentifier.includes('100000') || dealIdentifier.includes(UKEF_ID.PENDING)) {
    return false;
  }

  if (facilityIdentifiers.includes(100000) || facilityIdentifiers.includes(UKEF_ID.PENDING)) {
    return false;
  }
  return true;
};

export const createEstore = async (req: Request, res: Response) => {
  const { dealId, siteId, facilityIdentifiers, supportingInformation, exporterName, buyerName, dealIdentifier, destinationMarket, riskMarket } = req.body;

  let eStoreData = {} as Estore;

  if (!objectIsEmpty(req.body)) {
    eStoreData = {
      dealId,
      siteId,
      facilityIdentifiers,
      supportingInformation,
      exporterName,
      buyerName,
      dealIdentifier,
      destinationMarket,
      riskMarket,
    };
  }

  // check if the body is not empty
  if (Object.keys(eStoreData).length) {
    // prevent test deals from triggering calls to eStore
    if (!validateEstoreInput(eStoreData)) {
      return res.status(200).send();
    }

    const cronJobLogsCollection = await getCollection('cron-job-logs');
    const cronAlreadyExists = await cronJobLogsCollection.findOne({ dealIdentifier: { $eq: eStoreData.dealIdentifier }, dealId: { $eq: eStoreData.dealId } });

    // check if the deal doesn't exist in the cron-job-logs collection
    if (!cronAlreadyExists) {
      // send a 200 response back to tfm-api
      // this is because we are not waiting for the cron-jobs to finish
      res.status(200).send();
      // keep track of new submissions
      // add a record in the database only if the site does not exist
      await cronJobLogsCollection.insertOne({
        ...eStoreData,
        timestamp: new Date(),
        siteExists: false,
        siteId: null,
        facilityCronJob: { status: ESTORE_CRON_STATUS.PENDING },
        dealCronJob: { status: ESTORE_CRON_STATUS.PENDING },
      });

      console.info('API Call: Checking if the site exists');
      const siteExistsResponse = await siteExists(eStoreData.exporterName);
      // check if site exists in eStore
      if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.CREATED) {
        // update the database to indicate that the site exists in eStore
        await cronJobLogsCollection.updateOne({ dealId: { $eq: eStoreData.dealId } }, { $set: { siteExists: true, siteId: siteExistsResponse.data.siteId } });

        eStoreData.siteId = siteExistsResponse.data.siteId;

        // add facilityIds to termStore and create the buyer folder
        eStoreTermStoreAndBuyerFolder(eStoreData);
      } else if (siteExistsResponse?.status === 404) {
        // update the database to indicate that a new cron job needs to be created to add a new site to Sharepoint
        await cronJobLogsCollection.updateOne({ dealId: { $eq: eStoreData.dealId } }, { $set: { siteCronJob: { status: ESTORE_CRON_STATUS.PENDING } } });

        // send a request to eStore to start creating the eStore site
        console.info('API Call started: Create a new eStore site for ', eStoreData.exporterName);
        const siteCreationResponse = await createExporterSite({ exporterName: eStoreData.exporterName });

        // check if the siteCreation endpoint returns a siteId - this is usually a number (i.e. 12345)
        if (siteCreationResponse?.data?.siteId) {
          // update the database with the new siteId
          await cronJobLogsCollection.updateOne({ dealId: { $eq: eStoreData.dealId } }, { $set: { siteName: siteCreationResponse.data.siteId } });
          // add a new job to the `Cron Job Manager` queue that runs every 50 seconds
          // in general, the site creation should take around 4 minutes, but we can check regularly to see if the site was created
          eStoreCronJobManager.add(siteCreationResponse.data.siteId, siteCreationTimer, async () => {
            await eStoreSiteCreationJob(eStoreData);
          });
          console.info('Cron job started: eStore Site Creation Cron Job started ', siteCreationResponse.data.siteId);
          // update the database to indicate that the `site cron job` started
          await cronJobLogsCollection.updateOne(
            { dealId: { $eq: eStoreData.dealId } },
            { $set: { 'siteCronJob.status': ESTORE_CRON_STATUS.RUNNING, 'siteCronJob.startDate': new Date() } },
          );
          eStoreCronJobManager.start(siteCreationResponse.data.siteId);
        } else {
          console.error('API Call failed: Unable to create a new site in eStore', { siteCreationResponse });
          // update the database to indicate that the API call failed
          await cronJobLogsCollection.updateOne({ dealId: { $eq: eStoreData.dealId } }, { $set: siteCreationResponse });
        }
      } else {
        console.error('API Call failed: Unable to check if a site exists', siteExistsResponse?.data);
        // update the database to indicate that the API call failed
        await cronJobLogsCollection.updateOne({ dealId: { $eq: eStoreData.dealId } }, { $set: { siteExistsResponse } });
      }
    } else {
      console.info('eStore API call is being re-triggered with the same payload', eStoreData.dealId);
      res.status(200).send();
    }
  } else {
    console.error('eStore body is empty', eStoreData);
    return res.status(200).send();
  }
  return res.status(200).send();
};
