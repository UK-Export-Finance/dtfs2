import { ObjectId } from 'mongodb';
import {
  generateNoUserLoggedInAuditDetails,
  generatePortalUserAuditDetails,
  generateSystemAuditDetails,
  generateTfmUserAuditDetails,
} from './generateAuditDetails';

describe('generate audit details', () => {
  const defaultAuditDetails = {
    lastUpdatedAt: new Date(1712574419579),
    lastUpdatedByPortalUserId: null,
    lastUpdatedByTfmUserId: null,
    lastUpdatedByIsSystem: null,
    noUserLoggedIn: null,
  };

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(defaultAuditDetails.lastUpdatedAt);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('generatePortalUserAuditDetails', () => {
    it('handles string input', () => {
      const auditDetails = generatePortalUserAuditDetails('1234567890abcdef12345678');

      expect(auditDetails).toEqual({
        ...defaultAuditDetails,
        lastUpdatedByPortalUserId: new ObjectId('1234567890abcdef12345678'),
      });
    });

    it('handles ObjectId input', () => {
      const auditDetails = generatePortalUserAuditDetails(new ObjectId('1234567890abcdef12345678'));

      expect(auditDetails).toEqual({
        ...defaultAuditDetails,
        lastUpdatedByPortalUserId: new ObjectId('1234567890abcdef12345678'),
      });
    });
  });

  describe('generateTfmUserAuditDetails', () => {
    it('handles string input', () => {
      const auditDetails = generateTfmUserAuditDetails('1234567890abcdef12345678');

      expect(auditDetails).toEqual({
        ...defaultAuditDetails,
        lastUpdatedByTfmUserId: new ObjectId('1234567890abcdef12345678'),
      });
    });

    it('handles ObjectId input', () => {
      const auditDetails = generateTfmUserAuditDetails(new ObjectId('1234567890abcdef12345678'));

      expect(auditDetails).toEqual({
        ...defaultAuditDetails,
        lastUpdatedByTfmUserId: new ObjectId('1234567890abcdef12345678'),
      });
    });
  });

  describe('generateSystemUserAuditDetails', () => {
    it('returns the correct object', () => {
      const auditDetails = generateSystemAuditDetails();

      expect(auditDetails).toEqual({
        ...defaultAuditDetails,
        lastUpdatedByIsSystem: true,
      });
    });
  });

  describe('generateNoUserLoggedInAuditDetails', () => {
    it('returns the correct object', () => {
      const auditDetails = generateNoUserLoggedInAuditDetails();

      expect(auditDetails).toEqual({
        ...defaultAuditDetails,
        noUserLoggedIn: true,
      });
    });
  });
});
