import { AmendmentsEligibilityCriterion, AmendmentsEligibilityCriterionWithAnswer } from '@ukef/dtfs2-common';
import { ValidationError } from '../../../types/validation-error.ts';
import { ErrorsOrValue } from '../../../types/errors-or-value.ts';

type criterionWithValidAnswer = AmendmentsEligibilityCriterion & {
  answer: boolean;
};

/**
 * Validates the eligibility response
 * @param parsedResponse - the parsed response
 * @returns the value or errors depending on the validation result
 */
export const validateEligibilityResponse = (parsedResponse: AmendmentsEligibilityCriterionWithAnswer[]): ErrorsOrValue<criterionWithValidAnswer[]> => {
  const errors: ValidationError[] = [];

  parsedResponse.forEach((item: AmendmentsEligibilityCriterionWithAnswer) => {
    const { id, text, answer } = item;

    if (answer === null) {
      errors.push({
        errRef: id.toString(),
        errMsg: `Select if ${text.charAt(0).toLowerCase() + text.slice(1)}`,
      });
    }
  });

  return errors.length ? { errors } : { value: parsedResponse as criterionWithValidAnswer[] };
};
