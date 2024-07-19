import { faker } from '@faker-js/faker';
import { CURRENCY, Currency } from '@ukef/dtfs2-common';

export const getRandomCurrency = (): Currency => faker.helpers.arrayElement(Object.values(CURRENCY));
