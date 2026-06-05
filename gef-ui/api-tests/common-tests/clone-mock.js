/**
 * Returns a deep clone of the supplied mock value so tests do not share
 * mutable references. Use when a mock object is passed to a route/controller
 * that may mutate it directly or indirectly.
 */
const cloneMock = (value) => JSON.parse(JSON.stringify(value));

module.exports = { cloneMock };
