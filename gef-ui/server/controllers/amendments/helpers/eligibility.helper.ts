import { AmendmentsEligibilityCriterionWithAnswer } from '@ukef/dtfs2-common';

export type EligibilityReqBody = {
  [key: string]: string;
};

/**
 * Parses the result of the nunjucks radio boxes ('true' or 'false') as a boolean
 * @param value - the string to parse as a boolean
 * @returns the value as a boolean if it was 'true' or 'false', otherwise null
 */
export const parseStringAsBoolean = (value: string): boolean | null => {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return null;
};

/**
 * The nunjucks file returns the eligibility criteria responses as an object of the form e.g. { '1': 'true', '2': 'false', '3': 'true' }.
 * This function returns the eligibility criteria responses in an array of objects more suitable for database storage: [{ id: 1, text: 'criteria 1 text', answer: true }, { id: 2, .... }, ... ]
 * @param responseBody - the response received from the nunjucks file after user submission
 * @param currentCriteriaResponses - the eligibility criteria existing on the amendment, these may have previous answers attached to them or all have null for the `answer` field
 * @returns eligibility criteria responses in a format to validate and save to the amendment
 */
export const parseEligibilityResponse = (
  responseBody: EligibilityReqBody,
  currentCriteriaResponses: AmendmentsEligibilityCriterionWithAnswer[],
): AmendmentsEligibilityCriterionWithAnswer[] => {
  const criteriaWithNewResponses = currentCriteriaResponses.map((criterion: AmendmentsEligibilityCriterionWithAnswer) => {
    const newAnswer = responseBody[criterion.id.toString()] ? parseStringAsBoolean(responseBody[criterion.id.toString()]) : null;

    return { ...criterion, answer: newAnswer };
  });

  return criteriaWithNewResponses;
};
