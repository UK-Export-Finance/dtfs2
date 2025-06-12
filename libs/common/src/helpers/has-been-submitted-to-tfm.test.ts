import { ObjectId } from 'mongodb';
import { hasBeenSubmittedToTfm } from './has-been-submitted-to-tfm';
import { Deal } from '../types';
import { DEAL_SUBMISSION_TYPE, DEAL_TYPE } from '../constants';

describe('hasBeenSubmittedToTfm', () => {
  describe('BSS/EWCS', () => {
    it('should return true if the submission count is greater than zero for an AIN', () => {
      // Arrange
      const mockDeal: Deal = {
        _id: new ObjectId('5ce819935e539c343f141ece'),
        submissionType: DEAL_SUBMISSION_TYPE.AIN,
        dealType: DEAL_TYPE.BSS_EWCS,
        details: {
          ukefDealId: '0030113304',
          submissionCount: 1,
        },
      };

      // Act
      const response = hasBeenSubmittedToTfm(mockDeal);

      // Assert
      expect(response).toBe(true);
    });

    it('should return true if the submission count is greater than zero for a MIA', () => {
      // Arrange
      const mockDeal: Deal = {
        _id: new ObjectId('5ce819935e539c343f141ece'),
        submissionType: DEAL_SUBMISSION_TYPE.MIA,
        dealType: DEAL_TYPE.BSS_EWCS,
        details: {
          ukefDealId: '0030113304',
          submissionCount: 1,
        },
      };

      // Act
      const response = hasBeenSubmittedToTfm(mockDeal);

      // Assert
      expect(response).toBe(true);
    });

    it('should return true if the submission count is greater than zero for a MIN', () => {
      // Arrange
      const mockDeal: Deal = {
        _id: new ObjectId('5ce819935e539c343f141ece'),
        submissionType: DEAL_SUBMISSION_TYPE.MIN,
        dealType: DEAL_TYPE.BSS_EWCS,
        details: {
          ukefDealId: '0030113304',
          submissionCount: 2,
        },
      };

      // Act
      const response = hasBeenSubmittedToTfm(mockDeal);

      // Assert
      expect(response).toBe(true);
    });

    it('should return false if the submission count is zero for a AIN', () => {
      // Arrange
      const mockDeal: Deal = {
        _id: new ObjectId('5ce819935e539c343f141ece'),
        submissionType: DEAL_SUBMISSION_TYPE.AIN,
        dealType: DEAL_TYPE.BSS_EWCS,
        details: {
          ukefDealId: '0030113304',
          submissionCount: 0,
        },
      };

      // Act
      const response = hasBeenSubmittedToTfm(mockDeal);

      // Assert
      expect(response).toBe(false);
    });

    it('should return false if the submission count is zero for a MIA', () => {
      // Arrange
      const mockDeal: Deal = {
        _id: new ObjectId('5ce819935e539c343f141ece'),
        submissionType: DEAL_SUBMISSION_TYPE.MIA,
        dealType: DEAL_TYPE.BSS_EWCS,
        details: {
          ukefDealId: '0030113304',
          submissionCount: 0,
        },
      };

      // Act
      const response = hasBeenSubmittedToTfm(mockDeal);

      // Assert
      expect(response).toBe(false);
    });
  });

  describe('GEF', () => {
    it('should return true if the submission count is greater than zero for an AIN', () => {
      // Arrange
      const mockDeal: Deal = {
        _id: new ObjectId('5ce819935e539c343f141ece'),
        submissionType: DEAL_SUBMISSION_TYPE.AIN,
        dealType: DEAL_TYPE.GEF,
        ukefDealId: '0030113304',
        submissionCount: 1,
        eligibility: {},
        exporter: {},
        portalActivities: [],
      };

      // Act
      const response = hasBeenSubmittedToTfm(mockDeal);

      // Assert
      expect(response).toBe(true);
    });

    it('should return true if the submission count is greater than zero for a MIA', () => {
      // Arrange
      const mockDeal: Deal = {
        _id: new ObjectId('5ce819935e539c343f141ece'),
        submissionType: DEAL_SUBMISSION_TYPE.MIA,
        dealType: DEAL_TYPE.GEF,
        ukefDealId: '0030113304',
        submissionCount: 1,
        eligibility: {},
        exporter: {},
        portalActivities: [],
      };

      // Act
      const response = hasBeenSubmittedToTfm(mockDeal);

      // Assert
      expect(response).toBe(true);
    });

    it('should return true if the submission count is greater than zero for a MIN', () => {
      // Arrange
      const mockDeal: Deal = {
        _id: new ObjectId('5ce819935e539c343f141ece'),
        submissionType: DEAL_SUBMISSION_TYPE.MIN,
        dealType: DEAL_TYPE.GEF,
        ukefDealId: '0030113304',
        submissionCount: 2,
        eligibility: {},
        exporter: {},
        portalActivities: [],
      };

      // Act
      const response = hasBeenSubmittedToTfm(mockDeal);

      // Assert
      expect(response).toBe(true);
    });

    it('should return false if the submission count is zero for a AIN', () => {
      // Arrange
      const mockDeal: Deal = {
        _id: new ObjectId('5ce819935e539c343f141ece'),
        submissionType: DEAL_SUBMISSION_TYPE.AIN,
        dealType: DEAL_TYPE.GEF,
        ukefDealId: '0030113304',
        submissionCount: 0,
        eligibility: {},
        exporter: {},
        portalActivities: [],
      };

      // Act
      const response = hasBeenSubmittedToTfm(mockDeal);

      // Assert
      expect(response).toBe(false);
    });

    it('should return false if the submission count is zero for a MIA', () => {
      // Arrange
      const mockDeal: Deal = {
        _id: new ObjectId('5ce819935e539c343f141ece'),
        submissionType: DEAL_SUBMISSION_TYPE.MIA,
        dealType: DEAL_TYPE.GEF,
        ukefDealId: '0030113304',
        submissionCount: 0,
        eligibility: {},
        exporter: {},
        portalActivities: [],
      };

      // Act
      const response = hasBeenSubmittedToTfm(mockDeal);

      // Assert
      expect(response).toBe(false);
    });
  });
});
