import { TFM_DEAL_STAGE, TFM_AMENDMENT_STATUS, PORTAL_AMENDMENT_STATUS, DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { getAmendmentsInProgress } from './amendments.helper';

const notStartedTFMAmendment = () => ({
  status: TFM_AMENDMENT_STATUS.NOT_STARTED,
  submittedByPim: false,
});

const unsubmittedInProgressTFMAmendment = () => ({
  status: TFM_AMENDMENT_STATUS.IN_PROGRESS,
  submittedByPim: false,
});

const submittedInProgressTFMAmendment = () => ({
  status: TFM_AMENDMENT_STATUS.IN_PROGRESS,
  submittedByPim: true,
});

const completedTFMAmendment = () => ({
  status: TFM_AMENDMENT_STATUS.COMPLETED,
  submittedByPim: true,
});

const notStartedPortalAmendment = () => ({
  status: PORTAL_AMENDMENT_STATUS.DRAFT,
});

const inProgressPortalAmendment = () => ({
  status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
});

const returnedToMakerPortalAmendment = () => ({
  status: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
});

const completedPortalAmendment = () => ({
  status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
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
      };

      expect(result).toEqual(expected);
    });
  });
});
