import { GEF_CRITERION } from '../types';
import { stripHtml } from './strip-html';

/**
 * Generates a formatted string of mandatory criteria for GovNotify email template based on the provided criteria array.
 *
 * @param {Array<GEF_CRITERION>} criteria - An array of criteria objects, each containing an `id`, `body`, and optionally a `childList`.
 * @param {boolean} [html=false] - A flag indicating whether the content should include HTML or be stripped of HTML tags.
 * @returns {string} A formatted string of mandatory criteria, including sub-items if present.
 *                   If no criteria are provided, an empty string is returned.
 *
 * Each criterion is formatted as:
 * - `<id> <content>` followed by sub-items (if any) prefixed with `*`.
 * - Ends with `^True` if there are any criteria.
 *
 * Example output:
 * ```
 * 1 Criterion content
 *
 * *Sub-item content
 *
 * ^True
 * ```
 */
export const generateMandatoryCriteria = (criteria: Array<GEF_CRITERION>, html = false): string => {
  if (criteria?.length) {
    let mandatoryCriteria = '';

    criteria.forEach((criterion) => {
      if (criterion.id && criterion.body) {
        const { id, body, childList } = criterion;

        const number = id.toString().replaceAll('.', '');
        const content = html ? body : stripHtml(body);

        mandatoryCriteria += `${number} ${content}\n\n`;

        if (childList?.length) {
          childList.forEach((item) => {
            const subContent = html ? item : stripHtml(item);
            mandatoryCriteria += `*${subContent}\n\n`;
          });
        }
      }
    });

    if (mandatoryCriteria !== '') {
      // Below adds True as a text to GovNotify after all criteria
      mandatoryCriteria += '^True\n\n';
    }

    return mandatoryCriteria;
  }

  return '';
};
