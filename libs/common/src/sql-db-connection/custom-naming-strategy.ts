import { DefaultNamingStrategy } from 'typeorm';
import { camelCase } from 'typeorm/util/StringUtils';

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
