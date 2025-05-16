import { ObjectId, UpdateFilter, WithoutId, FindOneAndUpdateOptions, Collection, Document, UpdateResult, Filter } from 'mongodb';
import { flatten } from 'mongo-dot-notation';
import {
  AuditDetails,
  TfmFacility,
  FacilityAmendment,
  TfmAmendmentStatus,
  FacilityNotFoundError,
  AmendmentNotFoundError,
  AMENDMENT_TYPES,
  PortalFacilityAmendment,
  GEF_FACILITY_TYPE,
  TfmFacilityAmendment,
  FacilityAmendmentWithUkefId,
  PORTAL_AMENDMENT_STATUS,
  PortalAmendmentStatus,
  PortalAuditDetails,
} from '@ukef/dtfs2-common';
import { deleteMany, generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';
import { aggregatePipelines, AllFacilitiesAndFacilityCountAggregatePipelineOptions } from './aggregate-pipelines';

export class TfmFacilitiesRepo {
  private static async getCollection(): Promise<Collection<WithoutId<TfmFacility>>> {
    return await mongoDbClient.getCollection('tfm-facilities');
  }

  /**
   * Finds the tfm facilities by deal id
   * @param dealId - The deal id
   * @returns The found tfm facilities
   */
  public static async findByDealId(dealId: string | ObjectId): Promise<TfmFacility[]> {
    const collection = await this.getCollection();
    return await collection.find({ 'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) } }).toArray();
  }

  /**
   * Finds the portal amendments for all the facilities provided with the given status or an array of statuses.
   * @param statuses - An array of portal amendment statuses to filter on
   * @returns The matching portal amendments
   */
  public static async findAllPortalAmendmentsByStatus({ statuses }: { statuses?: PortalAmendmentStatus[] }): Promise<PortalFacilityAmendment[]> {
    try {
      const collection = await this.getCollection();

      const facilitiesWithPortalAmendments = await collection
        .find(
          {
            'amendments.type': {
              $eq: AMENDMENT_TYPES.PORTAL,
            },
          },
          { projection: { amendments: 1 } },
        )
        .toArray();

      const portalAmendment = (amendment: FacilityAmendment) => amendment?.type === AMENDMENT_TYPES.PORTAL;
      // We want to fetch all the portal amendments even if they do not have the respective statuses
      const portalAmendmentsWithorWithoutStatuses = (amendment: FacilityAmendment) => !statuses || statuses.includes(amendment.status as PortalAmendmentStatus);

      const facilityAmendments = facilitiesWithPortalAmendments
        .flatMap((facility) => facility.amendments || [])
        .filter((amendment) => portalAmendment(amendment) && portalAmendmentsWithorWithoutStatuses(amendment)) as PortalFacilityAmendment[];

      return facilityAmendments;
    } catch (error) {
      console.error('Error finding all portal amendments by status %o', error);
      throw error;
    }
  }

  /**
   * Finds all type amendments across all facilities for a deal for a given status or set of statuses
   * @param dealId - The deal id
   * @param statuses - An array of amendment statuses to filter on
   * @returns The matching amendments
   */
  public static async findAllTypeAmendmentsByDealIdAndStatus({
    dealId,
    statuses,
  }: {
    dealId: string | ObjectId;
    statuses?: (PortalAmendmentStatus | TfmAmendmentStatus)[];
  }): Promise<(PortalFacilityAmendment | TfmFacilityAmendment)[]> {
    const collection = await this.getCollection();

    const facilitiesOnDealWithAmendments = await collection
      .find(
        {
          'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) },
          amendments: {
            $elemMatch: {
              amendmentId: { $exists: true, $ne: null },
              referenceNumber: { $exists: true, $ne: null },
            },
          },
        },
        { projection: { amendments: 1, 'facilitySnapshot.name': 1, 'facilitySnapshot.ukefFacilityId': 1, 'facilitySnapshot.currency': 1 } },
      )
      .sort({ 'amendments.referenceNumber': -1 })
      .toArray();

    const matchingAmendments = facilitiesOnDealWithAmendments
      .flatMap((facility) =>
        (facility.amendments || []).map((amendment) => ({
          ...amendment,
          facilityType: facility.facilitySnapshot?.name,
          ukefFacilityId: facility.facilitySnapshot?.ukefFacilityId,
          currency: facility.facilitySnapshot?.currency.id,
        })),
      )
      .filter((amendment) => amendment.amendmentId && amendment.referenceNumber && (!statuses || statuses.includes(amendment.status)));

    return matchingAmendments;
  }

  /**
   * Finds all type amendments by facilityId for a given status or set of statuses
   * @param facilityId - The facility id
   * @param statuses - An array of amendment statuses to filter on
   * @returns The matching amendments
   */
  public static async findAllTypeAmendmentsByFacilityIdAndStatus({
    facilityId,
    statuses,
  }: {
    facilityId: string | ObjectId;
    statuses?: (PortalAmendmentStatus | TfmAmendmentStatus)[];
  }): Promise<(PortalFacilityAmendment | TfmFacilityAmendment)[]> {
    const collection = await this.getCollection();

    const amendmentsOnFacility = await collection
      .find(
        {
          'amendments.facilityId': { $eq: new ObjectId(facilityId) },
          amendments: {
            $elemMatch: {
              amendmentId: { $exists: true, $ne: null },
              referenceNumber: { $exists: true, $ne: null },
            },
          },
        },
        { projection: { amendments: 1 } },
      )
      .toArray();

    const matchingAmendments = amendmentsOnFacility
      .flatMap((facility) => facility.amendments || [])
      .filter((amendment) => amendment.amendmentId && amendment.referenceNumber && (!statuses || statuses.includes(amendment.status)));

    return matchingAmendments;
  }

  /**
   * Finds the portal amendments across all facilities for a deal for a given status or set of statuses
   * @param dealId - The deal id
   * @param statuses - An array of portal amendment statuses to filter on
   * @returns The matching portal amendments
   */
  public static async findPortalAmendmentsByDealIdAndStatus({
    dealId,
    statuses,
  }: {
    dealId: string | ObjectId;
    statuses?: PortalAmendmentStatus[];
  }): Promise<PortalFacilityAmendment[]> {
    const collection = await this.getCollection();

    const facilitiesOnDealWithPortalAmendments = await collection
      .find(
        {
          'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) },
          'amendments.type': {
            $eq: AMENDMENT_TYPES.PORTAL,
          },
        },
        { projection: { amendments: 1 } },
      )
      .toArray();

    const matchingPortalAmendments = facilitiesOnDealWithPortalAmendments
      .flatMap((facility) => facility.amendments || [])
      .filter((amendment) => amendment?.type === AMENDMENT_TYPES.PORTAL && (!statuses || statuses.includes(amendment.status))) as PortalFacilityAmendment[];

    return matchingPortalAmendments;
  }

  /**
   * Finds the tfm facility with the supplied id
   * @param id - The id of the facility
   * @returns The found tfm facility
   */
  public static async findOneById(id: string | ObjectId): Promise<TfmFacility | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ _id: { $eq: new ObjectId(id) } });
  }

  /**
   * Updates the tfm facility with the supplied id
   * @param id - The id to search by
   * @param update - The update to apply
   * @param [options] - Update options
   * @returns The document (returned after the update by default)
   */
  public static async findOneByIdAndUpdate(
    id: string | ObjectId,
    update: UpdateFilter<WithoutId<TfmFacility>>,
    options: FindOneAndUpdateOptions = { returnDocument: 'after' },
  ): Promise<TfmFacility | null> {
    const collection = await this.getCollection();
    const { value } = await collection.findOneAndUpdate({ _id: { $eq: new ObjectId(id) } }, update, options);
    return value;
  }

  /**
   * Updates the tfm facility with the supplied id
   * and amendment id
   * @param id - The facility id
   * @param amendmentId - The amendment id
   * @param update - The update to apply
   * @returns The update result
   */
  public static async updateOneByIdAndAmendmentId(
    id: string | ObjectId,
    amendmentId: string | ObjectId,
    update: UpdateFilter<WithoutId<TfmFacility>>,
  ): Promise<UpdateResult> {
    const collection = await this.getCollection();
    return await collection.updateOne(
      {
        _id: { $eq: new ObjectId(id) },
        'amendments.amendmentId': { $eq: new ObjectId(amendmentId) },
      },
      update,
    );
  }

  /**
   * Updates the tfm facility with the supplied id
   * @param id - The facility id
   * @param update - The update to apply
   * @returns The update result
   */
  public static async updateOneById(id: string | ObjectId, update: UpdateFilter<WithoutId<TfmFacility>>): Promise<UpdateResult> {
    const collection = await this.getCollection();
    return await collection.updateOne(
      {
        _id: { $eq: new ObjectId(id) },
      },
      update,
    );
  }

  /**
   * Finds the TFM facilities with the supplied ids
   * @param ids - The facility ids
   * @returns The found TFM facilities
   */
  public static async findByIds(ids: (string | ObjectId)[]): Promise<TfmFacility[]> {
    const collection = await this.getCollection();
    return await collection.find({ _id: { $in: ids.map((id) => new ObjectId(id)) } }).toArray();
  }

  /**
   * Delete many TFM facilities by the supplied deal id
   * @param dealId - The deal id
   * @param auditDetails - The audit details
   * @returns The delete result
   */
  public static async deleteManyByDealId(dealId: string | ObjectId, auditDetails: AuditDetails): Promise<{ acknowledged: boolean }> {
    const filter: Filter<TfmFacility> = {
      'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) },
    };
    return await deleteMany({
      filter,
      collectionName: 'tfm-facilities',
      db: mongoDbClient,
      auditDetails,
    });
  }

  /**
   * Find TFM amendments by the amendment status
   * @param status - The tfm amendment status
   * @returns The found amendments
   */
  public static async findTfmAmendmentsByStatus(status: TfmAmendmentStatus): Promise<Document[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.tfmAmendmentsByStatus(status))
      .map<Document>((doc) => doc.amendments as Document)
      .toArray();
  }

  /**
   * Finds amendments by the facility id
   * @param facilityId - The facility id
   * @returns The found amendments
   */
  public static async findAmendmentsByFacilityId(facilityId: string | ObjectId): Promise<Document[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.amendmentsByFacilityId(facilityId))
      .map<Document>((doc) => doc.amendments as Document)
      .toArray();
  }

  /**
   * Finds tfm amendments by the facility id and status
   * @param facilityId - The facility id
   * @param status - The TFM amendment status
   * @returns The found amendments
   */
  public static async findTfmAmendmentsByFacilityIdAndStatus(facilityId: string | ObjectId, status: TfmAmendmentStatus): Promise<FacilityAmendment[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.tfmAmendmentsByFacilityIdAndStatus(facilityId, status))
      .map<FacilityAmendment>((doc) => doc.amendments as FacilityAmendment)
      .toArray();
  }

  /**
   * Finds amendment by facility id and amendment id
   * @param facilityId - The facility id
   * @param amendmentId - The amendment id
   * @returns The found amendment
   */
  public static async findOneAmendmentByFacilityIdAndAmendmentId(
    facilityId: string | ObjectId,
    amendmentId: string | ObjectId,
  ): Promise<FacilityAmendmentWithUkefId | undefined> {
    const collection = await this.getCollection();
    const facility = await collection.findOne({ _id: { $eq: new ObjectId(facilityId) } });

    if (!facility) {
      throw new FacilityNotFoundError(facilityId.toString());
    }

    const amendment = facility.amendments?.find((value) => {
      return new ObjectId(amendmentId).equals(value.amendmentId);
    });

    const { ukefFacilityId } = facility.facilitySnapshot;

    if (!amendment) {
      return undefined;
    }

    return {
      ...amendment,
      ukefFacilityId,
    };
  }

  /**
   * Finds amendments by the deal id
   * @param dealId - The deal id
   * @returns The found amendments
   */
  public static async findAmendmentsByDealId(dealId: string | ObjectId): Promise<Document[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.amendmentsByDealId(dealId))
      .map<Document>((doc) => doc.amendments as Document)
      .toArray();
  }

  /**
   * Finds tfm amendments by the deal id and status
   * @param dealId - The deal id
   * @param status - The tfm amendment status
   * @returns The found amendments
   */
  public static async findTfmAmendmentsByDealIdAndStatus(dealId: string | ObjectId, status: TfmAmendmentStatus): Promise<Document[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.tfmAmendmentsByDealIdAndStatus(dealId, status))
      .map<Document>((doc) => doc.amendments as Document)
      .toArray();
  }

  /**
   * Finds the latest completed amendment by facility id
   * @param facilityId - The facility id
   * @returns The latest completed amendment
   */
  public static async findLatestCompletedAmendmentByFacilityId(facilityId: string | ObjectId): Promise<TfmFacilityAmendment | null> {
    const collection = await this.getCollection();
    const amendments = await collection
      .aggregate(aggregatePipelines.latestCompletedTfmAmendmentByFacilityId(facilityId))
      .map<TfmFacilityAmendment>((doc) => doc.amendments as TfmFacilityAmendment)
      .toArray();
    return amendments.at(0) ?? null;
  }

  /**
   * Finds the latest completed amendment by deal id
   * @param dealId - The deal id
   * @returns The latest completed amendment
   */
  public static async findLatestCompletedAmendmentByDealId(dealId: string | ObjectId): Promise<FacilityAmendment | null> {
    const collection = await this.getCollection();
    const amendments = await collection
      .aggregate(aggregatePipelines.latestCompletedAmendmentByDealId(dealId))
      .map<FacilityAmendment>((doc) => doc.amendments as FacilityAmendment)
      .toArray();
    return amendments.at(0) ?? null;
  }

  /**
   * Finds all facilities after applying the aggregate options
   * with the total count
   * @param aggregateOptions - The aggregate options
   * @returns The found facilities and count
   */
  public static async findAllFacilitiesAndFacilityCount(
    aggregateOptions: AllFacilitiesAndFacilityCountAggregatePipelineOptions,
  ): Promise<{ count: number; facilities: Document[] } | null> {
    try {
      const collection = await this.getCollection();
      const facilities = aggregatePipelines.allFacilitiesAndFacilityCount(aggregateOptions);
      const result = await collection.aggregate(facilities).toArray();
      return (result.at(0) as { count: number; facilities: Document[] }) ?? null;
    } catch (error) {
      console.error('Error finding all facilities and facility count %o', error);
      return null;
    }
  }

  /**
   * Finds the TFM facilities with the supplied ukef facility ids
   * @param ukefFacilityIds - The ukef facility ids
   * @returns The found TFM facilities
   */
  public static async findByUkefFacilityIds(ukefFacilityIds: string[]): Promise<TfmFacility[]> {
    const collection = await this.getCollection();
    return await collection.find({ 'facilitySnapshot.ukefFacilityId': { $in: ukefFacilityIds } }).toArray();
  }

  /**
   * Checks whether or not a GEF facility exists which has a matching UKEF facility ID
   * @param ukefFacilityId - The UKEF facility ID
   * @returns Whether a not a GEF facility with that UKEF facility ID exists
   */
  public static async ukefGefFacilityExists(ukefFacilityId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const numberOfFoundDocuments = await collection.count({
      'facilitySnapshot.ukefFacilityId': { $eq: ukefFacilityId },
      'facilitySnapshot.type': { $in: Object.values(GEF_FACILITY_TYPE) },
    });
    return numberOfFoundDocuments > 0;
  }

  /**
   * Upserts a portal draft amendment for a facility in the database.
   *
   * This function first removes any existing portal amendments for the specified facility
   * that are not completed, and then inserts the new amendment.
   *
   * @param amendment - The draft amendment to be upserted.
   * @param auditDetails - The audit details for the operation.
   *
   * @returns The update result.
   */
  public static async upsertPortalFacilityAmendmentDraft(amendment: PortalFacilityAmendment, auditDetails: AuditDetails): Promise<UpdateResult> {
    const collection = await this.getCollection();

    const findFilter: Filter<TfmFacility> = {
      _id: { $eq: new ObjectId(amendment.facilityId) },
      'facilitySnapshot.dealId': { $eq: new ObjectId(amendment.dealId) },
    };

    const removeDraftAmendmentsFilter: UpdateFilter<TfmFacility> = {
      $pull: {
        amendments: { type: AMENDMENT_TYPES.PORTAL, status: { $eq: PORTAL_AMENDMENT_STATUS.DRAFT } },
      },
      $set: { auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) },
    };

    const pushDraftAmendmentFilter: UpdateFilter<TfmFacility> = {
      $push: { amendments: amendment },
      $set: { auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) },
    };

    await collection.updateOne(findFilter, removeDraftAmendmentsFilter);

    const updateResult = await collection.updateOne(findFilter, pushDraftAmendmentFilter);

    if (updateResult.modifiedCount === 0) {
      throw new FacilityNotFoundError(amendment.facilityId.toString());
    }

    return updateResult;
  }

  /**
   * Updates a portal amendment for a facility in the database.
   *
   * This function finds the facility and portal amendment matching the ids & updates it.
   *
   * @param updatePortalFacilityAmendmentByAmendmentIdParams
   * @param updatePortalFacilityAmendmentByAmendmentIdParams.amendmentId - the amendment id
   * @param updatePortalFacilityAmendmentByAmendmentIdParams.facilityId - the facility id
   * @param updatePortalFacilityAmendmentByAmendmentIdParams.update - the update to apply
   * @param updatePortalFacilityAmendmentByAmendmentIdParams.auditDetails - the users audit details
   * @param updatePortalFacilityAmendmentByAmendmentIdParams.allowedStatuses - the statuses of the amendment
   *
   * @returns The update result.
   */
  public static async updatePortalFacilityAmendmentByAmendmentId({
    amendmentId,
    facilityId,
    update,
    auditDetails,
    allowedStatuses,
  }: {
    update: Partial<PortalFacilityAmendment>;
    amendmentId: ObjectId;
    facilityId: ObjectId;
    auditDetails: AuditDetails;
    allowedStatuses: PortalAmendmentStatus[];
  }): Promise<UpdateResult> {
    try {
      const collection = await this.getCollection();

      const findFilter: Filter<TfmFacility> = {
        _id: { $eq: new ObjectId(facilityId) },
        amendments: {
          $elemMatch: {
            amendmentId: { $eq: new ObjectId(amendmentId) },
            type: { $eq: AMENDMENT_TYPES.PORTAL },
            status: { $in: allowedStatuses },
          },
        },
      };

      const updateFilter: UpdateFilter<TfmFacility> = flatten({
        'amendments.$': update,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      });

      const updateResult = await collection.updateOne(findFilter, updateFilter);

      if (!updateResult.modifiedCount) {
        throw new AmendmentNotFoundError(amendmentId.toString(), facilityId.toString());
      }

      return updateResult;
    } catch (error) {
      console.error('Error updating portal facility amendment %o', error);
      throw error;
    }
  }

  /**
   * Delete a portal amendment for a facility in the database
   * @param deletePortalFacilityAmendmentParams
   * @param deletePortalFacilityAmendmentParams.facilityId - The facility id
   * @param deletePortalFacilityAmendmentParams.amendmentId - The amendment id
   * @param deletePortalFacilityAmendmentParams.auditDetails - The audit details
   * @returns The delete result
   */
  public static async deletePortalFacilityAmendment({
    facilityId,
    amendmentId,
    auditDetails,
  }: {
    facilityId: ObjectId;
    amendmentId: ObjectId;
    auditDetails: PortalAuditDetails;
  }): Promise<UpdateResult> {
    const collection = await this.getCollection();

    const findFilter: Filter<TfmFacility> = {
      _id: { $eq: new ObjectId(facilityId) },
      amendments: { $elemMatch: { amendmentId: { $eq: new ObjectId(amendmentId) }, type: AMENDMENT_TYPES.PORTAL } },
    };

    const updateFilter: UpdateFilter<TfmFacility> = {
      $pull: {
        amendments: { type: AMENDMENT_TYPES.PORTAL, amendmentId: new ObjectId(amendmentId) },
      },
      $set: { auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) },
    };

    const updateResult = await collection.updateOne(findFilter, updateFilter);

    if (!updateResult.modifiedCount) {
      throw new AmendmentNotFoundError(amendmentId.toString(), facilityId.toString());
    }

    return updateResult;
  }
}
