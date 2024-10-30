const { ApiError } = require('@ukef/dtfs2-common');

const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { cloneDealToLatestVersion } = require('../services/clone-deal.service');
const { cloneFacilities } = require('../services/clone-facilities.service');
const { validateApplicationReferences } = require('./validation/application');

exports.clone = async (req, res) => {
  const {
    body: { dealId: existingDealId, bankInternalRefName, additionalRefName, userId, bank },
  } = req;

  try {
    const validateErrs = validateApplicationReferences(req.body);

    if (validateErrs) {
      return res.status(422).send(validateErrs);
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
    console.error('Failed to clone deal, %o', error);

    if (error instanceof ApiError) {
      return res.status(error.status).send(error.message);
    }

    return res.status(500).send('Failed to clone deal');
  }
};
