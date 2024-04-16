import { ObjectId } from 'mongodb';
import {
  generateAuditDatabaseRecordFromAuditDetails,
  generateNoUserLoggedInAuditDatabaseRecord,
  generatePortalUserAuditDatabaseRecord,
  generateSystemAuditDatabaseRecord,
  generateTfmUserAuditDatabaseRecord,
} from './generate-audit-database-record';

describe('generate audit details', () => {
  const defaultAuditDatabaseRecord = {
    lastUpdatedAt: new Date(1712574419579),
    lastUpdatedByPortalUserId: null,
    lastUpdatedByTfmUserId: null,
    lastUpdatedByIsSystem: null,
    noUserLoggedIn: null,
  };

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(defaultAuditDatabaseRecord.lastUpdatedAt);
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
      const auditRecord = generateAuditDatabaseRecordFromAuditDetails({ userType: 'tfm', id: '1234567890abcdef12345678' });

      expect(auditRecord).toEqual({
        ...defaultAuditDatabaseRecord,
        lastUpdatedByTfmUserId: new ObjectId('1234567890abcdef12345678'),
      });
    });

    it('returns the correct audit details for a portal user', () => {
      const auditRecord = generateAuditDatabaseRecordFromAuditDetails({ userType: 'portal', id: '1234567890abcdef12345678' });

      expect(auditRecord).toEqual({
        ...defaultAuditDatabaseRecord,
        lastUpdatedByPortalUserId: new ObjectId('1234567890abcdef12345678'),
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
