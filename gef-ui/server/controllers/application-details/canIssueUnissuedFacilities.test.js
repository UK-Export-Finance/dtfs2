const { ROLES, DEAL_SUBMISSION_TYPE, ACBS_FACILITY_STAGE } = require('@ukef/dtfs2-common');
const { MOCK_AIN_APPLICATION_UNISSUED_ONLY, MOCK_MIA_APPLICATION_UNISSUED_ONLY } = require('../../utils/mocks/mock-applications');
const { canIssueUnissuedFacilities } = require('./canIssueUnissuedFacilities');

const mockPortalDeal = {
  ...MOCK_AIN_APPLICATION_UNISSUED_ONLY,
  userRoles: [ROLES.MAKER],
};

const mockTfmDeal = {
  tfm: {
    acbs: {
      facilities: [
        {
          facilityStage: ACBS_FACILITY_STAGE.COMMITMENT,
        },
      ],
    },
  },
};

const nonMakerUsers = [null, undefined, {}, '', ROLES.ADMIN, ROLES.CHECKER, ROLES.PAYMENT_REPORT_OFFICER, ROLES.READ_ONLY];

describe('canIssueUnissuedFacilities', () => {
  describe('User role', () => {
    it('should return true if the user is a maker', () => {
      // Arrange
      const tfmDeal = mockTfmDeal;
      const portalDeal = mockPortalDeal;
      const unissuedFacilitiesPresent = true;
      const canResubmitIssueFacilities = [];
      const hasUkefDecisionAccepted = false;

      // Act
      const response = canIssueUnissuedFacilities({
        portalDeal,
        tfmDeal,
        unissuedFacilitiesPresent,
        canResubmitIssueFacilities,
        hasUkefDecisionAccepted,
      });

      // Assert
      expect(response).toBe(true);
    });

    it.each(nonMakerUsers)('should return false if the user is `%s`', (user) => {
      // Arrange
      const tfmDeal = mockTfmDeal;
      const portalDeal = {
        ...mockPortalDeal,
        userRoles: [user],
      };
      const unissuedFacilitiesPresent = true;
      const canResubmitIssueFacilities = [];
      const hasUkefDecisionAccepted = false;

      // Act
      const response = canIssueUnissuedFacilities({
        portalDeal,
        tfmDeal,
        unissuedFacilitiesPresent,
        canResubmitIssueFacilities,
        hasUkefDecisionAccepted,
      });

      // Assert
      expect(response).toBe(false);
    });
  });

  describe('Re-submit issued facilities', () => {
    it('should return false if deal has facilities marked for re-submission', () => {
      // Arrange
      const tfmDeal = mockTfmDeal;
      const portalDeal = mockPortalDeal;
      const unissuedFacilitiesPresent = true;
      const canResubmitIssueFacilities = [
        {
          name: MOCK_AIN_APPLICATION_UNISSUED_ONLY.facilities.items[0].details.name,
          id: MOCK_AIN_APPLICATION_UNISSUED_ONLY.facilities.items[0].details._id,
        },
      ];
      const hasUkefDecisionAccepted = false;

      // Act
      const response = canIssueUnissuedFacilities({
        portalDeal,
        tfmDeal,
        unissuedFacilitiesPresent,
        canResubmitIssueFacilities,
        hasUkefDecisionAccepted,
      });

      // Assert
      expect(response).toBe(false);
    });

    it('should return true if deal has no facilities marked for re-submission', () => {
      // Arrange
      const tfmDeal = mockTfmDeal;
      const portalDeal = mockPortalDeal;
      const unissuedFacilitiesPresent = true;
      const canResubmitIssueFacilities = [];
      const hasUkefDecisionAccepted = false;

      // Act
      const response = canIssueUnissuedFacilities({
        portalDeal,
        tfmDeal,
        unissuedFacilitiesPresent,
        canResubmitIssueFacilities,
        hasUkefDecisionAccepted,
      });

      // Assert
      expect(response).toBe(true);
    });
  });

  describe('Submission type', () => {
    it('should return true if the deal submission type is an AIN', () => {
      // Arrange
      const tfmDeal = mockTfmDeal;
      const portalDeal = mockPortalDeal;
      const unissuedFacilitiesPresent = true;
      const canResubmitIssueFacilities = [];
      const hasUkefDecisionAccepted = false;

      // Act
      const response = canIssueUnissuedFacilities({
        portalDeal,
        tfmDeal,
        unissuedFacilitiesPresent,
        canResubmitIssueFacilities,
        hasUkefDecisionAccepted,
      });

      // Assert
      expect(response).toBe(true);
    });

    it('should return true if the deal submission type is an MIN with UKEF decision approved (with or without conditions)', () => {
      // Arrange
      const tfmDeal = mockTfmDeal;
      const portalDeal = {
        ...MOCK_MIA_APPLICATION_UNISSUED_ONLY,
        submissionType: DEAL_SUBMISSION_TYPE.MIN,
        ukefDecisionAccepted: true,
        userRoles: [ROLES.MAKER],
      };
      const unissuedFacilitiesPresent = true;
      const canResubmitIssueFacilities = [];
      const hasUkefDecisionAccepted = true;

      // Act
      const response = canIssueUnissuedFacilities({
        portalDeal,
        tfmDeal,
        unissuedFacilitiesPresent,
        canResubmitIssueFacilities,
        hasUkefDecisionAccepted,
      });

      // Assert
      expect(response).toBe(true);
    });

    it('should return false if the deal submission type is an MIN with UKEF decission rejected', () => {
      // Arrange
      const tfmDeal = mockTfmDeal;
      const portalDeal = {
        ...MOCK_MIA_APPLICATION_UNISSUED_ONLY,
        submissionType: DEAL_SUBMISSION_TYPE.MIN,
        ukefDecisionAccepted: false,
        userRoles: [ROLES.MAKER],
      };
      const unissuedFacilitiesPresent = true;
      const canResubmitIssueFacilities = [];
      const hasUkefDecisionAccepted = false;

      // Act
      const response = canIssueUnissuedFacilities({
        portalDeal,
        tfmDeal,
        unissuedFacilitiesPresent,
        canResubmitIssueFacilities,
        hasUkefDecisionAccepted,
      });

      // Assert
      expect(response).toBe(false);
    });

    it('should return true if the deal submission type is an MIA', () => {
      // Arrange
      const tfmDeal = mockTfmDeal;
      const portalDeal = {
        ...MOCK_MIA_APPLICATION_UNISSUED_ONLY,
        userRoles: [ROLES.MAKER],
      };
      const unissuedFacilitiesPresent = true;
      const canResubmitIssueFacilities = [];
      const hasUkefDecisionAccepted = false;

      // Act
      const response = canIssueUnissuedFacilities({
        portalDeal,
        tfmDeal,
        unissuedFacilitiesPresent,
        canResubmitIssueFacilities,
        hasUkefDecisionAccepted,
      });

      // Assert
      expect(response).toBe(true);
    });
  });

  describe('ACBS reconciliation', () => {
    it('should return true if TFM has reconciled with ACBS payload responses', () => {
      // Arrange
      const tfmDeal = mockTfmDeal;
      const portalDeal = mockPortalDeal;
      const unissuedFacilitiesPresent = true;
      const canResubmitIssueFacilities = [];
      const hasUkefDecisionAccepted = false;

      // Act
      const response = canIssueUnissuedFacilities({
        portalDeal,
        tfmDeal,
        unissuedFacilitiesPresent,
        canResubmitIssueFacilities,
        hasUkefDecisionAccepted,
      });

      // Assert
      expect(response).toBe(true);
    });

    it('should return false if TFM has not reconciled with ACBS payload responses', () => {
      // Arrange
      const tfmDeal = {
        tfm: {},
      };
      const portalDeal = mockPortalDeal;
      const unissuedFacilitiesPresent = true;
      const canResubmitIssueFacilities = [];
      const hasUkefDecisionAccepted = false;

      // Act
      const response = canIssueUnissuedFacilities({
        portalDeal,
        tfmDeal,
        unissuedFacilitiesPresent,
        canResubmitIssueFacilities,
        hasUkefDecisionAccepted,
      });

      // Assert
      expect(response).toBe(false);
    });

    it('should return false if deal has not yet been submitted to the TFM', () => {
      // Arrange
      const tfmDeal = null;
      const portalDeal = mockPortalDeal;
      const unissuedFacilitiesPresent = true;
      const canResubmitIssueFacilities = [];
      const hasUkefDecisionAccepted = false;

      // Act
      const response = canIssueUnissuedFacilities({
        portalDeal,
        tfmDeal,
        unissuedFacilitiesPresent,
        canResubmitIssueFacilities,
        hasUkefDecisionAccepted,
      });

      // Assert
      expect(response).toBe(false);
    });
  });
});
