import { aPortalSessionUser } from "@ukef/dtfs2-common/test-helpers";
import { format, fromUnixTime } from 'date-fns';
import {
  generateAmendmentMandatoryCriteria,
  DATE_FORMATS,
  DEAL_SUBMISSION_TYPE,
  DEAL_STATUS,
  PORTAL_AMENDMENT_STATUS,
} from '@ukef/dtfs2-common';
import { getCurrencySymbol } from '../../../utils/get-currency-symbol';
import { Deal } from '../../../types/deal';
import mapSubmittedToUkefEmailVariables from './map-submitted-to-ukef-email-variables';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment.ts';

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const mockUser = aPortalSessionUser();

const facilityValue = 12345;

const effectiveDateWithoutMs: number = Math.floor(Date.now() / 1000);
const coverEndDate = Number(new Date());
const facilityEndDate = new Date();

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;
const mockFacilityDetails = MOCK_ISSUED_FACILITY.details;
const referenceNumber = `${mockFacilityDetails.ukefFacilityId}-01`;
const makersBank: { name: string } = mockDeal.maker.bank as { name: string };
const bankName = `${makersBank.name}`;
const makersName = `${String(mockDeal.maker.firstname)} ${String(mockDeal.maker.surname)}`;
const checkersName = `${mockUser.firstname} ${mockUser.surname}`;
const makersEmail = String(mockDeal.maker.email);

const genericFields = {
  makersEmail: mockDeal.maker.email,
  checkersEmail: mockUser.email,
  emailVariables: {
    ukefDealId: mockDeal.ukefDealId,
    bankInternalRefName: mockDeal.bankInternalRefName,
    exporterName: mockDeal.exporter.companyName,
    ukefFacilityId: mockFacilityDetails.ukefFacilityId,
    makersName,
    makersEmail,
    checkersName,
    bankName,
    referenceNumber,
  },
};

describe('mapSubmittedToUkefEmailVariables', () => {
  describe('when an amendment has all types of amendments', () => {
    it('should return formatted values', () => {
      // Arrange
      const amendmentAllAmendments = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withDealId(dealId)
        .withFacilityId(facilityId)
        .withAmendmentId(amendmentId)
        .withStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED)
        .withChangeCoverEndDate(true)
        .withCoverEndDate(coverEndDate)
        .withIsUsingFacilityEndDate(true)
        .withFacilityEndDate(facilityEndDate)
        .withChangeFacilityValue(true)
        .withFacilityValue(facilityValue)
        .withEffectiveDate(effectiveDateWithoutMs)
        .build();

      // Act
      const result = mapSubmittedToUkefEmailVariables({
        deal: mockDeal,
        facility: mockFacilityDetails,
        amendment: amendmentAllAmendments,
        user: mockUser,
        referenceNumber,
      });

      // Assert
      const newFacilityValue = `${getCurrencySymbol(mockFacilityDetails.currency!.id)}${facilityValue}`;

      const expected = {
        ...genericFields,
        emailVariables: {
          ...genericFields.emailVariables,
          dateEffectiveFrom: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
          newCoverEndDate: format(coverEndDate, DATE_FORMATS.DD_MMMM_YYYY),
          newFacilityEndDate: format(facilityEndDate, DATE_FORMATS.DD_MMMM_YYYY),
          newFacilityValue,
          eligibilityCriteria: generateAmendmentMandatoryCriteria(amendmentAllAmendments.eligibilityCriteria?.criteria),
        },
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
        .withStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED)
        .withChangeCoverEndDate(false)
        .withIsUsingFacilityEndDate(false)
        .withChangeFacilityValue(true)
        .withFacilityValue(facilityValue)
        .withEffectiveDate(effectiveDateWithoutMs)
        .build();

      // Act
      const result = mapSubmittedToUkefEmailVariables({
        deal: mockDeal,
        facility: mockFacilityDetails,
        amendment: amendmentNoDates,
        user: mockUser,
        referenceNumber,
      });

      // Assert
      const newFacilityValue = `${getCurrencySymbol(mockFacilityDetails.currency!.id)}${facilityValue}`;

      const expected = {
        ...genericFields,
        emailVariables: {
          ...genericFields.emailVariables,
          dateEffectiveFrom: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
          newCoverEndDate: '-',
          newFacilityEndDate: '-',
          newFacilityValue,
          eligibilityCriteria: generateAmendmentMandatoryCriteria(amendmentNoDates.eligibilityCriteria?.criteria),
        },
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
        .withStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED)
        .withChangeCoverEndDate(true)
        .withCoverEndDate(coverEndDate)
        .withIsUsingFacilityEndDate(true)
        .withFacilityEndDate(facilityEndDate)
        .withChangeFacilityValue(false)
        .withEffectiveDate(effectiveDateWithoutMs)
        .build();

      // Act
      const result = mapSubmittedToUkefEmailVariables({
        deal: mockDeal,
        facility: mockFacilityDetails,
        amendment: amendmentDatesNoValue,
        user: mockUser,
        referenceNumber,
      });

      // Assert
      const expected = {
        ...genericFields,
        emailVariables: {
          ...genericFields.emailVariables,
          dateEffectiveFrom: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
          newCoverEndDate: format(coverEndDate, DATE_FORMATS.DD_MMMM_YYYY),
          newFacilityEndDate: format(facilityEndDate, DATE_FORMATS.DD_MMMM_YYYY),
          newFacilityValue: '-',
          eligibilityCriteria: generateAmendmentMandatoryCriteria(amendmentDatesNoValue.eligibilityCriteria?.criteria),
        },
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
        .withStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED)
        .withChangeCoverEndDate(true)
        .withCoverEndDate(coverEndDate)
        .withChangeFacilityValue(false)
        .withEffectiveDate(effectiveDateWithoutMs)
        .build();

      // Act
      const result = mapSubmittedToUkefEmailVariables({
        deal: mockDeal,
        facility: mockFacilityDetails,
        amendment: amendmentDateNoValue,
        user: mockUser,
        referenceNumber,
      });

      // Assert
      const expected = {
        ...genericFields,
        emailVariables: {
          ...genericFields.emailVariables,
          dateEffectiveFrom: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
          newCoverEndDate: format(coverEndDate, DATE_FORMATS.DD_MMMM_YYYY),
          newFacilityEndDate: '-',
          newFacilityValue: '-',
          eligibilityCriteria: generateAmendmentMandatoryCriteria(amendmentDateNoValue.eligibilityCriteria?.criteria),
        },
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
        .withStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED)
        .build();

      // Act
      const result = mapSubmittedToUkefEmailVariables({
        deal: mockDeal,
        facility: mockFacilityDetails,
        amendment: amendmentDateNoValue,
        user: mockUser,
        referenceNumber,
      });

      // Assert
      const expected = {
        ...genericFields,
        emailVariables: {
          ...genericFields.emailVariables,
          dateEffectiveFrom: '-',
          newCoverEndDate: '-',
          newFacilityEndDate: '-',
          newFacilityValue: '-',
          eligibilityCriteria: generateAmendmentMandatoryCriteria(amendmentDateNoValue.eligibilityCriteria?.criteria),
        },
      };

      expect(result).toEqual(expected);
    });
  });
});
