import { PORTAL_USER } from '@ukef/dtfs2-common/schemas';
import { isVerifiedPayload } from '@ukef/dtfs2-common/payload-verification';
import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { mongoDbClient as db } from '../../../drivers/db-client';

/**
 * @deprecated Do not use -- Favour Portal API (removal todo:DTFS2-7160)
 */
const createUser = async (user) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);

  const response = await collection.insertOne(user);

  const { insertedId } = response;

  return {
    _id: insertedId,
  };
};

/**
 * @deprecated Do not use -- Favour Portal API (removal todo:DTFS2-7160)
 */
export const createUserPost = async (req, res) => {
  const payload = req.body;

  if (!isVerifiedPayload({ payload, template: PORTAL_USER.CREATE })) {
    return res.status(400).send({ status: 400, message: 'Invalid portal user payload' });
  }

  const user = await createUser(payload);
  return user ? res.status(200).send(user) : res.status(404).send();
};
