/**
 * This type is intended to represent any generic javascript
 * object. This type is distinct from the `object` type.
 *
 * Many types in DTFS (specifically db models stored in the
 * Mongo database) are not fully documented. Typically, the
 * only thing we know for sure about these types is that they
 * will be javascript objects. We normally use the `object`
 * type in such cases, but the `object` type actually means
 * "any type which is not `unknown` or `undefined`", which
 * does not actually capture what we are intending to. The
 * below type overcomes this issue, providing an alias that
 * can be used in such cases where we know that the type
 * will be "any 'javascript' object".
 *
 * @example
 * const foo: object = { value: 100 };
 * foo['value']; // Property 'value' does not exist on type '{}'
 *
 * const bar: AnyObject = { value: 100 };
 * bar['value']; // works as expected, type = unknown
 * bar.value; // even this is now fine, type = unknown
 */
export type AnyObject = Record<string, unknown>;
