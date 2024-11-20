import { Collection, ObjectId, UpdateResult, WithoutId, UpdateFilter } from 'mongodb';
import {
  AuditDetails,
  DEAL_SUBMISSION_TYPE,
  DealNotFoundError,
  InvalidDealIdError,
  MONGO_DB_COLLECTIONS,
  TFM_DEAL_CANCELLATION_STATUS,
  TFM_DEAL_STAGE,
  TfmActivity,
  TFM_FACILITY_STAGE,
  TfmDeal,
  TfmDealCancellation,
  TfmDealCancellationWithStatus,
  TfmDealWithCancellation,
  TfmFacility,
} from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { flatten } from 'mongo-dot-notation';
import { mongoDbClient } from '../../drivers/db-client';

export class TfmDealCancellationRepo {
  private static async getDealCollection(): Promise<Collection<WithoutId<TfmDeal>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_DEALS);
  }

  private static async getFacilityCollection(): Promise<Collection<WithoutId<TfmFacility>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
  }

  /**
   * Finds the cancellation by dealId
   * @param dealId - The deal id
   * @returns the found deal cancellation
   */
  public static async findDealCancellationByDealId(dealId: string | ObjectId): Promise<Partial<TfmDealCancellationWithStatus>> {
    if (!ObjectId.isValid(dealId)) {
      throw new InvalidDealIdError(dealId.toString());
    }

    const dealCollection = await this.getDealCollection();
    const matchingDeal = await dealCollection.findOne({
      _id: { $eq: new ObjectId(dealId) },
      'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
    });

    if (!matchingDeal) {
      throw new DealNotFoundError(dealId.toString());
    }

    if (!matchingDeal.tfm.cancellation) {
      return {};
    }

    return matchingDeal.tfm.cancellation;
  }

  /**
   * Find deals with pending cancellations
   * @returns the deals
   */
  public static async findPendingDealCancellations(): Promise<TfmDealWithCancellation[]> {
    const dealCollection = await this.getDealCollection();

    return await dealCollection
      .find<TfmDealWithCancellation>({
        'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
        'tfm.stage': { $ne: TFM_DEAL_STAGE.CANCELLED },
        'tfm.cancellation.status': { $eq: TFM_DEAL_CANCELLATION_STATUS.PENDING },
      })
      .toArray();
  }

  /**
   * Updates the deal tfm object with the supplied cancellation
   * @param dealId - The deal id
   * @param update - The deal cancellation update to apply
   * @param auditDetails - The users audit details
   * @returns The update result
   */
  public static async updateOneDealCancellation(
    dealId: string | ObjectId,
    update: Partial<TfmDealCancellationWithStatus>,
    auditDetails: AuditDetails,
  ): Promise<UpdateResult> {
    if (!ObjectId.isValid(dealId)) {
      throw new InvalidDealIdError(dealId.toString());
    }

    const dealCollection = await this.getDealCollection();

    const updateResult = await dealCollection.updateOne(
      {
        _id: { $eq: new ObjectId(dealId) },
        'tfm.stage': { $ne: TFM_DEAL_STAGE.CANCELLED },
        'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
      },
      flatten({
        'tfm.cancellation': update,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      }),
    );

    if (!updateResult?.matchedCount) {
      throw new DealNotFoundError(dealId.toString());
    }

    return updateResult;
  }

  /**
   * Deletes the tfm deal cancellation object
   * @param dealId - The deal id
   * @param auditDetails - The users audit details
   */
  public static async deleteOneDealCancellation(dealId: string | ObjectId, auditDetails: AuditDetails): Promise<UpdateResult> {
    if (!ObjectId.isValid(dealId)) {
      throw new InvalidDealIdError(dealId.toString());
    }

    const dealCollection = await this.getDealCollection();

    const updateResult = await dealCollection.updateOne(
      {
        _id: { $eq: new ObjectId(dealId) },
        'tfm.stage': { $ne: TFM_DEAL_STAGE.CANCELLED },
        'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
      },
      { $unset: { 'tfm.cancellation': '' }, $set: { auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) } },
    );

    if (!updateResult?.matchedCount) {
      throw new DealNotFoundError(dealId.toString());
    }

    return updateResult;
  }

  /**
   * Submits the deal cancellation and updates the respective deal stage
   * @param params
   * @param params.dealId - The deal id
   * @param params.cancellation - The deal cancellation details to submit
   * @param params.activity - Object to add to the activities array
   * @param params.auditDetails - The users audit details
   */
  public static async submitDealCancellation({
    dealId,
    cancellation,
    activity,
    auditDetails,
  }: {
    dealId: string | ObjectId;
    cancellation: TfmDealCancellation;
    activity?: TfmActivity;
    auditDetails: AuditDetails;
  }): Promise<{ cancelledDeal: TfmDeal; riskExpiredFacilities: TfmFacility[] }> {
    if (!ObjectId.isValid(dealId)) {
      throw new InvalidDealIdError(dealId.toString());
    }

    const dealCollection = await this.getDealCollection();

    const update: UpdateFilter<WithoutId<TfmDeal>> = {
      $set: {
        'tfm.stage': TFM_DEAL_STAGE.CANCELLED,
        'tfm.cancellation.status': TFM_DEAL_CANCELLATION_STATUS.COMPLETED,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      },
    };

    if (activity) {
      update.$push = {
        'tfm.activities': activity,
      };
    }

    const { value: deal } = await dealCollection.findOneAndUpdate(
      {
        _id: { $eq: new ObjectId(dealId) },
        'tfm.stage': { $ne: TFM_DEAL_STAGE.CANCELLED },
        'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
        'tfm.cancellation.reason': { $eq: cancellation.reason },
        'tfm.cancellation.bankRequestDate': { $eq: cancellation.bankRequestDate },
        'tfm.cancellation.effectiveFrom': { $eq: cancellation.effectiveFrom },
      },
      update,
    );

    if (!deal) {
      throw new DealNotFoundError(dealId.toString());
    }

    const facilityCollection = await this.getFacilityCollection();

    await facilityCollection.updateMany(
      { 'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) } },
      flatten({
        'tfm.facilityStage': TFM_FACILITY_STAGE.RISK_EXPIRED,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      }),
    );

    const riskExpiredFacilities = await facilityCollection.find({ 'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) } }).toArray();

    return { cancelledDeal: deal, riskExpiredFacilities };
  }

  /**
   * Schedules a deal cancellation (occurs when a deal cancellation is submitted but the effectiveFrom is in the future).
   * In this instance, the deal and facility statuses remain the same, but the tfm cancellation object 'status' is updated to 'pending'.
   * When the effectiveFrom date passes, a separate chron job will run to submit the deal cancellation using submitDealCancellation above,
   * updating the deal and facility statuses to 'Cancelled' / 'Risk expired' respectively.
   * We still return the deal ID and corresponding facility IDs in this instance to be used on the cancellation confirmation email.
   * @param params
   * @param params.dealId - The deal id
   * @param params.cancellation - The deal cancellation details to submit
   * @param params.activity - Object to add to the activities array
   * @param params.auditDetails - The users audit details
   */
  public static async scheduleDealCancellation({
    dealId,
    cancellation,
    activity,
    auditDetails,
  }: {
    dealId: string | ObjectId;
    cancellation: TfmDealCancellation;
    activity?: TfmActivity;
    auditDetails: AuditDetails;
  }): Promise<{ cancelledDeal: TfmDeal; riskExpiredFacilities: TfmFacility[] }> {
    if (!ObjectId.isValid(dealId)) {
      throw new InvalidDealIdError(dealId.toString());
    }

    const dealCollection = await this.getDealCollection();

    const update: UpdateFilter<WithoutId<TfmDeal>> = {
      $set: {
        'tfm.cancellation.status': TFM_DEAL_CANCELLATION_STATUS.PENDING,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      },
    };

    if (activity) {
      update.$push = {
        'tfm.activities': activity,
      };
    }

    const { value: deal } = await dealCollection.findOneAndUpdate(
      {
        _id: { $eq: new ObjectId(dealId) },
        'tfm.stage': { $ne: TFM_DEAL_STAGE.CANCELLED },
        'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
        'tfm.cancellation.reason': { $eq: cancellation.reason },
        'tfm.cancellation.bankRequestDate': { $eq: cancellation.bankRequestDate },
        'tfm.cancellation.effectiveFrom': { $eq: cancellation.effectiveFrom },
      },
      update,
    );

    if (!deal) {
      throw new DealNotFoundError(dealId.toString());
    }

    const facilityCollection = await this.getFacilityCollection();

    const riskExpiredFacilities = await facilityCollection.find({ 'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) } }).toArray();

    return { cancelledDeal: deal, riskExpiredFacilities };
  }
}
