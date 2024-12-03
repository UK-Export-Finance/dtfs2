/**
 * Gets the alias selector from a specified alias name.
 *
 * This helper function exists to extract the alias selector
 * from a specific alias name. This logic has been abstracted
 * to this function to avoid having to repeat `@${aliasName}`
 * everywhere that an alias is used.
 *
 * For specific details around cypress aliases, read
 * here:
 * {@link https://docs.cypress.io/guides/core-concepts/variables-and-aliases#Aliases}
 *
 * @example
 * // Banks are stored in the 'banks' alias in a 'before' hook
 * before(() => {
 *   cy.task('getAllBanks').then((banks) => {
 *     cy.wrap(banks).as('banks');
 *   });
 * });
 *
 * // Banks are queried in a test and used
 * it('...', () => {
 *   cy.get(aliasSelector('banks')).then((banks) => {
 *     // do something with banks
 *   });
 * });
 *
 * @param {string} aliasName - The alias name
 * @returns {string} The selector for the alias
 */
export const aliasSelector = (aliasName) => `@${aliasName}`;
