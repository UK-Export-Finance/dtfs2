import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { getCollection } from '../../../database';
import { Estore } from '../../../interfaces';
import { ESTORE_SITE_STATUS, ESTORE_CRON_STATUS } from '../../../constants';
import { isValidId, objectIsEmpty } from '../../../helpers';
import { eStoreCronJobManager, eStoreTermStoreAndBuyerFolder, eStoreSiteCreationCron } from '../../../cron';
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

  /**
   * Minimum payload validation.
   * Ensure `eStoreData` object is references rather a direct `req.body` reference.
   */
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
        payload: eStoreData,
        timestamp: new Date().valueOf(),
        cron: {
          site: { status: ESTORE_CRON_STATUS.PENDING },
          term: { status: ESTORE_CRON_STATUS.PENDING },
          buyer: { status: ESTORE_CRON_STATUS.PENDING },
          deal: { status: ESTORE_CRON_STATUS.PENDING },
          facility: { status: ESTORE_CRON_STATUS.PENDING },
        },
      });

      // Step 2: Site exists check
      console.info('Initiating eStore site existence check for exporter %s', eStoreData.exporterName);
      const siteExistsResponse = await siteExists(eStoreData.exporterName);

      console.log('====RESPONSE-1', { siteExistsResponse });

      // Step 3: Site already exists in eStore
      if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.CREATED) {
        /**
         * Update record-set with the site name.
         * Update `cron-job-logs`
         */
        await cronJobLogs.updateOne(
          { dealId: { $eq: new ObjectId(eStoreData.dealId) } },
          {
            $set: {
              'response.site.siteId': siteExistsResponse.data.siteId,
              'cron.site': {
                status: ESTORE_CRON_STATUS.COMPLETED,
                timestamp: new Date().valueOf(),
              },
            },
          },
        );

        // Update `tfm-deals`
        await tfmDeals.updateOne({ dealId: { $eq: new ObjectId(eStoreData.dealId) } }, { $set: { 'tfm.estore.siteName': siteExistsResponse.data.siteId } });

        // Update object
        eStoreData.siteId = siteExistsResponse.data.siteId;

        // Add facility IDs to term store and create the buyer folder
        eStoreTermStoreAndBuyerFolder(eStoreData);
      } else if (siteExistsResponse?.status === 404) {
        // Step 3: Site does not exists in eStore

        // Create a new eStore site
        console.info('eStore site creation initiated for exporter %s with deal %s', eStoreData.exporterName, eStoreData.dealIdentifier);
        const siteCreationResponse = await createExporterSite({ exporterName: eStoreData.exporterName });

        // Check if the siteCreation endpoint returns a siteId - this is usually a number (i.e. 12345)
        if (siteCreationResponse?.data?.siteId) {
          /**
           * Add a new site specific CRON job, which is initialised upon addition to the
           * CRON Job manager. Site creation timeframe can vary.
           */
          const cron = `estore_cron_site_${eStoreData.dealId}`;
          eStoreCronJobManager.add(cron, new Date(), () => {
            eStoreSiteCreationCron(eStoreData);
          });

          // Update `cron-job-logs`
          console.info('eStore site %s CRON job %s initiated.', siteCreationResponse.data.siteId, cron);
          await cronJobLogs.updateOne(
            { dealId: { $eq: new ObjectId(eStoreData.dealId) } },
            {
              $set: {
                'cron.site': {
                  status: ESTORE_CRON_STATUS.RUNNING,
                  timestamp: new Date().valueOf(),
                },
              },
            },
          );

          // Start CRON job
          eStoreCronJobManager.start(cron);
        } else {
          console.error('eStore site creation failed for deal %s %O', eStoreData.dealIdentifier, siteCreationResponse?.data);

          // CRON job log update
          await cronJobLogs.updateOne(
            { dealId: { $eq: new ObjectId(eStoreData.dealId) } },
            {
              $set: {
                'cron.site.create': {
                  response: siteCreationResponse,
                  status: ESTORE_CRON_STATUS.FAILED,
                  timestamp: new Date().valueOf(),
                },
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
              'cron.site.exist': {
                response: siteExistsResponse,
                status: ESTORE_CRON_STATUS.FAILED,
                timestamp: new Date().valueOf(),
              },
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
