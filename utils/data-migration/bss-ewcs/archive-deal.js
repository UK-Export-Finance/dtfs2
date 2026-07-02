const fileshare = require('./helpers/fileshare');
require('dotenv').config();

const AZURE_WORKFLOW_FILESHARE_CONFIG = {
  FILESHARE_NAME: process.env.MIGRATION_AZURE_WORKFLOW_FILESHARE_NAME,
  MIGRATION_FOLDER: process.env.MIGRATION_AZURE_WORKFLOW_MIGRATION_FOLDER,
  STORAGE_ACCOUNT: process.env.MIGRATION_AZURE_WORKFLOW_STORAGE_ACCOUNT,
  STORAGE_ACCESS_KEY: process.env.MIGRATION_AZURE_WORKFLOW_STORAGE_ACCESS_KEY,
};

const archiveDeal = async (dealId) => {
  const filename = `deal_${dealId}.xml`;
  const folder = `${AZURE_WORKFLOW_FILESHARE_CONFIG.MIGRATION_FOLDER}/${dealId}`;

  const from = {
    fileshare: 'workflow',
    folder,
    filename,
  };

  const to = {
    fileshare: 'workflow',
    folder: `${AZURE_WORKFLOW_FILESHARE_CONFIG.MIGRATION_FOLDER}_archived_success/${dealId}`,
    filename,
  };

  try {
    await fileshare.moveFile({ to, from });
    await fileshare.deleteDirectory('workflow', folder);
    console.info(`Successfully archived deal ${dealId}`);
  } catch (error) {
    console.error(`Failed to archive deal ${dealId}:`, error);
    process.exit(1);
  }
};

const doArchive = async () => {
  const dealId = process.argv[2];

  if (!dealId) {
    console.error('Error: Please provide a dealId to archive');
    console.info('Usage: node bss-ewcs/archive-deal.js <dealId>');
    process.exit(1);
  }

  fileshare.setConfig(AZURE_WORKFLOW_FILESHARE_CONFIG);
  console.info(`Archiving deal ${dealId}...`);
  await archiveDeal(dealId);
};

doArchive();
