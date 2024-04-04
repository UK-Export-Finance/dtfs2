const api = require('../api');
const { generateTfmUserInformation } = require('../helpers/generateUserInformation');
const { canDealBeSubmittedToACBS, submitACBSIfAllPartiesHaveUrn } = require('./deal.controller');

const updateParty = async (req, res) => {
  const { dealId } = req.params;
  const partyUpdate = {
    tfm: {
      parties: req.body,
    },
  };

  try {
    const updatedDeal = await api.updateDeal({ dealId, dealUpdate: partyUpdate, userInformation: generateTfmUserInformation(req.user._id) });

    if (updatedDeal.dealSnapshot) {
      if (canDealBeSubmittedToACBS(updatedDeal.dealSnapshot.submissionType)) {
        await submitACBSIfAllPartiesHaveUrn(dealId);
      }
    }

    return res.status(200).send({
      updateParty: {
        parties: updatedDeal.tfm.parties
      }
    });
  } catch (error) {
    console.error('Unable to update party %o', error);
    return res.status(500).send(error.message);
  }
};

module.exports = {
  updateParty
};
