import { Collection, ObjectId, UpdateResult, WithoutId } from 'mongodb';
import {
  AuditDetails,
  DEAL_SUBMISSION_TYPE,
  DealNotFoundError,
  InvalidDealIdError,
  MONGO_DB_COLLECTIONS,
  TFM_DEAL_CANCELLATION_STATUS,
  TFM_DEAL_STAGE,
  TfmActivity,
  TfmDeal,
  TfmDealCancellation,
  TfmDealCancellationResponse,
  TfmDealCancellationWithStatus,
  TfmDealWithCancellation,
} from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { flatten } from 'mongo-dot-notation';
import { mongoDbClient } from '../../drivers/db-client';

export class TfmDealCancellationRepo {
  private static async getCollection(): Promise<Collection<WithoutId<TfmDeal>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_DEALS);
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

    const dealCollection = await this.getCollection();
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
   * Find deals with scheduled cancellations
   * @returns the deals
   */
  public static async findScheduledDealCancellations(): Promise<TfmDealWithCancellation[]> {
    const dealCollection = await this.getCollection();

    return await dealCollection
      .find<TfmDealWithCancellation>({
        'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
        'tfm.stage': { $ne: TFM_DEAL_STAGE.CANCELLED },
        'tfm.cancellation.status': { $eq: TFM_DEAL_CANCELLATION_STATUS.SCHEDULED },
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

    const dealCollection = await this.getCollection();

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

    const dealCollection = await this.getCollection();

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
   * submits the deal cancellation and updates the respective deal stage
   * @param dealId - The deal id
   * @param cancellation - The deal cancellation details to submit
   * @param auditDetails - The users audit details
   */
  public static async submitDealCancellation({
    dealId,
    cancellation,
    activity,
    auditDetails,
  }: {
    dealId: string | ObjectId;
    cancellation: TfmDealCancellation;
    activity: TfmActivity;
    auditDetails: AuditDetails;
  }): Promise<TfmDealCancellationResponse> {
    if (!ObjectId.isValid(dealId)) {
      throw new InvalidDealIdError(dealId.toString());
    }

    const dealCollection = await this.getCollection();

    const updateDeal = await dealCollection.updateOne(
      {
        _id: { $eq: new ObjectId(dealId) },
        'tfm.stage': { $ne: TFM_DEAL_STAGE.CANCELLED },
        'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
        'tfm.cancellation.reason': { $eq: cancellation.reason },
        'tfm.cancellation.bankRequestDate': { $eq: cancellation.bankRequestDate },
        'tfm.cancellation.effectiveFrom': { $eq: cancellation.effectiveFrom },
      },
      {
        $set: {
          'tfm.stage': TFM_DEAL_STAGE.CANCELLED,
          'tfm.cancellation.status': TFM_DEAL_CANCELLATION_STATUS.COMPLETED,
          auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
        },
        $push: {
          'tfm.activities': activity,
        },
      },
    );

    if (!updateDeal?.matchedCount) {
      throw new DealNotFoundError(dealId.toString());
    }

    return { cancelledDealUkefId: dealId };
  }
}
