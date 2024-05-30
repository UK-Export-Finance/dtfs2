import { generatePortalAuditDetails, generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';

/**
 * This is mock data & doesn't correspond to an existing user.
 * since mock data loader isn't used in production this should never occur in production data
 */
export const mockDataLoaderPortalAuditDetails = generatePortalAuditDetails('abcdef123456abcdef123456');

/**
 * This is mock data & doesn't correspond to an existing user.
 * since mock data loader isn't used in production this should never occur in production data
 */
export const mockDataLoaderTfmAuditDetails = generateTfmAuditDetails('bad123456789bad123456789');
