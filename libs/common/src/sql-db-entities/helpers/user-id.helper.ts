// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AuditableBaseEntity } from '../base-entities';

type UserId = string;
export type DbAuditUpdatedByUserId = `PORTAL-${UserId}` | `TFM-${UserId}` | 'SYSTEM';

type RequestSource = { platform: 'PORTAL' | 'TFM'; userId: UserId } | { platform: 'SYSTEM' };

export type DbRequestSourceParam = {
  requestSource: RequestSource;
};

/**
 * Constructs the string value to be used on the `updatedByUserId` property of
 * the {@link AuditableBaseEntity}, based on the source of the request.
 *
 * If the source platform of the request is not `'SYSTEM'` (e.g. from a scheduled
 * job), then a `userId` must also be provided.
 *
 * @example
 * // returns 'PORTAL-abc123'
 * this.updatedByUserId = getDbAuditUpdatedByUserId({ platform: 'PORTAL', userId: 'abc123' });
 *
 * // returns 'TFM-123abc'
 * this.updatedByUserId = getDbAuditUpdatedByUserId({ platform: 'TFM', userId: '123abc' });
 *
 * // returns 'SYSTEM'
 * this.updatedByUserId = getDbAuditUpdatedByUserId({ platform: 'SYSTEM' });
 */
export const getDbAuditUpdatedByUserId = (requestSource: RequestSource): DbAuditUpdatedByUserId =>
  requestSource.platform === 'SYSTEM' ? requestSource.platform : `${requestSource.platform}-${requestSource.userId}`;
