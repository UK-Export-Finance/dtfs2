import { format } from 'date-fns';
import { today, longDayFormat, longMonthFormat, longYearFormat } from '../../../../e2e-fixtures/dateConstants';

/**
 * completeDateFormFields
 * Complete day, month and year date fields.
 * For each date field, check that a null value is NOT provided.
 * In some tests, only 1x date fields is changed, for validation testing.
 * Therefore, only enter something into each field if the field is NOT provided as null.
 * @param {string} idPrefix: ID prefix of the date fields
 * @param {string} date: Date. Defaults to today
 * @param {string} day: Optional day string
 * @param {string} month: Optional month string
 * @param {string} year: Optional year string
 */
const completeDateFormFields = ({ idPrefix, date = today, day, month, year }) => {
  if (day !== null) {
    const dayValue = day || format(date, longDayFormat);

    cy.keyboardInput(cy.get(`[data-cy="${idPrefix}-day"]`), dayValue);
  }

  if (month !== null) {
    const monthValue = month || format(date, longMonthFormat);

    cy.keyboardInput(cy.get(`[data-cy="${idPrefix}-month"]`), monthValue);
  }

  if (year !== null) {
    const yearValue = year || format(date, longYearFormat);

    cy.keyboardInput(cy.get(`[data-cy="${idPrefix}-year"]`), yearValue);
  }
};

export default completeDateFormFields;
