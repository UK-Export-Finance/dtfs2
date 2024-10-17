export const shouldDealBeCancelledImmediately = (effectiveFrom: number) => new Date().valueOf() >= effectiveFrom;
