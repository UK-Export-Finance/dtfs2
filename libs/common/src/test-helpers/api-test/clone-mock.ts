/**
 * Returns a deep clone of the supplied mock value so tests do not share
 * mutable references. Use when a mock object is passed to a route/controller
 * that may mutate it directly or indirectly.
 *
 * Uses `structuredClone`, which round-trips `Date`, `Map`, `Set`, typed arrays
 * and `undefined` correctly (unlike `JSON.parse(JSON.stringify(value))`). It
 * cannot clone functions, class instances with private fields or DOM nodes —
 * for those, provide a purpose-built factory instead.
 */
export const cloneMock = <T>(value: T): T => structuredClone(value);
