import { generatePortalAuditDetails, generateSystemAuditDetails, generateTfmAuditDetails } from './generate-audit-details';

describe('generateSystemAuditDetails', () => {
  it('generates the correct object', () => {
    const auditDetails = generateSystemAuditDetails();

    expect(auditDetails).toEqual({
      userType: 'system',
    });
  });
});

describe('generatePortalAuditDetails', () => {
  it('generates the correct object', () => {
    const auditDetails = generatePortalAuditDetails('1234567890abcdef12345678');

    expect(auditDetails).toEqual({
      userType: 'portal',
      id: '1234567890abcdef12345678',
    });
  });
});

describe('generateSystemAuditDetails', () => {
  it('generates the correct object', () => {
    const auditDetails = generateTfmAuditDetails('1234567890abcdef12345678');

    expect(auditDetails).toEqual({
      userType: 'tfm',
      id: '1234567890abcdef12345678',
    });
  });
});
