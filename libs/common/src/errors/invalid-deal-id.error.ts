export class InvalidDealIdError extends Error {
  constructor(dealId?: string) {
    const message = dealId ? `Invalid deal ID: ${dealId}` : 'Invalid deal ID';
    super(message);

    this.name = 'InvalidDealIdError';
  }
}
