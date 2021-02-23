import api from '../../api';

import FACILITY_TYPE from '../../constants/facilities';

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
  const facilityId = req.params._id;// eslint-disable-line no-underscore-dangle
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
      deal,
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

  const bonds = deal.facilities.filter(({ facilityProduct }) => facilityProduct.code === FACILITY_TYPE.BSS);

  return res.render('case/parties/edit/bond-issuers-edit.njk', {
    deal,
    dealId,
    bonds,
  });
};


export default {
  getCaseDeal,
  getCaseFacility,
  getCaseParties,
  getPartyDetails,
  getBondIssuerPartyDetails,
};
