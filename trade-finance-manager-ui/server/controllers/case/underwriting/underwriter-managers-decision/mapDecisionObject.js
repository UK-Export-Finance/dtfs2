import stringHelpers from '../../../../helpers/string';
import userHelpers from '../../../../helpers/user';

const { hasValue } = stringHelpers;
const { userFullName } = userHelpers;

const mapDecisionObject = (submittedValues, user) => {
  const {
    decision,
    approveWithConditionsComments,
    declineComments,
    internalComments,
  } = submittedValues;

  const mapped = {
    decision,
    internalComments,
    userFullName: userFullName(user),
  };

  if (decision === 'Approve with conditions'
    && hasValue(approveWithConditionsComments)) {
    mapped.comments = approveWithConditionsComments;
  } else if (decision === 'Decline'
    && hasValue(declineComments)) {
    mapped.comments = declineComments;
  }

  return mapped;
};


export default mapDecisionObject;
