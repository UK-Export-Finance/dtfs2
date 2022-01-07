const { getUnixTime } = require('date-fns');
const CONSTANTS = require('../constants');
const api = require('../api-dtfs-cental-api');

let deal;
let record;
let acbsResponse;
let dealId;
let updateRecord;

const labelCase = (label) => label.charAt(0).toUpperCase() + label.substring(1).toLowerCase();

const getTimestamp = () => getUnixTime(acbsResponse.headers ? new Date(acbsResponse.headers.date) : new Date());

const getAuthor = () => {
  const author = {
    firstName: '',
    lastName: '',
    _id: '',
  };

  if (record === 'deal' || record === 'facility') {
    author.firstName = deal.dealSnapshot.bank.name;
    author._id = deal.dealSnapshot.bank.id;
  }

  return author;
};

const getLabel = () => {
  const dealType = deal.dealSnapshot.details
    ? labelCase(deal.dealSnapshot.submissionType)
    : labelCase(deal.dealSnapshot.submissionType);
  const text = updateRecord ? 'updated' : 'submitted';

  if (record === 'deal') {
    return `${dealType} ${text}`;
  }
  if (record === 'facility') {
    return `Facility ${text}`;
  }
  return '';
};

const getComments = (role) => {
  if (deal.dealSnapshot.dealType === CONSTANTS.PRODUCT.TYPE.BSS && deal.dealSnapshot.comments) {
    const comments = deal.dealSnapshot.comments.filter((comment) => comment.user.roles.includes(role));
    if (comments.length > 0) {
      return comments[0].text;
    }
  }

  if (deal.dealSnapshot.dealType === CONSTANTS.PRODUCT.TYPE.GEF && deal.dealSnapshot.comments) {
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
    object = await api.getTfmDeal(dealId).then((data) => {
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

const add = async (id, response, type, update = false) => {
  if (id && response && type) {
    dealId = id;
    acbsResponse = response;
    record = type;
    updateRecord = update;
    getObject().then(async (result) => {
      const tfm = {
        activities: result,
      };
      await api.updateTfmDeal(dealId, tfm);
    });
  }
};

module.exports = {
  add,
};
