const { getUnixTime } = require('date-fns');
const CONSTANTS = require('../constants');
const api = require('../api-dtfs-cental-api');

let deal;
let record;
let acbsResponse;
let dealId;

const labelCase = (label) => label.charAt(0).toUpperCase() + label.substring(1).toLowerCase();

const getTimestamp = () => getUnixTime(new Date(acbsResponse.headers.date));

const getAuthor = () => {
  if (record === 'deal') {
    return {
      firstName: deal.dealSnapshot.bank.name,
      lastName: '',
      _id: deal.dealSnapshot.bank.id,
    };
  }
  return {
    firstName: '',
    lastName: '',
    _id: '',
  };
};

const getLabel = () => {
  const dealType = deal.dealSnapshot.details
    ? labelCase(deal.dealSnapshot.details.submissionType)
    : labelCase(deal.dealSnapshot.submissionType);

  if (record === 'deal') {
    return `${dealType} submitted`;
  }
  if (record === 'facility') {
    return 'Facility submitted to ACBS';
  }
  return '';
};

const getComments = (role) => {
  if (deal.dealSnapshot.dealType === CONSTANTS.PRODUCT.TYPE.BSS) {
    const comments = deal.dealSnapshot.comments.filter((comment) => comment.user.roles.includes(role));
    if (comments.length > 0) {
      return comments[0].text;
    }
  }

  if (deal.dealSnapshot.dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    const comments = deal.dealSnapshot.comments.filter((comment) => comment.role === role);
    if (comments.length > 0) {
      return comments[0].comment;
    }
  }
  return '';
};

const getDescription = () => {
  if (record === 'deal') {
    return getComments(CONSTANTS.ACTIVITY.ROLE.CHECKER);
  }
  return '';
};

const getObject = async () => {
  let object = {};
  try {
    object = await api.getDeal(dealId).then((data) => {
      if (data && data._id) {
        deal = data;
        return {
          type: CONSTANTS.ACTIVITY.TYPE.ACTIVITY,
          timestamp: getTimestamp(),
          author: getAuthor(),
          text: getDescription(),
          label: getLabel(),
        };
      }
      return {};
    });
  } catch (error) {
    console.error('Error creating activity object.', { error });
  }
  return object;
};

const create = (id, response, type) => {
  if (id && response && type) {
    dealId = id;
    acbsResponse = response;
    record = type;
    getObject().then((result) => {
      api.createActivity(dealId, result);
    });
  }
};

module.exports = {
  create,
};
