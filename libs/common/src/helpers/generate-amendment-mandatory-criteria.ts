import { AmendmentsEligibilityCriterionWithAnswer } from '../types/mongo-db-models/tfm-facilities';

/**
 * Generates a formatted string of mandatory criteria for GovNotify email template based on the provided criteria array.
 *
 * @param criteria - An array of criteria objects, each containing an `id`, `text`, and optionally an `answer`.
 * @returns A formatted string of mandatory criteria, If no criteria are provided, an empty string is returned.
 *
 * Each criterion is formatted as:
 * - `<text>`.
 * - Ends with `^<answer>` if there are any criteria.
 *
 * Example output:
 * ```
 * Criterion text
 *
 * ^True
 * ```
 */
export const generateAmendmentMandatoryCriteria = (criteria: Array<AmendmentsEligibilityCriterionWithAnswer>): string => {
  if (criteria?.length) {
    let amendmentMandatoryCriteria = '';

    criteria.forEach((criterion) => {
      if (criterion.id && criterion.answer) {
        const { text, answer } = criterion;

        amendmentMandatoryCriteria += `${text}\n\n`;
        amendmentMandatoryCriteria += `^${answer}\n\n`;
      }
    });

    return amendmentMandatoryCriteria;
  }

  return '';
};
