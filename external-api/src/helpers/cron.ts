import dotenv from 'dotenv';
import { CronJob } from 'cron';
import { Estore, EstoreCronJob } from '../interfaces';
import { ENDPOINT } from '../constants';
import { Category } from './types/estore';
import {
  eStoreSiteCreationCronJob,
  eStoreTermStoreCreationJob,
  eStoreBuyerDirectoryCreationJob,
  eStoreDealDirectoryCreationJob,
  eStoreFacilityDirectoryCreationJob,
} from '../cron';

dotenv.config();

const { ESTORE_CRON_MANAGER_SCHEDULE, TZ } = process.env;
const jobs = new Map();

/**
 * Executes a cron job based on the provided eStore data and category.
 * @param eStoreData - The eStore data.
 * @returns A promise that resolves when the cron job is completed.
 */
const onTick = async (eStoreData: Estore, category: Category) => {
  switch (category) {
    case ENDPOINT.SITE:
      return eStoreSiteCreationCronJob(eStoreData);
    case ENDPOINT.TERM:
      return eStoreTermStoreCreationJob(eStoreData);
    case ENDPOINT.BUYER:
      return eStoreBuyerDirectoryCreationJob(eStoreData);
    case ENDPOINT.DEAL:
      return eStoreDealDirectoryCreationJob(eStoreData);
    case ENDPOINT.FACILITY:
      return eStoreFacilityDirectoryCreationJob(eStoreData);
    default:
      return undefined;
  }
};

/**
 * Handles the completion of the eStore CRON for a specific deal category.
 * @param eStoreData - The eStore data object.
 * @param category - The category of the deal.
 * @returns A promise that resolves when the completion is handled.
 */
const onComplete = (eStoreData: Estore, category: Category) => {
  console.info('✅ eStore %s CRON has been completed successfully for deal %s', category, eStoreData.dealId);
};

/**
 * Manages the execution of eStore cron jobs.
 *
 * This function performs the following tasks:
 * 1. Stops an existing cron job if the `kill` flag is set.
 * 2. Checks if a cron job already exists for the given deal and category.
 * 3. Creates and starts a new cron job if it does not already exist.
 *
 * @param {EstoreCronJob} eStoreCronJob - The eStore cron job data containing information about the deal, category, and control flags.
 *
 * @returns {boolean} - Returns `true` if the cron job was stopped or created successfully, `false` if the cron job already exists.
 *
 * @example
 * const eStoreCronJob = {
 *   data: {
 *     dealId: '507f1f77bcf86cd799439011',
 *     dealIdentifier: '12345',
 *     exporterName: 'Exporter Inc.',
 *     buyerName: 'Buyer Inc.',
 *     siteId: '507f1f77bcf86cd799439012',
 *     facilityIdentifiers: ['FAC123', 'FAC456']
 *   },
 *   category: 'site',
 *   kill: false
 * };
 *
 * const result = cron(eStoreCronJob);
 * console.log(result); // true or false
 */
export const cron = (eStoreCronJob: EstoreCronJob): boolean => {
  const { data, category, kill } = eStoreCronJob;

  const id = `estore_cron_${category}_${data.dealId.toString()}`;

  // Stop the CRON job
  if (kill) {
    const job = jobs.get(id) as CronJob;

    console.info('❌ eStore %s CRON %s has been stopped for deal %s.', category, id, data.dealIdentifier);

    jobs.delete(id);
    job.stop();

    return true;
  }

  // Check job existence
  if (jobs.has(id)) {
    console.info('⚠️ eStore %s CRON %s already exists for deal %s.', category, id, data.dealIdentifier);

    return false;
  }

  const cronJob = new CronJob(
    String(ESTORE_CRON_MANAGER_SCHEDULE), // Cron schedule
    () => onTick(data, category),
    () => onComplete(data, category),
    false, // Start the job
    TZ, // Timezone
  );

  // Only start if job is not already running
  if (!cronJob.running) {
    jobs.set(id, cronJob);
    cronJob.start();
  }

  console.info('⚡ eStore %s CRON has been initiated for deal %s.', category, data.dealIdentifier);
  return false;
};
