const { HttpStatusCode } = require('axios');
const { MONGO_DB_COLLECTIONS, format } = require('@ukef/dtfs2-common');
const { mongoDbClient: db } = require('../../../../drivers/db-client');

/**
 * Retrieves the latest published GEF mandatory criteria from the database.
 * Responds with the formatted criteria if found, otherwise returns a 404 status.
 *
 * @async
 * @function getLatestGefMandatoryCriteria
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends the latest mandatory criteria or a not found message.
 */
const getLatestGefMandatoryCriteria = async (req, res) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.GEF_MANDATORY_CRITERIA_VERSIONED);
  const [criteria] = await collection
    .find({ isInDraft: { $eq: false } })
    .sort({ version: -1 })
    .limit(1)
    .toArray();

  if (criteria) {
    const formatted = format(criteria);
    return res.status(HttpStatusCode.Ok).send(formatted);
  }

  return res.status(HttpStatusCode.NotFound).send({ status: HttpStatusCode.NotFound, message: 'No mandatory criteria found' });
};

/**
 * Retrieves GEF mandatory criteria by version from the database.
 *
 * @async
 * @function getGefMandatoryCriteriaByVersion
 * @param {import('express').Request} req - Express request object, expects `version` param.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends the formatted criteria if found, otherwise sends an error response.
 */
const getGefMandatoryCriteriaByVersion = async (req, res) => {
  const { version } = req.params;

  if (typeof version !== 'string' || Number.isNaN(version)) {
    return res.status(HttpStatusCode.BadGateway).send({ status: HttpStatusCode.BadGateway, message: 'Invalid Version' });
  }

  const versionAsNumber = Number(version);

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.GEF_MANDATORY_CRITERIA_VERSIONED);
  const criteria = await collection.findOne({ version: { $eq: versionAsNumber } });

  if (criteria) {
    const formatted = format(criteria);
    return res.status(HttpStatusCode.Ok).send(formatted);
  }

  return res.status(HttpStatusCode.NotFound).send({ status: HttpStatusCode.NotFound, message: 'No mandatory criteria found' });
};

module.exports = {
  getLatestGefMandatoryCriteria,
  getGefMandatoryCriteriaByVersion,
};
