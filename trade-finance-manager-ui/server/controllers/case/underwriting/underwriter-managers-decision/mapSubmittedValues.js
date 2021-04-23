import stringHelpers from '../../../../helpers/string';

const { hasValue } = stringHelpers;

const mapSubmittedValues = (submittedValues) => {
  const {
    decision,
    approveWithConditionsComments,
    declineComments,
    internalComments,
  } = submittedValues;

  const mapped = {
    decision,
    internalComments,
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


export default mapSubmittedValues;
