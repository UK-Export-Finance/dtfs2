import { DefaultNamingStrategy } from 'typeorm';
import { camelCase } from 'typeorm/util/StringUtils';

/**
 * Capitalises the first letter of a string without changing
 * the casing of the rest of the string.
 * @param name the name to capitalise
 * @returns the name with the first letter capitalised
 */
export const firstLetterCase = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

/**
 * We define our own naming strategy because we are using embedded columns.
 *
 * The DefaultNamingStrategy does not handle embedded columns correctly,
 * removing the casing of the embedded column names.
 *
 * e.g. if we have an embedded property 'fooBar', and the prefix 'bazQux'
 * the default strategy would return 'bazQuxFoobar' instead of 'bazQuxFooBar'.
 *
 * Based on discussion here: @link{https://github.com/typeorm/typeorm/issues/7307}.
 */
export class CustomNamingStrategy extends DefaultNamingStrategy {
  columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    const name = customName || propertyName;

    if (embeddedPrefixes.length) {
      return camelCase([...embeddedPrefixes, name].join(' '));
    }

    return name;
  }
}
