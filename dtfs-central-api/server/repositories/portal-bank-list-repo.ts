import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { WithId } from 'mongodb';
import type { PortalBankListEntry } from '@ukef/dtfs2-common';
import { mongoDbClient as db } from '../drivers/db-client';

/**
 * Returns all entries in the `portal-bank-list` collection in their natural
 * insertion order. The list is curated manually in MongoDB Compass so the
 * stored order is the order the portal should render the banks in.
 */
export const getAllPortalBankListEntries = async (): Promise<WithId<PortalBankListEntry>[]> => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.PORTAL_BANK_LIST);
  const docs = await collection.find({}, { projection: { name: 1, order: 1 } }).toArray();
  return docs;
};
