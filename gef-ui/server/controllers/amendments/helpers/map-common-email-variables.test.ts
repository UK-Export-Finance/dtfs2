import { format, fromUnixTime } from 'date-fns';
import { DATE_FORMATS } from '@ukef/dtfs2-common';
import { getCurrencySymbol } from '../facility-value/get-currency-symbol';
import { mapCommonEmailVariables } from './map-common-email-variables';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment.ts';
import { Deal } from '../../../types/deal';

describe('mapCommonEmailVariables', () => {
  const dealId = 'dealId';
  const facilityId = 'facilityId';
  const amendmentId = 'amendmentId';

  const facilityValue = 12345;
  const effectiveDateWithoutMs: number = Math.floor(Date.now() / 1000);
  const coverEndDate = Number(new Date());
  const facilityEndDate = new Date();

  const mockDeal = { ...MOCK_BASIC_DEAL, submissionCount: 1 } as unknown as Deal;
  const mockFacilityDetails = MOCK_ISSUED_FACILITY.details;

  it('should return formatted values when all fields are provided', () => {
    // Arrange
    const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withChangeCoverEndDate(true)
      .withCoverEndDate(coverEndDate)
      .withIsUsingFacilityEndDate(true)
      .withFacilityEndDate(facilityEndDate)
      .withChangeFacilityValue(true)
      .withFacilityValue(facilityValue)
      .withEffectiveDate(effectiveDateWithoutMs)
      .build();

    // Act
    const result = mapCommonEmailVariables({
      deal: mockDeal,
      facility: mockFacilityDetails,
      amendment,
    });

    // Assert
    const expected = {
      ukefDealId: mockDeal.ukefDealId,
      bankInternalRefName: mockDeal.bankInternalRefName,
      exporterName: mockDeal.exporter.companyName,
      ukefFacilityId: mockFacilityDetails.ukefFacilityId,
      dateEffectiveFrom: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
      newCoverEndDate: format(coverEndDate, DATE_FORMATS.DD_MMMM_YYYY),
      newFacilityEndDate: format(facilityEndDate, DATE_FORMATS.DD_MMMM_YYYY),
      newFacilityValue: `${getCurrencySymbol(mockFacilityDetails.currency!.id)}${facilityValue}`,
    };

    expect(result).toEqual(expected);
  });

  it('should return default values when optional fields are missing', () => {
    // Arrange
    const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder().withDealId(dealId).withFacilityId(facilityId).withAmendmentId(amendmentId).build();

    // Act
    const result = mapCommonEmailVariables({
      deal: mockDeal,
      facility: mockFacilityDetails,
      amendment,
    });

    // Assert
    const expected = {
      ukefDealId: mockDeal.ukefDealId,
      bankInternalRefName: mockDeal.bankInternalRefName,
      exporterName: mockDeal.exporter.companyName,
      ukefFacilityId: mockFacilityDetails.ukefFacilityId,
      dateEffectiveFrom: '-',
      newCoverEndDate: '-',
      newFacilityEndDate: '-',
      newFacilityValue: '-',
    };

    expect(result).toEqual(expected);
  });
});
