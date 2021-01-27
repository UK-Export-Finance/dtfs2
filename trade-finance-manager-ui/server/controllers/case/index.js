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
    deal,
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
  });
};

const getCaseParties = async (req, res) => {
  const dealId = req.params._id;// eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/parties/parties.njk', {
    deal,
    active_sheet: 'parties',
    dealId,
  });
};

export default {
  getCaseDeal,
  getCaseFacility,
  getCaseParties,
};
