import { format, fromUnixTime } from 'date-fns';
import { DATE_FORMATS, DEAL_SUBMISSION_TYPE, DEAL_STATUS, aPortalSessionUser, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { getCurrencySymbol } from '../facility-value/get-currency-symbol';
import { Deal } from '../../../types/deal';
import mapSubmittedToCheckerEmailVariables from './map-submitted-to-checker-email-variables';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment.ts';

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const mockUser = aPortalSessionUser();
const facilityValue = 12345;

const effectiveDateWithoutMs = Number(new Date()) / 1000;
const coverEndDate = Number(new Date());
const facilityEndDate = new Date();

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;
const mockFacilityDetails = MOCK_ISSUED_FACILITY.details;

describe('mapSubmittedToCheckerEmailVariables', () => {
  describe('when an amendment has all types of amendments', () => {
    it('should return formatted values', () => {
      // Arrange
      const amendmentAllAmendments = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withDealId(dealId)
        .withFacilityId(facilityId)
        .withAmendmentId(amendmentId)
        .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
        .withChangeCoverEndDate(true)
        .withCoverEndDate(coverEndDate)
        .withIsUsingFacilityEndDate(true)
        .withFacilityEndDate(facilityEndDate)
        .withChangeFacilityValue(true)
        .withFacilityValue(facilityValue)
        .withEffectiveDate(effectiveDateWithoutMs)
        .build();

      // Act
      const result = mapSubmittedToCheckerEmailVariables({ deal: mockDeal, facility: mockFacilityDetails, amendment: amendmentAllAmendments, user: mockUser });

      // Assert
      const expected = {
        ukefDealId: mockDeal.ukefDealId,
        bankInternalRefName: mockDeal.bankInternalRefName,
        exporterName: mockDeal.exporter.companyName,
        ukefFacilityId: mockFacilityDetails.ukefFacilityId,
        formattedEffectiveDate: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
        formattedCoverEndDate: format(coverEndDate, DATE_FORMATS.DD_MMMM_YYYY),
        formattedFacilityEndDate: format(facilityEndDate, DATE_FORMATS.DD_MMMM_YYYY),
        formattedFacilityValue: `${getCurrencySymbol(mockFacilityDetails.currency!.id)}${facilityValue}`,
        recipientName: `${mockUser.firstname} ${mockUser.surname}`,
        sendToEmailAddress: mockUser.email,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when an amendment has no date amendments', () => {
    it('should return formatted values', () => {
      // Arrange
      const amendmentNoDates = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withDealId(dealId)
        .withFacilityId(facilityId)
        .withAmendmentId(amendmentId)
        .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
        .withChangeCoverEndDate(false)
        .withIsUsingFacilityEndDate(false)
        .withChangeFacilityValue(true)
        .withFacilityValue(facilityValue)
        .withEffectiveDate(effectiveDateWithoutMs)
        .build();

      // Act
      const result = mapSubmittedToCheckerEmailVariables({ deal: mockDeal, facility: mockFacilityDetails, amendment: amendmentNoDates, user: mockUser });

      // Assert
      const expected = {
        ukefDealId: mockDeal.ukefDealId,
        bankInternalRefName: mockDeal.bankInternalRefName,
        exporterName: mockDeal.exporter.companyName,
        ukefFacilityId: mockFacilityDetails.ukefFacilityId,
        formattedEffectiveDate: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
        formattedCoverEndDate: '-',
        formattedFacilityEndDate: '-',
        formattedFacilityValue: `${getCurrencySymbol(mockFacilityDetails.currency!.id)}${facilityValue}`,
        recipientName: `${mockUser.firstname} ${mockUser.surname}`,
        sendToEmailAddress: mockUser.email,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when an amendment all dates no value', () => {
    it('should return formatted values', () => {
      // Arrange
      const amendmentDatesNoValue = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withDealId(dealId)
        .withFacilityId(facilityId)
        .withAmendmentId(amendmentId)
        .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
        .withChangeCoverEndDate(true)
        .withCoverEndDate(coverEndDate)
        .withIsUsingFacilityEndDate(true)
        .withFacilityEndDate(facilityEndDate)
        .withChangeFacilityValue(false)
        .withEffectiveDate(effectiveDateWithoutMs)
        .build();

      // Act
      const result = mapSubmittedToCheckerEmailVariables({ deal: mockDeal, facility: mockFacilityDetails, amendment: amendmentDatesNoValue, user: mockUser });

      // Assert
      const expected = {
        ukefDealId: mockDeal.ukefDealId,
        bankInternalRefName: mockDeal.bankInternalRefName,
        exporterName: mockDeal.exporter.companyName,
        ukefFacilityId: mockFacilityDetails.ukefFacilityId,
        formattedEffectiveDate: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
        formattedCoverEndDate: format(coverEndDate, DATE_FORMATS.DD_MMMM_YYYY),
        formattedFacilityEndDate: format(facilityEndDate, DATE_FORMATS.DD_MMMM_YYYY),
        formattedFacilityValue: '-',
        recipientName: `${mockUser.firstname} ${mockUser.surname}`,
        sendToEmailAddress: mockUser.email,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when an amendment coverEndDate, no facilityEndDate, no value', () => {
    it('should return formatted values', () => {
      // Arrange
      const amendmentDateNoValue = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withDealId(dealId)
        .withFacilityId(facilityId)
        .withAmendmentId(amendmentId)
        .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
        .withChangeCoverEndDate(true)
        .withCoverEndDate(coverEndDate)
        .withChangeFacilityValue(false)
        .withEffectiveDate(effectiveDateWithoutMs)
        .build();
      // Act
      const result = mapSubmittedToCheckerEmailVariables({ deal: mockDeal, facility: mockFacilityDetails, amendment: amendmentDateNoValue, user: mockUser });

      // Assert
      const expected = {
        ukefDealId: mockDeal.ukefDealId,
        bankInternalRefName: mockDeal.bankInternalRefName,
        exporterName: mockDeal.exporter.companyName,
        ukefFacilityId: mockFacilityDetails.ukefFacilityId,
        formattedEffectiveDate: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
        formattedCoverEndDate: format(coverEndDate, DATE_FORMATS.DD_MMMM_YYYY),
        formattedFacilityEndDate: '-',
        formattedFacilityValue: '-',
        recipientName: `${mockUser.firstname} ${mockUser.surname}`,
        sendToEmailAddress: mockUser.email,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('whennothing is being amended', () => {
    it('should return formatted values', () => {
      // Arrange
      const amendmentDateNoValue = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withDealId(dealId)
        .withFacilityId(facilityId)
        .withAmendmentId(amendmentId)
        .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
        .build();
      // Act
      const result = mapSubmittedToCheckerEmailVariables({ deal: mockDeal, facility: mockFacilityDetails, amendment: amendmentDateNoValue, user: mockUser });

      // Assert
      const expected = {
        ukefDealId: mockDeal.ukefDealId,
        bankInternalRefName: mockDeal.bankInternalRefName,
        exporterName: mockDeal.exporter.companyName,
        ukefFacilityId: mockFacilityDetails.ukefFacilityId,
        formattedEffectiveDate: '-',
        formattedCoverEndDate: '-',
        formattedFacilityEndDate: '-',
        formattedFacilityValue: '-',
        recipientName: `${mockUser.firstname} ${mockUser.surname}`,
        sendToEmailAddress: mockUser.email,
      };

      expect(result).toEqual(expected);
    });
  });
});
