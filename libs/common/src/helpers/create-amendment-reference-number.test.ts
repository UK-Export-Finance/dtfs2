import { AMENDMENT_TYPES } from '../constants/amendments';
import { FacilityAllTypeAmendmentWithUkefId } from '../types/portal/amendment';
import { createAmendmentReferenceNumber } from './create-amendment-reference-number';

describe('createAmendmentReferenceNumber', () => {
  const amendmentId = '6597dffeb5ef5ff4267e5046';
  const mockUkefFacilityId = '12345678';
  const amendment = { amendmentId, type: AMENDMENT_TYPES.PORTAL } as FacilityAllTypeAmendmentWithUkefId;

  it('should return the correct reference number with padded amendment number', () => {
    const amendmentsOnFacility = [amendment, amendment, amendment] as FacilityAllTypeAmendmentWithUkefId[];
    const result = createAmendmentReferenceNumber(amendmentsOnFacility, mockUkefFacilityId);
    expect(result).toBe('12345678-004');
  });

  it('should pad amendment number with zeros up to 3 digits', () => {
    const amendments = Array(9).fill(amendment) as FacilityAllTypeAmendmentWithUkefId[];
    const result = createAmendmentReferenceNumber(amendments, mockUkefFacilityId);
    expect(result).toBe('12345678-010');
  });

  it('should handle empty amendments array', () => {
    const amendments: FacilityAllTypeAmendmentWithUkefId[] = [] as FacilityAllTypeAmendmentWithUkefId[];
    const result = createAmendmentReferenceNumber(amendments, mockUkefFacilityId);
    expect(result).toBe('12345678-001');
  });

  it('should handle large amendment numbers', () => {
    const amendments = Array(123).fill(amendment) as FacilityAllTypeAmendmentWithUkefId[];
    const result = createAmendmentReferenceNumber(amendments, mockUkefFacilityId);
    expect(result).toBe('12345678-124');
  });
});
