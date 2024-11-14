import { Collection, ObjectId, WithoutId, Filter } from 'mongodb';
import { InvalidDealIdError, MONGO_DB_COLLECTIONS, Facility, AuditDetails, FACILITY_TYPE } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';

export class PortalGefFacilityRepo {
  private static async getFacilityCollection(): Promise<Collection<WithoutId<Facility>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);
  }

  /**
   * Update a GEF facility status
   * @param dealId - the deal that the facilities belong to
   * @param update - the updates to make
   * @param auditDetails - the users audit details
   */
  public static async updateByDealId(dealId: string | ObjectId, update: Partial<Facility>, auditDetails: AuditDetails): Promise<void> {
    if (!ObjectId.isValid(dealId)) {
      throw new InvalidDealIdError(dealId.toString());
    }

    const collection = await this.getFacilityCollection();

    const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    const filter: Filter<WithoutId<Facility>> = { dealId: { $eq: new ObjectId(dealId) }, type: { $in: [FACILITY_TYPE.CASH, FACILITY_TYPE.CONTINGENT] } };

    await collection.updateMany(filter, { ...update, auditRecord });
  }
}
