import * as dotenv from 'dotenv';

dotenv.config();

/**
 * checks if notify key is mocked
 * if notifyKey is mocked, it will have the same value as MOCK_E2E_GOV_NOTIFY_API_KEY
 * @returns true if notifyKey is the same as MOCK_E2E_GOV_NOTIFY_API_KEY
 */
export const isGovNotifyMocked = (): boolean => {
  const notifyKey: string = process.env.GOV_NOTIFY_API_KEY ?? '';
  const mockNotifyKey: string = process.env.MOCK_E2E_GOV_NOTIFY_API_KEY ?? '';

  return notifyKey === mockNotifyKey;
};
