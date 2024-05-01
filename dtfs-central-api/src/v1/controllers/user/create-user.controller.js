const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const db = require('../../../drivers/db-client').default;
const { PAYLOAD } = require('../../../constants');
const { payloadVerification } = require('../../../helpers');

const createUser = async (user) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);

  const response = await collection.insertOne(user);

  const { insertedId } = response;

  return {
    _id: insertedId,
  };
};

exports.createUserPost = async (req, res) => {
  const payload = req.body;

  if (payloadVerification(payload, PAYLOAD.PORTAL.USER)) {
    const user = await createUser(payload);

    return user
      ? res.status(200).send(user)
      : res.status(404).send();
  }

  return res.status(400).send({ status: 400, message: 'Invalid portal user payload' });
};
