const api = require('../../api');

const { PRODUCT, STATUS } = require('../../constants');

const {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
} = require('../../helpers');

const PAGESIZE = 20;
const primaryNav = 'home';

exports.bssFacilities = async (req, res) => {
  const tab = 'bssFacilities';
  const { userToken } = requestParams(req);
  const { user } = req.session;
  const facilityFilters = [];

  if (user.roles.every((role) => role === 'checker')) facilityFilters.push({ field: 'status', value: STATUS.READY_FOR_APPROVAL, operator: 'eq' });

  const filters = [...facilityFilters];

  const { transactions, count } = await getApiData(api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken), res);

  const facilities = transactions.map((facility) => ({
    _id: facility.transaction_id,
    dealId: facility.deal_id,
    bankId: facility.bankFacilityId || 'Not entered',
    ukefId: facility.ukefFacilityId,
    product: PRODUCT.BSS_EWCS,
    facilityType: facility.transactionType,
    noticeType: facility.deal_submissionType,
    value: {
      amount: facility.value,
      currency: facility.currency && facility.currency.id,
    },
    bankStage: facility.transactionStage,
    ukefStage: '-', // TODO: DTFS2-4518 when UKEF guarantee stage is ready it needs adding here
    date: facility.issuedDate,
    url: `/contract/${facility.deal_id}/${facility.transactionType.toLowerCase()}/${facility.transaction_id}/${facility.transactionType.toLowerCase() === 'bond' ? 'details' : 'guarantee-details'}`,
  }));

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('dashboard/facilities.njk', {
    facilities,
    pages,
    successMessage: getFlashSuccessMessage(req),
    primaryNav,
    tab,
    user: req.session.user,
  });
};

exports.gefFacilities = async (req, res) => {
  const tab = 'gefFacilities';
  const { userToken } = requestParams(req);
  const { user } = req.session;
  const facilityFilters = [];

  if (user.roles.every((role) => role === 'checker')) facilityFilters.push({ field: 'deal.status', value: STATUS.READY_FOR_APPROVAL, operator: 'eq' });

  const filters = [...facilityFilters];

  const { count, facilities: rawFacilities } = await getApiData(api.gefFacilities(req.params.page * PAGESIZE, PAGESIZE, filters, userToken), res);

  const facilities = rawFacilities.map((facility) => ({
    _id: facility._id,
    dealId: facility.dealId,
    bankId: facility.name || 'Not entered',
    ukefId: facility.ukefFacilityId,
    product: PRODUCT.GEF,
    facilityType: facility.type,
    noticeType: facility.deal.submissionType,
    value: {
      amount: facility.value || 0,
      currency: facility.currency.id || '',
    },
    bankStage: facility.hasBeenIssued ? 'Issued' : 'Unissued',
    ukefStage: '-', // TODO: DTFS2-4518 when UKEF guarantee stage is ready it needs adding here
    date: facility.submittedAsIssuedDate,
    url: `/gef/application-details/${facility.dealId}/facilities/${facility._id}/`,
  }));

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('dashboard/facilities.njk', {
    facilities,
    pages,
    successMessage: getFlashSuccessMessage(req),
    primaryNav,
    tab,
    user: req.session.user,
  });
};
