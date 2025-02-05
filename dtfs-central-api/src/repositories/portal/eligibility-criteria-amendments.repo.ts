import { Collection, WithoutId } from 'mongodb';
import { MONGO_DB_COLLECTIONS, AmendmentsEligibilityCriteria, EligibilityCriteriaNotFoundError, FacilityType } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../../drivers/db-client';

/**
 * Repository to handle database operations for amendments eligibility criteria
 */
export class EligibilityCriteriaAmendmentsRepo {
  private static async getCollection(): Promise<Collection<WithoutId<AmendmentsEligibilityCriteria>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA_AMENDMENTS);
  }

  /**
   * Finds the portal amendments eligibility criteria for the given facility type with the latest version number
   * @param facilityType the facility type
   * @returns The latest portal amendments eligibility criteria for the given facility type
   */
  public static async findLatestEligibilityCriteria(facilityType: FacilityType): Promise<AmendmentsEligibilityCriteria> {
    const collection = await this.getCollection();

    const [latestEligibilityCriteria] = await collection
      .find({ $and: [{ facilityType }, { isInDraft: { $eq: false } }] })
      .sort({ version: -1 })
      .limit(1)
      .toArray();

    if (!latestEligibilityCriteria) {
      console.error('Unable to find latest eligibility criteria for facility type %s', facilityType);
      throw new EligibilityCriteriaNotFoundError();
    }

    return latestEligibilityCriteria;
  }
}
