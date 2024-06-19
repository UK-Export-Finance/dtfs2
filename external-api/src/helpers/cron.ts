import dotenv from 'dotenv';
import { CronJob } from 'cron';
import { Estore } from '../interfaces';
import { Category } from './types/estore';
import { eStoreSiteCreationCron } from '../cron/eStoreSiteCreationJob.cron';

dotenv.config();

const { ESTORE_CRON_MANAGER_SCHEDULE, TZ } = process.env;
const jobs = new Map();

/**
 * Executes a cron job based on the provided eStore data and category.
 * @param eStoreData - The eStore data.
 * @returns A promise that resolves when the cron job is completed.
 */
const onTick = async (eStoreData: Estore) => {
  await eStoreSiteCreationCron(eStoreData);
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
 * Creates and starts a CRON job for eStore data.
 * @param eStoreData - The eStore data.
 * @param category - The category of the eStore data.
 * @returns A promise that resolves when the CRON job is started.
 */
export const cron = (eStoreData: Estore, category: Category, kill: boolean = false): Promise<boolean> => {
  const id = `estore_cron_${category}_${eStoreData.dealId.toString()}`;

  // Stop the CRON job
  if (kill) {
    const job = jobs.get(id) as CronJob;

    console.info('❌ eStore %s CRON %s has been stopped for deal %s.', category, id, eStoreData.dealIdentifier);

    jobs.delete(id);
    job.stop();

    return Promise.resolve(true);
  }

  // Check job existence
  if (jobs.has(id)) {
    console.info('⚠️ eStore %s CRON %s already exists for deal %s.', category, id, eStoreData.dealIdentifier);

    return Promise.resolve(false);
  }

  const cronJob = new CronJob(
    String(ESTORE_CRON_MANAGER_SCHEDULE), // Cron schedule
    () => onTick(eStoreData), // On Tick
    () => onComplete(eStoreData, category), // On complete
    false, // Start the job
    TZ, // Timezone
  );

  // Only start if job is not already running
  if (!cronJob.running) {
    jobs.set(id, cronJob);
    cronJob.start();
  }

  console.info('⚡ eStore %s CRON has been initiated for deal %s.', category, eStoreData.dealIdentifier);
  return Promise.resolve(true);
};
