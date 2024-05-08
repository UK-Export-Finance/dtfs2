/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable import/no-extraneous-dependencies */

import dotenv from 'dotenv';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { CronJob } from 'cron';
import { getCollection } from '../../../database';
import { Estore, SiteExistsResponse, EstoreErrorResponse } from '../../../interfaces';
import { ESTORE_SITE_STATUS, ESTORE_CRON_STATUS } from '../../../constants';
import { areValidUkefIds, objectIsEmpty } from '../../../helpers';
import { eStoreTermStoreAndBuyerFolder, eStoreSiteCreationCron } from '../../../cron';
import { createExporterSite, siteExists } from './eStoreApi';
import { getNowAsEpoch } from '../../../helpers/date';

dotenv.config();

const { ESTORE_CRON_MANAGER_SCHEDULE, TZ } = process.env;

export const create = async (req: Request, res: Response) => {
  try {
    // Ensure `req.body` is valid
    if (objectIsEmpty(req.body)) {
      return res
        .status(HttpStatusCode.BadRequest)
        .send({ status: HttpStatusCode.BadRequest, message: 'Invalid request' });
    }

    // Ensure new CRON job creation
    const cronJobLogs = await getCollection('cron-job-logs');
    const tfmDeals = await getCollection('tfm-deals');

    const {
      dealId,
      siteId,
      facilityIdentifiers,
      supportingInformation,
      exporterName,
      buyerName,
      dealIdentifier,
      destinationMarket,
      riskMarket,
    } = req.body;

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
     * eStore payload validations:
     * 1. Check if the provided IDs are valid
     * 2. Check if the dealId is a valid ObjectId
     * 3. Check if the CRON job already exists for the provided dealId
     * 4. Check if the payload is empty
     * 5. Check if the siteId is a valid ObjectId
     * 6. Check if the facilityIdentifiers are valid
     * 7. Check if the supportingInformation is a string
     * 8. Check if the exporterName is a string
     * 9. Check if the buyerName is a string
     * 10. Check if the dealIdentifier is a string
     * 11. Check if the destinationMarket is a string
     * 12. Check if the riskMarket is a string
     * 13. Check if the dealId is a valid ObjectId
     */
    if (!Object.keys(eStoreData).length) {
      console.error('❌ Invalid eStore payload %o', eStoreData);

      // CRON job log update
      await cronJobLogs.updateOne(
        { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
        {
          $set: {
            cron: {
              site: {
                status: ESTORE_CRON_STATUS.FAILED,
                response: ' Invalid eStore payload',
                timestamp: getNowAsEpoch,
              },
              term: {
                status: ESTORE_CRON_STATUS.FAILED,
                response: ' Invalid eStore payload',
                timestamp: getNowAsEpoch,
              },
              buyer: {
                status: ESTORE_CRON_STATUS.FAILED,
                response: ' Invalid eStore payload',
                timestamp: getNowAsEpoch,
              },
              deal: {
                status: ESTORE_CRON_STATUS.FAILED,
                response: ' Invalid eStore payload',
                timestamp: getNowAsEpoch,
              },
              facility: {
                status: ESTORE_CRON_STATUS.FAILED,
                response: ' Invalid eStore payload',
                timestamp: getNowAsEpoch,
              },
            },
          },
        },
      );

      return res
        .status(HttpStatusCode.BadRequest)
        .send({ status: HttpStatusCode.BadRequest, message: 'Invalid eStore payload' });
    }

    // 1. Void IDs check
    if (!areValidUkefIds(eStoreData)) {
      console.error('Invalid eStore IDs provided %s %o', dealIdentifier, facilityIdentifiers);
      return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, message: 'Invalid IDs' });
    }

    if (!ObjectId.isValid(eStoreData.dealId)) {
      console.error('Invalid eStore deal ObjectId');
      return res
        .status(HttpStatusCode.BadRequest)
        .send({ status: HttpStatusCode.BadRequest, message: 'Invalid deal ObjectId' });
    }

    // Returns the document from `cron-job-logs` collection if exists
    const cronJobEntry = await cronJobLogs.findOne({ 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } });

    if (!cronJobEntry) {
      /**
       * Send `201` status code back to avoid
       * `TFM-API` awaiting.
       */
      console.info('Creating new CRON job for deal %s', eStoreData.dealIdentifier);
      res.status(HttpStatusCode.Created).send({ status: HttpStatusCode.Created, message: 'eStore job accepted' });

      // Step 1: Add CRON job to the collection
      const { insertedId: _id } = await cronJobLogs.insertOne({
        payload: eStoreData,
        timestamp: getNowAsEpoch(),
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
          { _id: { $eq: new ObjectId(_id) } },
          {
            $set: {
              'response.site.siteId': siteExistsResponse.data.siteId,
              'cron.site.create': {
                status: ESTORE_CRON_STATUS.COMPLETED,
                timestamp: getNowAsEpoch(),
              },
              'cron.site.status': ESTORE_CRON_STATUS.COMPLETED,
            },
          },
        );

        // Update `tfm-deals`
        await tfmDeals.updateOne(
          { _id: { $eq: new ObjectId(eStoreData.dealId) } },
          { $set: { 'tfm.estore.siteName': siteExistsResponse.data.siteId } },
        );

        // Update object
        eStoreData.siteId = String(siteExistsResponse.data.siteId);

        // Add facility IDs to term store and create the buyer folder
        eStoreTermStoreAndBuyerFolder(eStoreData);
      } else if (absent || provisioning) {
        let siteCreationResponse: SiteExistsResponse | EstoreErrorResponse;
        // Step 3: Site does not exists in eStore

        // Create a new eStore site
        if (provisioning) {
          // When site status is provisioning
          console.info('eStore site creation in progress for deal %s', eStoreData.dealIdentifier);
          siteCreationResponse = siteExistsResponse;
        } else {
          console.info(
            'eStore site creation initiated for exporter %s with deal %s',
            eStoreData.exporterName,
            eStoreData.dealIdentifier,
          );
          siteCreationResponse = await createExporterSite({ exporterName: eStoreData.exporterName });
        }

        // Check if the siteCreation endpoint returns a siteId - this is usually a number (i.e. 12345)
        if (siteCreationResponse?.data?.siteId) {
          /**
           * Add a new site specific CRON job, which is initialised upon creation
           */
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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

          console.info('eStore site %s CRON job %s initiated.', siteCreationResponse.data.siteId, siteCreateCronId);
        } else {
          console.error(
            'eStore site creation failed for deal %s %o',
            eStoreData.dealIdentifier,
            siteCreationResponse?.data,
          );

          // CRON job log update
          await cronJobLogs.updateOne(
            { _id: { $eq: new ObjectId(_id) } },
            {
              $set: {
                'cron.site.create': {
                  response: siteCreationResponse?.data,
                  status: ESTORE_CRON_STATUS.FAILED,
                  timestamp: getNowAsEpoch(),
                },
                'cron.site.status': ESTORE_CRON_STATUS.FAILED,
              },
            },
          );
        }
      } else {
        console.error(
          '❌ eStore site exist check failed for deal %s %o',
          eStoreData.dealIdentifier,
          siteExistsResponse,
        );

        // CRON job log update
        await cronJobLogs.updateOne(
          { _id: { $eq: new ObjectId(_id) } },
          {
            $set: {
              'cron.site.create': {
                status: ESTORE_CRON_STATUS.FAILED,
                timestamp: getNowAsEpoch(),
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

    return res.status(HttpStatusCode.Created).send();
  } catch (error: unknown) {
    console.error('❌ Unable to create eStore directories %o', error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send({ status: HttpStatusCode.InternalServerError, message: 'Unable to create eStore directories' });
  }
};
