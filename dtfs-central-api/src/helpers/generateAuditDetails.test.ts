import { generatePortalUserAuditDetails, generateTfmUserAuditDetails, generateSystemAuditDetails } from './generateAuditDetails';

describe('generateAuditDetails', () => {
  describe('generatePortalUserAuditDetails', () => {
    it('should return an object with lastUpdatedAt and lastUpdatedByPortalUserId', () => {
      const userId = '1234';
      const result = generatePortalUserAuditDetails(userId);
      expect(result.lastUpdatedAt).toBeDefined();
      expect(result.lastUpdatedByPortalUserId).toEqual(userId);
      expect(result.lastUpdatedByIsSystem).toBeUndefined();
      expect(result.lastUpdatedByTfmUserId).toBeUndefined();
    });
  });
  describe('generateTfmUserAuditDetails', () => {
    it('should return an object with lastUpdatedAt and lastUpdatedByTfmUserId', () => {
      const userId = '1234';
      const result = generateTfmUserAuditDetails(userId);
      expect(result.lastUpdatedAt).toBeDefined();
      expect(result.lastUpdatedByTfmUserId).toEqual(userId);
      expect(result.lastUpdatedByIsSystem).toBeUndefined();
      expect(result.lastUpdatedByPortalUserId).toBeUndefined();
    });
  });
  describe('generateSystemAuditDetails', () => {
    it('should return an object with lastUpdatedAt and lastUpdatedByIsSystem', () => {
      const result = generateSystemAuditDetails();
      expect(result.lastUpdatedAt).toBeDefined();
      expect(result.lastUpdatedByIsSystem).toBeTruthy();
      expect(result.lastUpdatedByTfmUserId).toBeUndefined();
      expect(result.lastUpdatedByPortalUserId).toBeUndefined();
    });
  });
});
