import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import addMinutes from 'date-fns/addMinutes';
import { getCollection } from '../../../database';
import { Estore } from '../../../interfaces';
import { ESTORE_SITE_STATUS, ESTORE_CRON_STATUS } from '../../../constants';
import { isValidId, objectIsEmpty } from '../../../helpers';
import { eStoreCronJobManager, eStoreTermStoreAndBuyerFolder, eStoreSiteCreationJob } from '../../../cronJobs';
import { createExporterSite, siteExists } from './eStoreApi';

export const createEstore = async (req: Request, res: Response) => {
  // Ensure `red.body` is valid
  if (objectIsEmpty(req.body)) {
    return res.status(400).send({ status: 400, message: 'Invalid request' });
  }

  const { dealId, siteId, facilityIdentifiers, supportingInformation, exporterName, buyerName, dealIdentifier, destinationMarket, riskMarket } = req.body;

  let eStoreData = {} as Estore;

  eStoreData = {
    dealId: new ObjectId(dealId),
    dealIdentifier,
    facilityIdentifiers,
    siteId,
    exporterName,
    buyerName,
    destinationMarket,
    riskMarket,
    supportingInformation,
  };

  // Minimum payload validation
  if (Object.keys(eStoreData).length) {
    // 1. Void IDs check
    if (!isValidId(eStoreData)) {
      console.error('Void eStore IDs');
      return res.status(400).send({ status: 400, message: 'Void IDs' });
    }

    if (!ObjectId.isValid(eStoreData.dealId)) {
      console.error('Void eStore deal ObjectId');
      return res.status(400).send({ status: 400, message: 'Void deal ObjectId' });
    }

    // Ensure new CRON job creation
    const cronJobLogs = await getCollection('cron-job-logs');
    const tfmDeals = await getCollection('tfm-deals');

    const cronJobExists = await cronJobLogs.findOne({ dealId: { $eq: new ObjectId(eStoreData.dealId) } });

    if (!cronJobExists) {
      /**
       * Send `200` status code back to avoid
       * `TFM-API` awaiting.
       */
      console.info('Creating new CRON job for deal %s', eStoreData.dealIdentifier);
      res.status(200).send();

      // Step 1: Add CRON job to the collection
      await cronJobLogs.insertOne({
        ...eStoreData,
        siteExists: false,
        cron: {
          deal: { status: ESTORE_CRON_STATUS.PENDING },
          facility: { status: ESTORE_CRON_STATUS.PENDING },
        },
        timestamp: new Date().valueOf(),
      });

      // Step 2: Site exists check
      console.info('eStore site exist check');
      const siteExistsResponse = await siteExists(eStoreData.exporterName);

      // Step 3: Site already exists in eStore
      if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.CREATED) {
        /**
         * Update record-set with the site name.
         * Update `cron-job-logs`
         */
        await cronJobLogs.updateOne(
          { dealId: { $eq: new ObjectId(eStoreData.dealId) } },
          { $set: { siteExists: true, siteId: siteExistsResponse.data.siteId } },
        );

        // Update `tfm-deals`
        await tfmDeals.updateOne({ dealId: { $eq: new ObjectId(eStoreData.dealId) } }, { $set: { 'tfm.estore.siteName': siteExistsResponse.data.siteId } });

        // Update object
        eStoreData.siteId = siteExistsResponse.data.siteId;

        // add facilityIds to termStore and create the buyer folder
        eStoreTermStoreAndBuyerFolder(eStoreData);
      } else if (siteExistsResponse?.status === 404) {
        // Step 3: Site does not exists in eStore
        // Update `cron-job-logs`
        await cronJobLogs.updateOne({ dealId: { $eq: new ObjectId(eStoreData.dealId) } }, { $set: { 'cron.site': { status: ESTORE_CRON_STATUS.PENDING } } });

        // Create a new eStore site
        console.info('eStore site creation initiated for exporter %s with deal %s', eStoreData.exporterName, eStoreData.dealIdentifier);
        const siteCreationResponse = await createExporterSite({ exporterName: eStoreData.exporterName });

        // Check if the siteCreation endpoint returns a siteId - this is usually a number (i.e. 12345)
        if (siteCreationResponse?.data?.siteId) {
          // Update `cron-job-logs`
          await cronJobLogs.updateOne({ dealId: { $eq: new ObjectId(eStoreData.dealId) } }, { $set: { siteId: siteCreationResponse.data.siteId } });
          // Update `tfm-deals`
          await tfmDeals.updateOne({ dealId: { $eq: new ObjectId(eStoreData.dealId) } }, { $set: { 'tfm.estore.siteName': siteExistsResponse.data.siteId } });

          // add a new job to the `Cron Job Manager` queue that runs every 50 seconds
          // in general, the site creation should take around 4 minutes, but we can check regularly to see if the site was created
          const siteCreationTimer = addMinutes(new Date(), 7);
          eStoreCronJobManager.add(`Site${eStoreData.dealId}`, siteCreationTimer, () => {
            eStoreSiteCreationJob(eStoreData);
          });

          // Update `cron-job-logs`
          console.info('eStore site %s CRON job initiated.', siteCreationResponse.data.siteId);
          await cronJobLogs.updateOne(
            { dealId: { $eq: new ObjectId(eStoreData.dealId) } },
            { $set: { 'cron.site.status': ESTORE_CRON_STATUS.RUNNING, 'cron.site.timestamp': new Date() } },
          );

          // Start CRON job
          eStoreCronJobManager.start(`Site${eStoreData.dealId}`);
        } else {
          console.error('eStore site creation failed for deal %s %O', eStoreData.dealIdentifier, siteCreationResponse?.data);

          // CRON job log update
          await cronJobLogs.updateOne(
            { dealId: { $eq: new ObjectId(eStoreData.dealId) } },
            {
              $set: {
                'failure.site.create.response': siteCreationResponse,
                'failure.site.create.status': ESTORE_CRON_STATUS.FAILED,
                'failure.site.create.timestamp': new Date().valueOf(),
              },
            },
          );
        }
      } else {
        console.error('eStore site exist check failed for deal %s %O', eStoreData.dealIdentifier, siteExistsResponse?.data);

        // CRON job log update
        await cronJobLogs.updateOne(
          { dealId: { $eq: new ObjectId(eStoreData.dealId) } },
          {
            $set: {
              'failure.site.exist.response': siteExistsResponse,
              'failure.site.exist.status': ESTORE_CRON_STATUS.FAILED,
              'failure.site.exist.timestamp': new Date().valueOf(),
            },
          },
        );
      }
    } else {
      console.info('eStore CRON job exists for deal %s', eStoreData.dealIdentifier);
      res.status(200).send();
    }
  } else {
    console.error('Void eStore payload %O', eStoreData);
    return res.status(400).send({ status: 400, message: 'Void eStore payload' });
  }

  return res.status(200).send();
};
