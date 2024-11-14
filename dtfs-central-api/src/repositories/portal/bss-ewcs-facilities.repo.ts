import { Collection, ObjectId, WithoutId, UpdateFilter, Filter } from 'mongodb';
import { InvalidDealIdError, MONGO_DB_COLLECTIONS, Facility, AuditDetails, FACILITY_TYPE } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';

export class PortalBssEwcsFacilityRepo {
  private static async getFacilityCollection(): Promise<Collection<WithoutId<Facility>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);
  }

  /**
   * Update a BSS/EWCS facility status
   * @param dealId - the deal that the facilities belong to
   * @param status - the status change to make
   * @param auditDetails - the users audit details
   */
  public static async updateStatusByDealId(dealId: string | ObjectId, status: string, auditDetails: AuditDetails): Promise<void> {
    if (!ObjectId.isValid(dealId)) {
      throw new InvalidDealIdError(dealId.toString());
    }

    const collection = await this.getFacilityCollection();

    const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    const filter: Filter<WithoutId<Facility>> = { dealId: { $eq: new ObjectId(dealId) }, type: { $in: [FACILITY_TYPE.BOND, FACILITY_TYPE.LOAN] } };
    const update: UpdateFilter<WithoutId<Facility>> = { $set: { updatedAt: Date.now(), previousStatus: '$status', status, auditRecord } };

    await collection.updateMany(filter, update);
  }
}
