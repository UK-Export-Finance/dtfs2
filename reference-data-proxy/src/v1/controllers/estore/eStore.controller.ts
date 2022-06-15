import { Request, Response } from 'express';
import { getCollection } from '../../../database';
import { Estore } from '../../../interfaces';
import { ESTORE_SITE_STATUS, ESTORE_CRON_STATUS, UKEF_ID } from '../../../constants';
import { eStoreCronJobManager, eStoreTermStoreAndBuyerFolder, eStoreSiteCreationJob } from '../../../cronJobs';
import { createExporterSite, siteExists } from './eStoreApi';

const siteCreationTimer = '50 * * * * *'; // ~ 50 seconds

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

const checkExistingCronJobs = async () => {
  const cronJobLogsCollection = await getCollection('cron-job-logs');
  console.info('Cron Job: Checking for running CronJobs');
  const runningCronJobs = await cronJobLogsCollection.find({ 'siteCronJob.status': ESTORE_CRON_STATUS.RUNNING }).toArray();

  if (runningCronJobs.length) {
    console.info('Cron Job: The following jobs are running ', runningCronJobs);
    // eslint-disable-next-line no-restricted-syntax
    for (const job of runningCronJobs) {
      eStoreCronJobManager.add(job.siteName, siteCreationTimer, async () => {
        await eStoreSiteCreationJob(job);
      });
      eStoreCronJobManager.start(job.siteName);
    }
  } else {
    console.info('Cron Job: There are no active CronJobs');
  }
};

checkExistingCronJobs();

export const createEstore = async (req: Request, res: Response) => {
  const eStoreData: Estore = req.body;

  // check if the body is not empty
  if (Object.keys(eStoreData).length) {
    // prevent test deals from triggering calls to eStore
    if (!validateEstoreInput(eStoreData)) {
      return res.status(200).send();
    }
    // send a 200 response back to tfm-api
    // this is because we are not waiting for the cron-jobs to finish
    res.status(200).send();

    const cronJobLogsCollection = await getCollection('cron-job-logs');
    const cronAlreadyExists = await cronJobLogsCollection.findOne({ dealIdentifier: eStoreData.dealIdentifier, dealId: eStoreData.dealId });

    // check if the deal doesn't exist in the cron-job-logs collection
    if (!cronAlreadyExists) {
      // keep track of new submissions
      // add a record in the database only if the site does not exist
      await cronJobLogsCollection.insertOne({
        ...eStoreData,
        timestamp: new Date(),
        siteExists: false,
        siteName: null,
        facilityCronJob: { status: ESTORE_CRON_STATUS.PENDING },
        dealCronJob: { status: ESTORE_CRON_STATUS.PENDING },
      });

      console.info('API Call: Checking if the site exists');
      const siteExistsResponse = await siteExists({ exporterName: eStoreData.exporterName });
      // check if site exists in eStore
      if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.CREATED) {
        // update the database to indicate that the site exists in eStore
        await cronJobLogsCollection.updateOne({ dealId: eStoreData.dealId }, { $set: { siteExists: true, siteName: siteExistsResponse.data.siteName } });

        eStoreData.siteName = siteExistsResponse.data.siteName;

        // add facilityIds to termStore and create the buyer folder
        eStoreTermStoreAndBuyerFolder(eStoreData);
      } else if (siteExistsResponse?.status === 404 && siteExistsResponse?.data?.siteName === '') {
        // update the database to indicate that a new cron job needs to be created to add a new site to Sharepoint
        await cronJobLogsCollection.updateOne({ dealId: eStoreData.dealId }, { $set: { siteCronJob: { status: ESTORE_CRON_STATUS.PENDING } } });

        // send a request to eStore to start creating the eStore site
        console.info('API Call started: Create a new eStore site for ', eStoreData.exporterName);
        const siteCreationResponse = await createExporterSite({ exporterName: eStoreData.exporterName });

        // check if the siteCreation endpoint returns a siteName - this is usually a number (i.e. 12345)
        if (siteCreationResponse?.data?.siteName) {
          // update the database with the new siteName
          await cronJobLogsCollection.updateOne({ dealId: eStoreData.dealId }, { $set: { siteName: siteCreationResponse.data.siteName } });
          // add a new job to the `Cron Job Manager` queue that runs every 50 seconds
          // in general, the site creation should take around 4 minutes, but we can check regularly to see if the site was created
          eStoreCronJobManager.add(siteCreationResponse.data.siteName, siteCreationTimer, async () => {
            await eStoreSiteCreationJob(eStoreData);
          });
          console.info('Cron job started: eStore Site Creation Cron Job started ', siteCreationResponse.data.siteName);
          // update the database to indicate that the `site cron job` started
          await cronJobLogsCollection.updateOne(
            { dealId: eStoreData.dealId },
            { $set: { 'siteCronJob.status': ESTORE_CRON_STATUS.RUNNING, 'siteCronJob.startDate': new Date() } },
          );
          eStoreCronJobManager.start(siteCreationResponse.data.siteName);
        } else {
          console.error('API Call failed: Unable to create a new site in eStore', { siteCreationResponse });
          // update the database to indicate that the API call failed
          await cronJobLogsCollection.updateOne({ dealId: eStoreData.dealId }, { $set: siteCreationResponse });
        }
      } else {
        console.error('API Call failed: Unable to check if a site exists', { siteExistsResponse });
        // update the database to indicate that the API call failed
        await cronJobLogsCollection.updateOne({ dealId: eStoreData.dealId }, { $set: { siteExistsResponse } });
      }
    } else {
      console.info('eStore API call is being re-triggered with the same payload', eStoreData.dealId);
      return res.status(200).send();
    }
  } else {
    console.error('eStore body is empty', eStoreData);
    return res.status(200).send();
  }
  return res.status(200).send();
};
