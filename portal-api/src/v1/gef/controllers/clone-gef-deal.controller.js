const { ApiError } = require('@ukef/dtfs2-common');

const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { cloneDealToLatestVersion } = require('../services/clone/clone-deal.service');
const { cloneFacilities } = require('../services/clone/clone-facilities.service');
const { validateApplicationReferences } = require('./validation/application');

exports.clone = async (req, res) => {
  const {
    body: { dealId: existingDealId, bankInternalRefName, additionalRefName, userId, bank },
  } = req;

  try {
    const validationErrors = validateApplicationReferences(req.body);

    if (validationErrors) {
      return res.status(422).send(validationErrors);
    }

    const auditDetails = generatePortalAuditDetails(req.user._id);
    // clone GEF deal
    const response = await cloneDealToLatestVersion({
      dealId: existingDealId,
      bankInternalRefName,
      additionalRefName,
      maker: req.user,
      userId,
      bank,
      auditDetails,
    });

    const { insertedId } = response;
    // clone the corresponding facilities
    await cloneFacilities(existingDealId, insertedId, auditDetails);

    return res.status(200).send({ dealId: insertedId });
  } catch (error) {
    console.error('Failed to clone deal id %s, %o', existingDealId, error);

    if (error instanceof ApiError) {
      return res.status(error.status).send(error.message);
    }

    return res.status(500).send('Failed to clone deal');
  }
};
