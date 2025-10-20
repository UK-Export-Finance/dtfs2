import { AMENDMENT_TYPES, PORTAL_AMENDMENT_STATUS } from '../constants';
import { canSendToAcbs } from './can-submit-to-acbs';
import { TfmFacilityAmendmentWithUkefId } from '../types';

describe('canSendToAcbs', () => {
  describe('Automatic amendment', () => {
    describe('Portal amendment', () => {
      it('should return false when the amendment has not been amended with cover end date', () => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.PORTAL,
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
          type: AMENDMENT_TYPES.PORTAL,
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
          type: AMENDMENT_TYPES.PORTAL,
          changeCoverEndDate: false,
          changeFacilityValue: false,
        } as TfmFacilityAmendmentWithUkefId;

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
        } as TfmFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeFalsy();
      });

      const noUsers = [{}, null, undefined, [], { name: 'test' }, { email: '' }, { name: 'test', email: '' }, { username: '', name: '', email: '' }];

      it.each(noUsers)('should return false when the amendment has no user', (createdBy) => {
        // Arrange
        const mockAmendment = {
          type: AMENDMENT_TYPES.PORTAL,
          changeCoverEndDate: true,
          changeFacilityValue: true,
          status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
          createdBy,
        } as TfmFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeFalsy();
      });

      it('should return true when the amendment has been amended, has been sent to UKEF and has a user', () => {
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
        } as TfmFacilityAmendmentWithUkefId;

        // Act
        const response = canSendToAcbs(mockAmendment);

        // Assert
        expect(response).toBeTruthy();
      });
    });

    describe('TFM amendment', () => {});
  });

  describe('Manual amendment', () => {
    describe('TFM amendment', () => {});
  });
});
