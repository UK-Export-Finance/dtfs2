/**
 * calculates the ukef share of the utilisation
 * @param utilisation - provided utilisation value
 * @param coverPercentage - facility cover percentage
 * @returns returns calculated ukef share of utilisation
 */
export const calculateUkefShareOfUtilisation = (utilisation: number, coverPercentage: number): number => utilisation * (coverPercentage / 100);
