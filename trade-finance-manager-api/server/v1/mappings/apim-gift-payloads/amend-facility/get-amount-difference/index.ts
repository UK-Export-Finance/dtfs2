/**
 * Calculates the absolute difference between two amounts.
 * @param previousAmount - The previous amount.
 * @param newAmount - The new amount.
 * @returns The absolute difference between the previous and new amounts.
 */
export const getAmountDifference = (previousAmount: number, newAmount: number): number => Math.abs(previousAmount - newAmount);
