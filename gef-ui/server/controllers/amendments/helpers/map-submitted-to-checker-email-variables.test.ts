import { format, fromUnixTime } from 'date-fns';
import dotenv from 'dotenv';
import { DATE_FORMATS, DEAL_SUBMISSION_TYPE, DEAL_STATUS, aPortalSessionUser, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { getCurrencySymbol } from '../../../utils/get-currency-symbol.ts';
import { Deal } from '../../../types/deal';
import mapSubmittedToCheckerEmailVariables from './map-submitted-to-checker-email-variables';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment.ts';

dotenv.config();

const { PORTAL_UI_URL } = process.env;

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const mockUser = aPortalSessionUser();

const mockChecker = {
  ...mockUser,
  firstname: 'checkerFirst',
  surname: 'checkerLast',
  email: 'checker@ukexportfinance.gov.uk',
};

const facilityValue = 12345;

const effectiveDateWithoutMs = Number(new Date()) / 1000;
const coverEndDate = Number(new Date());
const facilityEndDate = new Date();
const formattedNow = format(new Date(), DATE_FORMATS.DD_MMMM_YYYY);

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;
const mockFacilityDetails = MOCK_ISSUED_FACILITY.details;

const portalUrl = `${PORTAL_UI_URL}/login`;

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
      const result = mapSubmittedToCheckerEmailVariables({
        deal: mockDeal,
        facility: mockFacilityDetails,
        amendment: amendmentAllAmendments,
        user: mockUser,
        checker: mockChecker,
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
        makersName: `${mockUser.firstname} ${mockUser.surname}`,
        makersEmail: mockUser.email,
        checkersName: `${mockChecker.firstname} ${mockChecker.surname}`,
        checkersEmail: mockChecker.email,
        portalUrl,
        dateSubmittedByMaker: formattedNow,
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
      const result = mapSubmittedToCheckerEmailVariables({
        deal: mockDeal,
        facility: mockFacilityDetails,
        amendment: amendmentNoDates,
        user: mockUser,
        checker: mockChecker,
      });

      // Assert
      const expected = {
        ukefDealId: mockDeal.ukefDealId,
        bankInternalRefName: mockDeal.bankInternalRefName,
        exporterName: mockDeal.exporter.companyName,
        ukefFacilityId: mockFacilityDetails.ukefFacilityId,
        dateEffectiveFrom: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
        newCoverEndDate: '-',
        newFacilityEndDate: '-',
        newFacilityValue: `${getCurrencySymbol(mockFacilityDetails.currency!.id)}${facilityValue}`,
        makersName: `${mockUser.firstname} ${mockUser.surname}`,
        makersEmail: mockUser.email,
        checkersName: `${mockChecker.firstname} ${mockChecker.surname}`,
        checkersEmail: mockChecker.email,
        portalUrl,
        dateSubmittedByMaker: formattedNow,
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
      const result = mapSubmittedToCheckerEmailVariables({
        deal: mockDeal,
        facility: mockFacilityDetails,
        amendment: amendmentDatesNoValue,
        user: mockUser,
        checker: mockChecker,
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
        newFacilityValue: '-',
        makersName: `${mockUser.firstname} ${mockUser.surname}`,
        makersEmail: mockUser.email,
        checkersName: `${mockChecker.firstname} ${mockChecker.surname}`,
        checkersEmail: mockChecker.email,
        portalUrl,
        dateSubmittedByMaker: formattedNow,
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
      const result = mapSubmittedToCheckerEmailVariables({
        deal: mockDeal,
        facility: mockFacilityDetails,
        amendment: amendmentDateNoValue,
        user: mockUser,
        checker: mockChecker,
      });

      // Assert
      const expected = {
        ukefDealId: mockDeal.ukefDealId,
        bankInternalRefName: mockDeal.bankInternalRefName,
        exporterName: mockDeal.exporter.companyName,
        ukefFacilityId: mockFacilityDetails.ukefFacilityId,
        dateEffectiveFrom: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
        newCoverEndDate: format(coverEndDate, DATE_FORMATS.DD_MMMM_YYYY),
        newFacilityEndDate: '-',
        newFacilityValue: '-',
        makersName: `${mockUser.firstname} ${mockUser.surname}`,
        makersEmail: mockUser.email,
        checkersName: `${mockChecker.firstname} ${mockChecker.surname}`,
        checkersEmail: mockChecker.email,
        portalUrl,
        dateSubmittedByMaker: formattedNow,
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
      const result = mapSubmittedToCheckerEmailVariables({
        deal: mockDeal,
        facility: mockFacilityDetails,
        amendment: amendmentDateNoValue,
        user: mockUser,
        checker: mockChecker,
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
        makersName: `${mockUser.firstname} ${mockUser.surname}`,
        makersEmail: mockUser.email,
        checkersName: `${mockChecker.firstname} ${mockChecker.surname}`,
        checkersEmail: mockChecker.email,
        portalUrl,
        dateSubmittedByMaker: formattedNow,
      };

      expect(result).toEqual(expected);
    });
  });
});
