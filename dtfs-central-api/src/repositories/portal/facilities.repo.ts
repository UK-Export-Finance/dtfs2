import { Collection, ObjectId, WithoutId, Filter } from 'mongodb';
import * as $ from 'mongo-dot-notation';
import { InvalidDealIdError, MONGO_DB_COLLECTIONS, Facility, AuditDetails } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';

export class PortalFacilityRepo {
  private static async getFacilityCollection(): Promise<Collection<WithoutId<Facility>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);
  }

  /**
   * Update a facility by dealId
   * @param dealId - the deal that the facilities belong to
   * @param update - the updates to make
   * @param auditDetails - the users audit details
   */
  public static async updateManyByDealId(dealId: string | ObjectId, update: Partial<Facility>, auditDetails: AuditDetails): Promise<void> {
    if (!ObjectId.isValid(dealId)) {
      throw new InvalidDealIdError(dealId.toString());
    }

    const collection = await this.getFacilityCollection();

    const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    const filter: Filter<WithoutId<Facility>> = { dealId: { $eq: new ObjectId(dealId) } };

    await collection.updateMany(filter, $.flatten({ ...update, auditRecord }));
  }
}
