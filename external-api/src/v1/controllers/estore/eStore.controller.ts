import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { getCollection } from '../../../database';
import { Estore, SiteExistsResponse, EstoreErrorResponse } from '../../../interfaces';
import { ESTORE_SITE_STATUS, ESTORE_CRON_STATUS } from '../../../constants';
import { areValidUkefIds, objectIsEmpty } from '../../../helpers';
import { eStoreTermStoreAndBuyerFolder, eStoreSiteCreationCron } from '../../../cron';
import { createExporterSite, siteExists } from './eStoreApi';
import dotenv from 'dotenv';
import { CronJob } from 'cron';

dotenv.config();

const { ESTORE_CRON_MANAGER_SCHEDULE, TZ } = process.env;

export const create = async (req: Request, res: Response) => {
  try {
    // Ensure `red.body` is valid
    if (objectIsEmpty(req.body)) {
      return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, message: 'Invalid request' });
    }

    // Ensure new CRON job creation
    const cronJobLogs = await getCollection('cron-job-logs');
    const tfmDeals = await getCollection('tfm-deals');

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
      if (!areValidUkefIds(eStoreData)) {
        console.error('Invalid eStore IDs');
        return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, message: 'Invalid IDs' });
      }

      if (!ObjectId.isValid(eStoreData.dealId)) {
        console.error('Invalid eStore deal ObjectId');
        return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, message: 'Invalid deal ObjectId' });
      }

      const cronJobExists = await cronJobLogs.findOne({ 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } });

      if (!cronJobExists) {
        /**
         * Send `HttpStatusCode.Created` status code back to avoid
         * `TFM-API` awaiting.
         */
        console.info('Creating new CRON job for deal %s', eStoreData.dealIdentifier);
        res.status(HttpStatusCode.Created).send({ status: HttpStatusCode.Created, message: 'eStore job accepted' });

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
        const siteExistsResponse: SiteExistsResponse | EstoreErrorResponse = await siteExists(eStoreData.exporterName);

        const created = siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.CREATED;
        const provisioning = siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.PROVISIONING;
        const absent = siteExistsResponse?.data?.status === HttpStatusCode.NotFound;

        // Step 3: Site already exists in eStore
        if (created) {
          /**
           * Update record-set with the site name.
           * Update `cron-job-logs`
           */
          await cronJobLogs.updateOne(
            { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
            {
              $set: {
                'response.site.siteId': siteExistsResponse.data.siteId,
                'cron.site.create': {
                  status: ESTORE_CRON_STATUS.COMPLETED,
                  timestamp: new Date().valueOf(),
                },
                'cron.site.status': ESTORE_CRON_STATUS.COMPLETED,
              },
            },
          );

          // Update `tfm-deals`
          await tfmDeals.updateOne(
            { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
            { $set: { 'tfm.estore.siteName': siteExistsResponse.data.siteId } },
          );

          // Update object
          eStoreData.siteId = String(siteExistsResponse.data.siteId);

          // Add facility IDs to term store and create the buyer folder
          eStoreTermStoreAndBuyerFolder(eStoreData);
        } else if (absent || provisioning) {
          let siteCreationResponse;
          // Step 3: Site does not exists in eStore

          // Create a new eStore site
          if (provisioning) {
            // When site status is provisioning
            console.info('eStore site creation in progress for deal %s', eStoreData.dealIdentifier);
            siteCreationResponse = siteExistsResponse;
          } else {
            console.info('eStore site creation initiated for exporter %s with deal %s', eStoreData.exporterName, eStoreData.dealIdentifier);
            siteCreationResponse = await createExporterSite({ exporterName: eStoreData.exporterName });
          }

          // Check if the siteCreation endpoint returns a siteId - this is usually a number (i.e. 12345)
          if (siteCreationResponse?.data?.siteId) {
            /**
             * Add a new site specific CRON job, which is initialised upon creation
             */
            const siteCreateCronId = `estore_cron_site_${eStoreData.dealId}`;
            const siteCreateCronJob = new CronJob(
              String(ESTORE_CRON_MANAGER_SCHEDULE), // Cron schedule
              () => {
                eStoreSiteCreationCron(eStoreData);
              }, // On tick
              () => {
                console.info('✅ eStore site creation has been completed successfully for deal %s', eStoreData.dealId);
              }, // On complete
              false, // Start the job
              TZ, // Timezone
            );

            // Only start if job is not already running
            if (!siteCreateCronJob.running) {
              siteCreateCronJob.start();
            }

            // Update `cron-job-logs`
            console.info('eStore site %s CRON job %s initiated.', siteCreationResponse.data.siteId, siteCreateCronId);
          } else {
            console.error('eStore site creation failed for deal %s %o', eStoreData.dealIdentifier, siteCreationResponse?.data);

            // CRON job log update
            await cronJobLogs.updateOne(
              { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
              {
                $set: {
                  'cron.site.create': {
                    response: siteCreationResponse?.data,
                    status: ESTORE_CRON_STATUS.FAILED,
                    timestamp: new Date().valueOf(),
                  },
                  'cron.site.status': ESTORE_CRON_STATUS.FAILED,
                },
              },
            );
          }
        } else {
          console.error('❌ eStore site exist check failed for deal %s %O', eStoreData.dealIdentifier, siteExistsResponse);

          // CRON job log update
          await cronJobLogs.updateOne(
            { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
            {
              $set: {
                'cron.site.create': {
                  status: ESTORE_CRON_STATUS.FAILED,
                  timestamp: new Date().valueOf(),
                },
                'cron.site.status': ESTORE_CRON_STATUS.FAILED,
              },
            },
          );
        }
      } else {
        // When CRON job already exists for provided deal id.
        console.info('eStore CRON job exists for deal %s', eStoreData.dealIdentifier);
        res.status(HttpStatusCode.Accepted).send({ status: HttpStatusCode.Accepted, message: 'eStore job in queue' });
      }
    } else {
      console.error('❌ Invalid eStore payload %O', eStoreData);

      // CRON job log update
      await cronJobLogs.updateOne(
        { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
        {
          $set: {
            cron: {
              site: { status: ESTORE_CRON_STATUS.FAILED, response: ' Invalid eStore payload', timestamp: new Date().valueOf() },
              term: { status: ESTORE_CRON_STATUS.FAILED, response: ' Invalid eStore payload', timestamp: new Date().valueOf() },
              buyer: { status: ESTORE_CRON_STATUS.FAILED, response: ' Invalid eStore payload', timestamp: new Date().valueOf() },
              deal: { status: ESTORE_CRON_STATUS.FAILED, response: ' Invalid eStore payload', timestamp: new Date().valueOf() },
              facility: { status: ESTORE_CRON_STATUS.FAILED, response: ' Invalid eStore payload', timestamp: new Date().valueOf() },
            },
          },
        },
      );

      return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, message: 'Invalid eStore payload' });
    }

    return res.status(HttpStatusCode.Created).send();
  } catch (error: any) {
    console.error('❌ Unable to create eStore directories %o', error);
  }
};
