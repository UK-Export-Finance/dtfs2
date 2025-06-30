import { ObjectId } from 'mongodb';
import { add } from 'date-fns';
import { Deal, FacilityAmendment, PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES, getUnixTimestampSeconds, getEpochMs } from '@ukef/dtfs2-common';
import { getDealUpdatedAt } from './get-deal-updatedAt';

const amendmentId = new ObjectId().toString();
const facilityId = new ObjectId().toString();
const dealId = new ObjectId().toString();

const nowDate = new Date();
const tomorrow = add(nowDate, { days: 1 });

const mockDeal = {
  status: 'Acknowledged',
  updatedAt: getEpochMs(nowDate),
} as unknown as Deal;

describe('getDealUpdatedAt', () => {
  it('should return the deal without update the updatedAt when no completed portal amendments on deal', () => {
    // Arrange
    const noAmendmentsCompleted: FacilityAmendment[] = [];

    // Act
    const result = getDealUpdatedAt(mockDeal, noAmendmentsCompleted);

    // Assert
    expect(result).toEqual(mockDeal);
  });

  it('should return the deal without update the updatedAt when completed portal amendmends on deal are effective in the future', () => {
    // Arrange
    const amendment = {
      amendmentId,
      facilityId,
      dealId,
      type: AMENDMENT_TYPES.PORTAL,
      ukefFacilityId: '123',
      createdAt: 1702061978881,
      updatedAt: getUnixTimestampSeconds(tomorrow),
      status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
      eligibilityCriteria: { version: 1, criteria: [] },
    } as unknown as FacilityAmendment;

    const amendmentsTomorrowEffective: FacilityAmendment[] = [amendment];

    // Act
    const result = getDealUpdatedAt(mockDeal, amendmentsTomorrowEffective);

    // Assert
    expect(result).toEqual(mockDeal);
  });

  it('should return the deal with updatedAt the date the last amendment be approved on deal and the effective date is in the past', () => {
    // Arrange
    const amendment = {
      amendmentId,
      facilityId,
      dealId,
      type: AMENDMENT_TYPES.PORTAL,
      ukefFacilityId: '123',
      createdAt: 1702061978881,
      updatedAt: getUnixTimestampSeconds(nowDate),
      status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
      eligibilityCriteria: { version: 1, criteria: [] },
    } as unknown as FacilityAmendment;

    const amendmentsYesterdayEffective: FacilityAmendment[] = [amendment];

    // Act
    const result = getDealUpdatedAt(mockDeal, amendmentsYesterdayEffective);

    // Assert
    expect(result).toEqual({
      ...mockDeal,
      updatedAt: getEpochMs(nowDate),
    });
  });
});
