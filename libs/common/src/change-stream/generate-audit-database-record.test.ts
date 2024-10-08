import { ObjectId } from 'mongodb';
import {
  generateAuditDatabaseRecordFromAuditDetails,
  generateNoUserLoggedInAuditDatabaseRecord,
  generatePortalUserAuditDatabaseRecord,
  generateSystemAuditDatabaseRecord,
  generateTfmUserAuditDatabaseRecord,
} from './generate-audit-database-record';
import { generatePortalAuditDetails, generateTfmAuditDetails } from './generate-audit-details';

describe('generate audit details', () => {
  const now = new Date(1712574419579);
  const defaultAuditDatabaseRecord = {
    lastUpdatedAt: '2024-04-08T11:06:59.579 +00:00',
    lastUpdatedByPortalUserId: null,
    lastUpdatedByTfmUserId: null,
    lastUpdatedByIsSystem: null,
    noUserLoggedIn: null,
  };

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('generatePortalUserAuditDatabaseRecord', () => {
    it('handles string input', () => {
      const auditRecord = generatePortalUserAuditDatabaseRecord('1234567890abcdef12345678');

      expect(auditRecord).toEqual({
        ...defaultAuditDatabaseRecord,
        lastUpdatedByPortalUserId: new ObjectId('1234567890abcdef12345678'),
      });
    });

    it('handles ObjectId input', () => {
      const auditRecord = generatePortalUserAuditDatabaseRecord(new ObjectId('1234567890abcdef12345678'));

      expect(auditRecord).toEqual({
        ...defaultAuditDatabaseRecord,
        lastUpdatedByPortalUserId: new ObjectId('1234567890abcdef12345678'),
      });
    });
  });

  describe('generateTfmUserAuditDatabaseRecord', () => {
    it('handles string input', () => {
      const auditRecord = generateTfmUserAuditDatabaseRecord('1234567890abcdef12345678');

      expect(auditRecord).toEqual({
        ...defaultAuditDatabaseRecord,
        lastUpdatedByTfmUserId: new ObjectId('1234567890abcdef12345678'),
      });
    });

    it('handles ObjectId input', () => {
      const auditRecord = generateTfmUserAuditDatabaseRecord(new ObjectId('1234567890abcdef12345678'));

      expect(auditRecord).toEqual({
        ...defaultAuditDatabaseRecord,
        lastUpdatedByTfmUserId: new ObjectId('1234567890abcdef12345678'),
      });
    });
  });

  describe('generateSystemUserAuditDatabaseRecord', () => {
    it('returns the correct object', () => {
      const auditRecord = generateSystemAuditDatabaseRecord();

      expect(auditRecord).toEqual({
        ...defaultAuditDatabaseRecord,
        lastUpdatedByIsSystem: true,
      });
    });
  });

  describe('generateNoUserLoggedInAuditDatabaseRecord', () => {
    it('returns the correct object', () => {
      const auditRecord = generateNoUserLoggedInAuditDatabaseRecord();

      expect(auditRecord).toEqual({
        ...defaultAuditDatabaseRecord,
        noUserLoggedIn: true,
      });
    });
  });

  describe('generateAuditDatabaseRecordFromAuditDetails', () => {
    it('returns the correct audit details for a tfm user', () => {
      const anObjectId = new ObjectId();
      const auditDetails = generateTfmAuditDetails(anObjectId);

      const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

      expect(auditRecord).toEqual({
        ...defaultAuditDatabaseRecord,
        lastUpdatedByTfmUserId: anObjectId,
      });
    });

    it('returns the correct audit details for a portal user', () => {
      const anObjectId = new ObjectId();
      const auditDetails = generatePortalAuditDetails(anObjectId);

      const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

      expect(auditRecord).toEqual({
        ...defaultAuditDatabaseRecord,
        lastUpdatedByPortalUserId: anObjectId,
      });
    });

    it('returns the correct audit details for a tfm user', () => {
      const auditRecord = generateAuditDatabaseRecordFromAuditDetails({ userType: 'system' });

      expect(auditRecord).toEqual({
        ...defaultAuditDatabaseRecord,
        lastUpdatedByIsSystem: true,
      });
    });
  });
});
