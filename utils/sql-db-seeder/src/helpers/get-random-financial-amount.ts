import { faker } from '@faker-js/faker';

export const getRandomFinancialAmount = ({ min, max }: { min: number; max: number }): number => Number(faker.finance.amount({ min, max }));
