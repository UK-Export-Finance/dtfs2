import { ObjectId, UpdateFilter, WithoutId, FindOneAndUpdateOptions, Collection, Document, UpdateResult, Filter } from 'mongodb';
import { flatten } from 'mongo-dot-notation';
import {
  AuditDetails,
  TfmFacility,
  FacilityAmendment,
  AmendmentStatus,
  FacilityNotFoundError,
  AMENDMENT_TYPES,
  AMENDMENT_STATUS,
  PortalFacilityAmendment,
  GEF_FACILITY_TYPE,
  TfmFacilityAmendment,
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
   * Find amendments by the amendment status
   * @param status - The amendment status
   * @returns The found amendments
   */
  public static async findAmendmentsByStatus(status: AmendmentStatus): Promise<Document[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.amendmentsByStatus(status))
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
   * Finds amendments by the facility id and status
   * @param facilityId - The facility id
   * @param status - The amendment status
   * @returns The found amendments
   */
  public static async findAmendmentsByFacilityIdAndStatus(facilityId: string | ObjectId, status: AmendmentStatus): Promise<FacilityAmendment[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.amendmentsByFacilityIdAndStatus(facilityId, status))
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
  ): Promise<(FacilityAmendment & { ukefFacilityId: string | null }) | undefined> {
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
   * Finds amendments by the deal id and status
   * @param dealId - The deal id
   * @param status - The amendment status
   * @returns The found amendments
   */
  public static async findAmendmentsByDealIdAndStatus(dealId: string | ObjectId, status: AmendmentStatus): Promise<Document[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.amendmentsByDealIdAndStatus(dealId, status))
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
   * Finds a facility which matches the supplied ukef facility id
   * @param ukefFacilityId - The ukef facility id
   * @returns The found document (or null if not found)
   */
  public static async findOneByUkefFacilityId(ukefFacilityId: string): Promise<TfmFacility | null> {
    const collection = await this.getCollection();
    return await collection.findOne({
      'facilitySnapshot.ukefFacilityId': { $eq: ukefFacilityId },
    });
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
        amendments: { type: AMENDMENT_TYPES.PORTAL, status: { $ne: AMENDMENT_STATUS.COMPLETED } },
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
   *
   * @returns The update result.
   */
  public static async updatePortalFacilityAmendmentByAmendmentId({
    amendmentId,
    facilityId,
    update,
    auditDetails,
  }: {
    update: Partial<PortalFacilityAmendment>;
    amendmentId: string | ObjectId;
    facilityId: string | ObjectId;
    auditDetails: AuditDetails;
  }): Promise<UpdateResult> {
    const collection = await this.getCollection();

    const findFilter: Filter<TfmFacility> = {
      _id: { $eq: new ObjectId(facilityId) },
      amendments: { $elemMatch: { amendmentId: { $eq: new ObjectId(amendmentId) }, type: AMENDMENT_TYPES.PORTAL } },
    };

    const updateFilter: UpdateFilter<TfmFacility> = flatten({
      'amendments.$': update,
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
    });

    const updateResult = await collection.updateOne(findFilter, updateFilter);

    if (updateResult.modifiedCount === 0) {
      throw new FacilityNotFoundError(facilityId.toString());
    }

    return updateResult;
  }
}
