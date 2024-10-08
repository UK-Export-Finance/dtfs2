import { HttpStatusCode } from 'axios';
import { InsertOneResult, ObjectId } from 'mongodb';
import { Response } from 'express';
import { EstoreRepo } from '../../../repositories/estore/estore-repo';
import { getCollection } from '../../../database';
import { Estore, SiteExistsResponse, EstoreErrorResponse } from '../../../interfaces';
import { EstoreRequest } from '../../../helpers/types/estore';
import { ESTORE_SITE_STATUS, ESTORE_CRON_STATUS, EMAIL_TEMPLATES } from '../../../constants';
import { areValidUkefIds, objectIsEmpty } from '../../../helpers';
import { eStoreTermStoreCreationJob, eStoreSiteCreationCronJob } from '../../../cron';
import { createExporterSite, siteExists } from './eStoreApi';
import { getNowAsEpoch } from '../../../helpers/date';
import { sendEmail } from '../email.controller';

const { UKEF_INTERNAL_NOTIFICATION } = process.env;

/**
 * The `create` function handles the creation of an eStore site. It validates the request body,
 * ensures the creation of a new CRON job, and performs various checks on the provided data.
 * If the request body is invalid, it returns a 400 Bad Request response. Otherwise, it processes
 * the eStore data and updates the CRON job log accordingly.
 *
 * @param {EstoreRequest} req - The request object containing the eStore data.
 * @param {Response} res - The response object to send the result.
 *
 * @returns {Promise<Response>} - A promise that resolves to the response object.
 *
 * @example
 * const req = {
 *   body: {
 *     dealId: '507f1f77bcf86cd799439011',
 *     siteId: 'site123',
 *     facilityIdentifiers: [1, 2, 3],
 *     supportingInformation: [{
 *        "documentType": "Exporter_questionnaire",
 *        "fileName": "test.docx",
 *        "fileLocationPath": "directory/",
 *        "parentId": "abc"
 *     }],
 *     exporterName: 'Exporter Inc.',
 *     buyerName: 'Buyer LLC',
 *     dealIdentifier: 'deal123',
 *     destinationMarket: 'Market A',
 *     riskMarket: 'Market B',
 *   },
 * };
 * const res = {
 *   status: (code) => ({ send: (data) => console.log(code, data) }),
 * };
 *
 * create(req, res)
 *   .then((response) => console.log('Response:', response))
 *   .catch((error) => console.error('Error:', error));
 */
export const create = async (req: EstoreRequest, res: Response): Promise<Response> => {
  try {
    const { body } = req;

    // Ensure `req.body` is valid
    if (objectIsEmpty(body)) {
      return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, message: 'Invalid request' });
    }

    // Ensure new CRON job creation
    const tfmDeals = await getCollection('tfm-deals');

    const { dealId, siteId, facilityIdentifiers, supportingInformation, exporterName, buyerName, dealIdentifier, destinationMarket, riskMarket } = body;

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
    const eStoreData: Estore = {
      dealId,
      dealIdentifier,
      facilityIdentifiers,
      siteId,
      exporterName,
      buyerName,
      destinationMarket,
      riskMarket,
      supportingInformation,
    };

    if (!Object.keys(eStoreData).length) {
      console.error('❌ Invalid eStore payload %o', eStoreData);

      // CRON job log update
      await EstoreRepo.updateByDealId(dealId, {
        cron: {
          site: {
            status: ESTORE_CRON_STATUS.FAILED,
            response: ' Invalid eStore payload',
            timestamp: getNowAsEpoch(),
          },
          term: {
            status: ESTORE_CRON_STATUS.FAILED,
            response: ' Invalid eStore payload',
            timestamp: getNowAsEpoch(),
          },
          buyer: {
            status: ESTORE_CRON_STATUS.FAILED,
            response: ' Invalid eStore payload',
            timestamp: getNowAsEpoch(),
          },
          deal: {
            status: ESTORE_CRON_STATUS.FAILED,
            response: ' Invalid eStore payload',
            timestamp: getNowAsEpoch(),
          },
          facility: {
            status: ESTORE_CRON_STATUS.FAILED,
            response: ' Invalid eStore payload',
            timestamp: getNowAsEpoch(),
          },
          document: {
            status: ESTORE_CRON_STATUS.FAILED,
            response: ' Invalid eStore payload',
            timestamp: getNowAsEpoch(),
          },
        },
      });

      return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, message: 'Invalid eStore payload' });
    }

    // 1. Void IDs check
    if (!areValidUkefIds(eStoreData)) {
      console.error('Invalid eStore IDs provided %s %o', dealIdentifier, facilityIdentifiers);
      return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, message: 'Invalid IDs' });
    }

    if (!ObjectId.isValid(dealId)) {
      console.error('Invalid eStore deal ObjectId');
      return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, message: 'Invalid deal ObjectId' });
    }

    // Returns the document from `cron-job-logs` collection if exists
    const cronJobExist = await EstoreRepo.findByDealId(dealId);

    if (cronJobExist) {
      // When CRON job already exists for provided deal id.
      console.info('eStore CRON job exists for deal %s', dealIdentifier);
      return res.status(HttpStatusCode.AlreadyReported).send({ status: HttpStatusCode.AlreadyReported, message: 'eStore job in queue' });
    }

    /**
     * Send `201` status code back to avoid
     * `TFM-API` awaiting.
     */
    console.info('Attempting to create a new CRON job for deal %s', dealIdentifier);

    // Add CRON job to the collection
    const inserted = await EstoreRepo.insertOne({
      payload: eStoreData,
      timestamp: getNowAsEpoch(),
      cron: {
        site: { status: ESTORE_CRON_STATUS.PENDING },
        term: { status: ESTORE_CRON_STATUS.PENDING },
        buyer: { status: ESTORE_CRON_STATUS.PENDING },
        deal: { status: ESTORE_CRON_STATUS.PENDING },
        facility: { status: ESTORE_CRON_STATUS.PENDING },
        document: { status: ESTORE_CRON_STATUS.PENDING },
      },
    });

    if (!inserted) {
      throw new Error('eStore CRON job log insertion failed');
    }

    const { insertedId: _id } = inserted as InsertOneResult;

    // Site exists check
    console.info('Initiating eStore site existence check for exporter %s', exporterName);
    const siteExistsResponse: SiteExistsResponse | EstoreErrorResponse = await siteExists(exporterName);

    const created = siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.CREATED;
    const provisioning = siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.PROVISIONING;
    const absent = siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.NOT_FOUND;

    // Site already exists in eStore
    if (created) {
      /**
       * Update record-set with the site name.
       * Update `cron-job-logs`
       */
      await EstoreRepo.updateByDealId(dealId, {
        'cron.site.create': {
          status: ESTORE_CRON_STATUS.COMPLETED,
          response: siteExistsResponse.data.status,
          timestamp: getNowAsEpoch(),
          id: siteExistsResponse.data.siteId,
        },
        'cron.site.status': ESTORE_CRON_STATUS.COMPLETED,
      });

      // Update `tfm-deals`
      await tfmDeals.updateOne({ _id: { $eq: new ObjectId(dealId) } }, { $set: { 'tfm.estore.siteName': siteExistsResponse.data.siteId } });

      // Update object
      eStoreData.siteId = String(siteExistsResponse.data.siteId);

      // Add facility IDs to term store and create the buyer folder
      await eStoreTermStoreCreationJob(eStoreData);
    } else if (absent || provisioning) {
      let siteCreationResponse: SiteExistsResponse | EstoreErrorResponse;
      // Site does not exists in eStore

      // Create a new eStore site
      if (provisioning) {
        // When site status is provisioning
        console.info('eStore site creation in progress for deal %s', dealIdentifier);
        siteCreationResponse = siteExistsResponse;
      } else {
        console.info('eStore site creation initiated for exporter %s with deal %s', exporterName, dealIdentifier);
        siteCreationResponse = await createExporterSite({ exporterName });
      }

      /**
       * Check if the siteCreation endpoint returns a siteId - this is usually a number (i.e. 12345)
       * Returning a site ID does not state site creation has been completed, merely acknowledges site creation
       * has been initiated.
       */
      if (siteCreationResponse?.data?.siteId) {
        await eStoreSiteCreationCronJob(eStoreData);
      } else {
        console.error('eStore site creation failed for deal %s %o', dealIdentifier, siteCreationResponse?.data);

        // CRON job log update
        await EstoreRepo.updateByDealId(dealId, {
          'cron.site.create': {
            response: siteCreationResponse?.data,
            status: ESTORE_CRON_STATUS.FAILED,
            timestamp: getNowAsEpoch(),
          },
          'cron.site.status': ESTORE_CRON_STATUS.FAILED,
        });
      }
    } else {
      console.error('❌ eStore site exist check failed for deal %s', dealIdentifier);
      throw new Error(JSON.stringify(siteExistsResponse));
    }

    return res.status(HttpStatusCode.Created).send({ status: HttpStatusCode.Created, message: 'eStore job accepted' });
  } catch (error: unknown) {
    console.error('❌ Unable to create eStore directories %o', error);

    // CRON job log update
    await EstoreRepo.updateByDealId(req?.body?.dealId, {
      'cron.site': {
        status: ESTORE_CRON_STATUS.FAILED,
        create: {
          status: ESTORE_CRON_STATUS.FAILED,
          response: String(error),
          timestamp: getNowAsEpoch(),
        },
      },
      'cron.term.status': ESTORE_CRON_STATUS.FAILED,
      'cron.buyer.status': ESTORE_CRON_STATUS.FAILED,
      'cron.deal.status': ESTORE_CRON_STATUS.FAILED,
      'cron.facility.status': ESTORE_CRON_STATUS.FAILED,
      'cron.document.status': ESTORE_CRON_STATUS.FAILED,
    });

    // Dispatch an alert
    await sendEmail(EMAIL_TEMPLATES.ESTORE_FAILED, String(UKEF_INTERNAL_NOTIFICATION), {
      dealIdentifier: req?.body?.dealIdentifier,
    });

    // Return `500` status code
    return res.status(HttpStatusCode.InternalServerError).send({ status: HttpStatusCode.InternalServerError, message: 'Unable to create eStore directories' });
  }
};
