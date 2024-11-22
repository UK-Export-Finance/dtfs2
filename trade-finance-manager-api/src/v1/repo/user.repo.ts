import {
  AuditDetails,
  CreateTfmUserRequest,
  DocumentNotCreatedError,
  DocumentNotUpdatedError,
  MONGO_DB_COLLECTIONS,
  TfmUser,
  UpdateTfmUserRequest,
} from '@ukef/dtfs2-common';
import { Collection, FindOneAndUpdateOptions, ObjectId, WithoutId } from 'mongodb';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';
import { USER } from '../../constants';
import { getEscapedRegexFromString } from '../helpers/get-escaped-regex-from-string';

type CreateUserParams = {
  user: CreateTfmUserRequest;
  auditDetails: AuditDetails;
};

type UpdateUserByIdParams = { userId: ObjectId; userUpdate: UpdateTfmUserRequest; auditDetails: AuditDetails };
export class UserRepo {
  /**
   * Gets the tfm users collection
   * @returns The tfm users collection
   */
  private static async getCollection(): Promise<Collection<WithoutId<TfmUser>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_USERS);
  }

  /**
   * Finds users by email addresses
   * Will return multiple users if multiple users are found
   * @param emails email addresses to search for
   * @returns any matched TFM users
   */
  public static async findUsersByEmailAddresses(emails: string[]): Promise<TfmUser[]> {
    const collection = await UserRepo.getCollection();

    const emailsRegex = emails.map((email) => getEscapedRegexFromString(email));

    const query = { email: { $in: emailsRegex } };

    return await collection.find(query).toArray();
  }

  /**
   * Create user
   * @param createUserParams
   * @param createUserParams.user
   * @param createUserParams.auditDetails
   * @returns The created user
   * @throws DocumentNotCreatedError if the request is not acknowledged
   */
  public static async createUser({ user, auditDetails }: CreateUserParams): Promise<TfmUser> {
    const collection = await UserRepo.getCollection();

    const userToCreate: WithoutId<TfmUser> = {
      ...user,
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      status: USER.STATUS.ACTIVE, // New users start in an active state
    };

    const result = await collection.insertOne(userToCreate);

    if (!result.acknowledged) {
      throw new DocumentNotCreatedError();
    }

    return { _id: result.insertedId, ...userToCreate };
  }

  /**
   * Update user by ID
   * @param updateUserByIdParams
   * @param updateUserByIdParams.userId
   * @param updateUserByIdParams.userUpdate
   * @param updateUserByIdParams.auditDetails
   * @returns The updated user
   * @throws DocumentNotUpdatedError if the user is not updated
   */
  public static async updateUserById({ userId, userUpdate, auditDetails }: UpdateUserByIdParams) {
    const collection = await UserRepo.getCollection();

    const filter = { _id: { $eq: userId } };
    const update = {
      $set: {
        ...userUpdate,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      },
    };
    const options: FindOneAndUpdateOptions = { returnDocument: 'after' };

    const result = await collection.findOneAndUpdate(filter, update, options);

    if (!result.ok || !result.value) {
      throw new DocumentNotUpdatedError(userId.toString());
    }

    return result.value;
  }
}
