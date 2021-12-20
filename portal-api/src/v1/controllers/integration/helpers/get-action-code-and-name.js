const CONSTANTS = require('../../../../constants');

const getActionCodeAndName = (deal, fromStatus = 'Draft') => {
  const atpString = deal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN ? 'non-atp' : 'atp';

  const key = `${fromStatus}::${atpString}`;

  let actionCode = '';

  switch (key.toLowerCase()) {
    case 'draft::non-atp':
      actionCode = '001';
      break;

    case 'draft::atp':
      actionCode = '003';
      break;

    case 'approved::atp':
    case 'approved_conditions::atp':
      actionCode = '010';
      break;

    case 'submission_acknowledged::non-atp':
    case 'confirmation_acknowledged::non-atp':
    case 'confirmation_acknowledged::atp':
      actionCode = '016';
      break;

    default:
  }

  return { actionCode, actionName: CONSTANTS.DEAL.ACTION_NAME[actionCode] };
};

module.exports = getActionCodeAndName;
