import api from '../../api';

// NOTE
// the relationship between deal & case is currently unknown,
// and therefore how this will be managed/stored/referenced.
// This approach is purely for initial development.

const getCaseDeal = async (req, res) => {
  const dealId = req.params._id;// eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/deal/deal.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    active_sheet: 'deal',
    dealId,
  });
};

const getCaseFacility = async (req, res) => {
  const { facilityId } = req.params;
  const facility = await api.getFacility(facilityId);

  if (!facility) {
    return res.redirect('/not-found');
  }

  return res.render('case/facility/facility.njk', {
    facility,
    active_sheet: 'facility',
    facilityId,

    // TODO: remove once we have user login/session.
    user: {
      timezone: 'Europe/London',
    },
  });
};

const getCaseParties = async (req, res) => {
  const dealId = req.params._id;// eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/parties/parties.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    active_sheet: 'parties',
    dealId,
  });
};

const getPartyDetails = (partyType) => (
  async (req, res) => {
    const dealId = req.params._id;// eslint-disable-line no-underscore-dangle
    const deal = await api.getDeal(dealId);

    if (!deal) {
      return res.redirect('/not-found');
    }

    return res.render(`case/parties/edit/${partyType}-edit.njk`, {
      deal: deal.dealSnapshot,
      tfm: deal.tfm,
      dealId,
    });
  }
);

const getBondIssuerPartyDetails = async (req, res) => {
  const dealId = req.params._id;// eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/parties/edit/bonds-edit.njk', {
    bondType: 'bond issuer',
    deal: deal.dealSnapshot,
  });
};


const getBondBeneficiaryrPartyDetails = async (req, res) => {
  const dealId = req.params._id;// eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/parties/edit/bonds-edit.njk', {
    bondType: 'bond beneficiary',
    deal: deal.dealSnapshot,
  });
};

const postPartyDetails = (partyType) => (
  async (req, res) => {
    const dealId = req.params._id;// eslint-disable-line no-underscore-dangle

    const update = {
      [partyType]: req.body,
    };

    await api.updateParty(dealId, update);

    return res.redirect(`/case/parties/${dealId}`);
  }
);

const postTfmFacility = async (req, res) => {
  const { facilityId, ...facilityUpdateFields } = req.body;
  const dealId = req.params._id;// eslint-disable-line no-underscore-dangle


  await Promise.all(
    facilityId.map((id, index) => {
      const facilityUpdate = {};
      Object.entries(facilityUpdateFields).forEach(([fieldName, values]) => {
        facilityUpdate[fieldName] = values[index];
      });
      return api.updateFacility(id, facilityUpdate);
    }),
  );


  // const { data } = await api.updateParty(dealId, update);

  return res.redirect(`/case/parties/${dealId}`);
};


export default {
  getCaseDeal,
  getCaseFacility,
  getCaseParties,
  getPartyDetails,
  getBondIssuerPartyDetails,
  getBondBeneficiaryrPartyDetails,
  postPartyDetails,
  postTfmFacility,
};
