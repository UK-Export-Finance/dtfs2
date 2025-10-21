import { AMENDMENT_TYPES, PORTAL_AMENDMENT_STATUS, TFM_AMENDMENT_STATUS, AMENDMENT_BANK_DECISION, UNDERWRITER_MANAGER_DECISIONS } from '../constants';
import { canSendToAcbs } from './can-submit-to-acbs';
import { PortalFacilityAmendmentWithUkefId, TfmFacilityAmendmentWithUkefId } from '../types';

describe('canSendToAcbs', () => {
  describe('Automatic amendment', () => {
    describe('Portal amendment', () => {
      it('should return false when the amendment has not been amended with cover end date', () => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.PORTAL,
          changeCoverEndDate: false,
        } as PortalFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeFalsy();
      });

      it('should return false when the amendment has not been amended with value', () => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.PORTAL,
          changeFacilityValue: false,
        } as PortalFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeFalsy();
      });

      it('should return false when the amendment has not been amended with both cover end date and value', () => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.PORTAL,
          changeCoverEndDate: false,
          changeFacilityValue: false,
        } as PortalFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeFalsy();
      });

      const negativePortalAmendmentStatues = [
        PORTAL_AMENDMENT_STATUS.DRAFT,
        PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
        PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
      ];

      it.each(negativePortalAmendmentStatues)('should return false when the portal amendment status is %s', (status) => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.PORTAL,
          changeCoverEndDate: true,
          changeFacilityValue: true,
          status,
        } as PortalFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeFalsy();
      });

      const noUsers = [{}, null, undefined, [], { name: 'test' }, { email: '' }, { name: 'test', email: '' }, { username: '', name: '', email: '' }];

      it.each(noUsers)('should return false when the amendment has user property as %s', (createdBy) => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.PORTAL,
          changeCoverEndDate: true,
          changeFacilityValue: true,
          status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
          createdBy,
        } as PortalFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeFalsy();
      });

      it('should return true only a single attribute has been amended, has been sent to UKEF and has a user', () => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.PORTAL,
          changeCoverEndDate: false,
          changeFacilityValue: true,
          status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
          createdBy: {
            username: 'test',
            name: 'test',
            email: 'test@ukexportfinance.gov.uk',
          },
        } as PortalFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeTruthy();
      });

      it('should return true when both the attributes has been amended, has been sent to UKEF and has a user', () => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.PORTAL,
          changeCoverEndDate: true,
          changeFacilityValue: true,
          status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
          createdBy: {
            username: 'test',
            name: 'test',
            email: 'test@ukexportfinance.gov.uk',
          },
        } as PortalFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeTruthy();
      });
    });

    describe('TFM amendment', () => {
      it('should return false when the amendment has not been amended with cover end date', () => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.TFM,
          changeCoverEndDate: false,
        } as TfmFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeFalsy();
      });

      it('should return false when the amendment has not been amended with value', () => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.TFM,
          changeFacilityValue: false,
        } as TfmFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeFalsy();
      });

      it('should return false when the amendment has not been amended with both cover end date and value', () => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.TFM,
          changeCoverEndDate: false,
          changeFacilityValue: false,
        } as TfmFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeFalsy();
      });

      const negativeTfmAmendmentStatues = [TFM_AMENDMENT_STATUS.NOT_STARTED, TFM_AMENDMENT_STATUS.IN_PROGRESS];

      it.each(negativeTfmAmendmentStatues)('should return false when the TFM amendment status is %s', (status) => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.TFM,
          changeCoverEndDate: true,
          changeFacilityValue: true,
          status,
        } as TfmFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeFalsy();
      });

      it('should return false when the TFM amendment does not PIM property', () => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.TFM,
          changeCoverEndDate: true,
          changeFacilityValue: true,
          status: TFM_AMENDMENT_STATUS.COMPLETED,
        } as TfmFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeFalsy();
      });

      it('should return false when the amendment has not been submitted by PIM', () => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.TFM,
          changeCoverEndDate: true,
          changeFacilityValue: true,
          status: TFM_AMENDMENT_STATUS.COMPLETED,
          submittedByPim: false,
        } as TfmFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeFalsy();
      });

      it('should return true when only a single attribute has been amended, has been sent to UKEF and has been submitted by PIM', () => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.TFM,
          changeCoverEndDate: true,
          changeFacilityValue: false,
          status: TFM_AMENDMENT_STATUS.COMPLETED,
          submittedByPim: true,
        } as TfmFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeTruthy();
      });

      it('should return true when both the attributes of a facility has been amended, has been sent to UKEF and has been submitted by PIM', () => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.TFM,
          changeCoverEndDate: true,
          changeFacilityValue: true,
          status: TFM_AMENDMENT_STATUS.COMPLETED,
          submittedByPim: true,
        } as TfmFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeTruthy();
      });
    });
  });

  describe('Manual amendment', () => {
    const manualTfmAmendments = [
      {
        type: AMENDMENT_TYPES.TFM,
        changeCoverEndDate: true,
        changeFacilityValue: true,
        status: TFM_AMENDMENT_STATUS.COMPLETED,
        submittedByPim: true,
        requireUkefApproval: true,
        bankDecision: {
          decision: AMENDMENT_BANK_DECISION.PROCEED,
          submitted: false,
        },
        ukefDecision: {
          value: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
          coverEndDate: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
        },
      },
      {
        type: AMENDMENT_TYPES.TFM,
        changeCoverEndDate: true,
        changeFacilityValue: true,
        status: TFM_AMENDMENT_STATUS.COMPLETED,
        submittedByPim: true,
        requireUkefApproval: true,
        bankDecision: {
          decision: AMENDMENT_BANK_DECISION.WITHDRAW,
          submitted: false,
        },
        ukefDecision: {
          value: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
          coverEndDate: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
        },
      },
      {
        type: AMENDMENT_TYPES.TFM,
        changeCoverEndDate: true,
        changeFacilityValue: true,
        status: TFM_AMENDMENT_STATUS.COMPLETED,
        submittedByPim: true,
        requireUkefApproval: true,
        bankDecision: {
          decision: AMENDMENT_BANK_DECISION.WITHDRAW,
          submitted: true,
        },
        ukefDecision: {
          value: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
          coverEndDate: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
        },
      },
      {
        type: AMENDMENT_TYPES.TFM,
        changeCoverEndDate: true,
        changeFacilityValue: true,
        status: TFM_AMENDMENT_STATUS.COMPLETED,
        submittedByPim: true,
        requireUkefApproval: true,
        bankDecision: {
          decision: AMENDMENT_BANK_DECISION.WITHDRAW,
          submitted: true,
        },
        ukefDecision: {
          value: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
          coverEndDate: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
        },
      },
      {
        type: AMENDMENT_TYPES.TFM,
        changeCoverEndDate: true,
        changeFacilityValue: true,
        status: TFM_AMENDMENT_STATUS.COMPLETED,
        submittedByPim: true,
        requireUkefApproval: true,
        bankDecision: {
          decision: AMENDMENT_BANK_DECISION.PROCEED,
          submitted: true,
        },
        ukefDecision: {
          value: UNDERWRITER_MANAGER_DECISIONS.DECLINED,
          coverEndDate: UNDERWRITER_MANAGER_DECISIONS.DECLINED,
        },
      },
      {
        type: AMENDMENT_TYPES.TFM,
        changeFacilityValue: true,
        status: TFM_AMENDMENT_STATUS.COMPLETED,
        submittedByPim: true,
        requireUkefApproval: true,
        bankDecision: {
          decision: AMENDMENT_BANK_DECISION.PROCEED,
          submitted: true,
        },
        ukefDecision: {
          value: UNDERWRITER_MANAGER_DECISIONS.DECLINED,
        },
      },
      {
        type: AMENDMENT_TYPES.TFM,
        changeCoverEndDate: true,
        status: TFM_AMENDMENT_STATUS.COMPLETED,
        submittedByPim: true,
        requireUkefApproval: true,
        bankDecision: {
          decision: AMENDMENT_BANK_DECISION.PROCEED,
          submitted: true,
        },
        ukefDecision: {
          coverEndDate: UNDERWRITER_MANAGER_DECISIONS.DECLINED,
        },
      },
    ];

    describe('TFM amendment', () => {
      it.each(manualTfmAmendments)('should return false when the amendment object is %o', (amendment) => {
        // Arrange
        const mockAmendment = {
          ...amendment,
        } as TfmFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeFalsy();
      });

      const manualTfmAmendmentsApproved = [
        {
          type: AMENDMENT_TYPES.TFM,
          changeCoverEndDate: true,
          changeFacilityValue: true,
          status: TFM_AMENDMENT_STATUS.COMPLETED,
          submittedByPim: true,
          requireUkefApproval: true,
          bankDecision: {
            decision: AMENDMENT_BANK_DECISION.PROCEED,
            submitted: true,
          },
          ukefDecision: {
            value: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
            coverEndDate: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
          },
        },
        {
          type: AMENDMENT_TYPES.TFM,
          changeCoverEndDate: false,
          changeFacilityValue: true,
          status: TFM_AMENDMENT_STATUS.COMPLETED,
          submittedByPim: true,
          requireUkefApproval: true,
          bankDecision: {
            decision: AMENDMENT_BANK_DECISION.PROCEED,
            submitted: true,
          },
          ukefDecision: {
            value: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
            coverEndDate: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
          },
        },
        {
          type: AMENDMENT_TYPES.TFM,
          changeCoverEndDate: true,
          changeFacilityValue: true,
          status: TFM_AMENDMENT_STATUS.COMPLETED,
          submittedByPim: true,
          requireUkefApproval: true,
          bankDecision: {
            decision: AMENDMENT_BANK_DECISION.PROCEED,
            submitted: true,
          },
          ukefDecision: {
            value: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
            coverEndDate: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
          },
        },
      ];

      it.each(manualTfmAmendmentsApproved)('should return true when the amendment object is %o', (amendment) => {
        // Arrange
        const mockAmendment = {
          ...amendment,
        } as TfmFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeTruthy();
      });
    });
  });
});
