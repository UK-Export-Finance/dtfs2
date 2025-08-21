import { add, getUnixTime, fromUnixTime, format, sub } from 'date-fns';
import { TFM_DEAL_STAGE, TFM_AMENDMENT_STATUS, PORTAL_AMENDMENT_STATUS, DEAL_SUBMISSION_TYPE, DATE_FORMATS } from '@ukef/dtfs2-common';
import { getAmendmentsInProgress } from './amendments.helper';

const previousEffectiveDate = getUnixTime(sub(new Date(), { days: 1 }));

const notStartedTFMAmendment = () => ({
  status: TFM_AMENDMENT_STATUS.NOT_STARTED,
  submittedByPim: false,
  effectiveDate: previousEffectiveDate,
});

const unsubmittedInProgressTFMAmendment = () => ({
  status: TFM_AMENDMENT_STATUS.IN_PROGRESS,
  submittedByPim: false,
  effectiveDate: previousEffectiveDate,
});

const submittedInProgressTFMAmendment = () => ({
  status: TFM_AMENDMENT_STATUS.IN_PROGRESS,
  submittedByPim: true,
  effectiveDate: previousEffectiveDate,
});

const completedTFMAmendment = () => ({
  status: TFM_AMENDMENT_STATUS.COMPLETED,
  submittedByPim: true,
  effectiveDate: previousEffectiveDate,
});

const notStartedPortalAmendment = () => ({
  status: PORTAL_AMENDMENT_STATUS.DRAFT,
  effectiveDate: previousEffectiveDate,
});

const inProgressPortalAmendment = () => ({
  status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
  effectiveDate: previousEffectiveDate,
});

const returnedToMakerPortalAmendment = () => ({
  status: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
  effectiveDate: previousEffectiveDate,
});

const completedPortalAmendment = () => ({
  status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
  effectiveDate: previousEffectiveDate,
});

const dealId = '1';
const facilityId = '2';
const effectiveDate = getUnixTime(add(new Date(), { days: 1 }));
const ukefFacilityId = '001625566';
const referenceNumber = '001625566-001';
const completedPortalAmendmentFutureEffectiveDate = () => ({
  status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
  effectiveDate,
  ukefFacilityId,
  referenceNumber,
  dealId,
  facilityId,
});

const deal = { dealSnapshot: { submissionType: DEAL_SUBMISSION_TYPE.AIN }, tfm: { stage: TFM_DEAL_STAGE.CONFIRMED } };
const teams = ['PIM'];

describe('getAmendmentsInProgress', () => {
  describe('when there are no amendments', () => {
    it('should return an empty array', () => {
      // Arrange
      const amendments = [];

      // Act
      const result = getAmendmentsInProgress({ amendments, deal, teams });

      // Assert
      const expected = {
        amendmentsInProgress: [],
        hasAmendmentInProgress: false,
        hasAmendmentInProgressButton: false,
        showContinueAmendmentButton: false,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there is one TFM amendment that is not started', () => {
    it('should return an empty array', () => {
      // Arrange
      const amendments = [notStartedTFMAmendment()];

      // Act
      const result = getAmendmentsInProgress({ amendments, deal, teams });

      // Assert
      const expected = {
        amendmentsInProgress: [],
        hasAmendmentInProgress: false,
        hasAmendmentInProgressButton: false,
        showContinueAmendmentButton: false,
        inProgressPortalAmendments: [],
        hasInProgressPortalAmendments: false,
        hasFutureEffectiveDatePortalAmendments: false,
        formattedFutureEffectiveDatePortalAmendments: [],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there is one TFM amendment that is in progress and not submitted by PIM', () => {
    it('should return the amendment in progress', () => {
      // Arrange
      const amendments = [unsubmittedInProgressTFMAmendment()];

      // Act
      const result = getAmendmentsInProgress({ amendments, deal, teams });

      // Assert
      const expected = {
        amendmentsInProgress: [unsubmittedInProgressTFMAmendment()],
        hasAmendmentInProgress: true,
        hasAmendmentInProgressButton: true,
        showContinueAmendmentButton: true,
        inProgressPortalAmendments: [],
        hasInProgressPortalAmendments: false,
        hasFutureEffectiveDatePortalAmendments: false,
        formattedFutureEffectiveDatePortalAmendments: [],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there is one TFM amendment that is in progress and submitted by PIM', () => {
    it('should return the amendment in progress', () => {
      // Arrange
      const amendments = [submittedInProgressTFMAmendment()];

      // Act
      const result = getAmendmentsInProgress({ amendments, deal, teams });

      // Assert
      const expected = {
        amendmentsInProgress: [],
        hasAmendmentInProgress: false,
        hasAmendmentInProgressButton: false,
        showContinueAmendmentButton: false,
        inProgressPortalAmendments: [],
        hasInProgressPortalAmendments: false,
        hasFutureEffectiveDatePortalAmendments: false,
        formattedFutureEffectiveDatePortalAmendments: [],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there is one TFM amendment that is completed', () => {
    it('should return an empty array', () => {
      // Arrange
      const amendments = [completedTFMAmendment()];

      // Act
      const result = getAmendmentsInProgress({ amendments, deal, teams });

      // Assert
      const expected = {
        amendmentsInProgress: [],
        hasAmendmentInProgress: false,
        hasAmendmentInProgressButton: false,
        showContinueAmendmentButton: false,
        inProgressPortalAmendments: [],
        hasInProgressPortalAmendments: false,
        hasFutureEffectiveDatePortalAmendments: false,
        formattedFutureEffectiveDatePortalAmendments: [],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there is one portal amendment that is in draft', () => {
    it('should return the amendment in progress', () => {
      // Arrange
      const amendments = [notStartedPortalAmendment()];

      // Act
      const result = getAmendmentsInProgress({ amendments, deal, teams });

      // Assert
      const expected = {
        amendmentsInProgress: [notStartedPortalAmendment()],
        hasAmendmentInProgress: true,
        hasAmendmentInProgressButton: false,
        showContinueAmendmentButton: false,
        inProgressPortalAmendments: [notStartedPortalAmendment()],
        hasInProgressPortalAmendments: true,
        hasFutureEffectiveDatePortalAmendments: false,
        formattedFutureEffectiveDatePortalAmendments: [],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there is one portal amendment that is in progress', () => {
    it('should return the amendment in progress', () => {
      // Arrange
      const amendments = [inProgressPortalAmendment()];

      // Act
      const result = getAmendmentsInProgress({ amendments, deal, teams });

      // Assert
      const expected = {
        amendmentsInProgress: [inProgressPortalAmendment()],
        hasAmendmentInProgress: true,
        hasAmendmentInProgressButton: false,
        showContinueAmendmentButton: false,
        inProgressPortalAmendments: [inProgressPortalAmendment()],
        hasInProgressPortalAmendments: true,
        hasFutureEffectiveDatePortalAmendments: false,
        formattedFutureEffectiveDatePortalAmendments: [],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there is one portal amendment that is returned to maker', () => {
    it('should return the amendment in progress', () => {
      // Arrange
      const amendments = [returnedToMakerPortalAmendment()];

      // Act
      const result = getAmendmentsInProgress({ amendments, deal, teams });

      // Assert
      const expected = {
        amendmentsInProgress: [returnedToMakerPortalAmendment()],
        hasAmendmentInProgress: true,
        hasAmendmentInProgressButton: false,
        showContinueAmendmentButton: false,
        inProgressPortalAmendments: [returnedToMakerPortalAmendment()],
        hasInProgressPortalAmendments: true,
        hasFutureEffectiveDatePortalAmendments: false,
        formattedFutureEffectiveDatePortalAmendments: [],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there is one portal amendment that is completed', () => {
    it('should return an empty array', () => {
      // Arrange
      const amendments = [completedPortalAmendment()];

      // Act
      const result = getAmendmentsInProgress({ amendments, deal, teams });

      // Assert
      const expected = {
        amendmentsInProgress: [],
        hasAmendmentInProgress: false,
        hasAmendmentInProgressButton: false,
        showContinueAmendmentButton: false,
        inProgressPortalAmendments: [],
        hasInProgressPortalAmendments: false,
        hasFutureEffectiveDatePortalAmendments: false,
        formattedFutureEffectiveDatePortalAmendments: [],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there is one portal amendment that is completed with a future effective date', () => {
    it('should return an populated formattedFutureEffectiveDatePortalAmendments array', () => {
      // Arrange
      const amendments = [completedPortalAmendmentFutureEffectiveDate()];

      // Act
      const result = getAmendmentsInProgress({ amendments, deal, teams });

      const formattedFutureEffectiveDatePortalAmendments = [
        {
          facilityId,
          ukefFacilityId,
          effectiveDate: format(fromUnixTime(effectiveDate), DATE_FORMATS.DD_MMMM_YYYY),
          referenceNumber,
          href: `/case/${dealId}/facility/${facilityId}#amendments`,
        },
      ];

      // Assert
      const expected = {
        amendmentsInProgress: [],
        hasAmendmentInProgress: false,
        hasAmendmentInProgressButton: false,
        showContinueAmendmentButton: false,
        inProgressPortalAmendments: [],
        hasInProgressPortalAmendments: false,
        hasFutureEffectiveDatePortalAmendments: true,
        formattedFutureEffectiveDatePortalAmendments,
      };

      expect(result).toEqual(expected);
    });
  });
});
