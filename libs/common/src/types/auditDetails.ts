import { ObjectId } from 'mongodb';

/**
 * TFM Endpoints in dtfs-central-api can be called by tfm or portal users and system updates
 * This metadata is attached to requests for use in auditRecord
 */
export type UserInformation =
  | {
      userType: 'tfm' | 'portal';
      id: string | ObjectId;
    }
  | {
      userType: 'system';
    };
