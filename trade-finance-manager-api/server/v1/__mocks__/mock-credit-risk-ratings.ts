import { CreditRiskRating } from '../api-response-types';

export const MOCK_CREDIT_RISK_RATINGS: CreditRiskRating[] = [
  {
    id: 1,
    name: 1,
    description: 'AAA',
    createdAt: '2026-01-14T14:15:00.943Z',
    updatedAt: '2026-01-14T14:15:00.943Z',
    effectiveFrom: '2026-01-14T14:15:00.943Z',
    effectiveTo: '9999-12-31T00:00:00.000Z',
  },
  {
    id: 2,
    name: 2,
    description: 'AA+',
    createdAt: '2026-01-14T14:15:00.943Z',
    updatedAt: '2026-01-14T14:15:00.943Z',
    effectiveFrom: '2026-01-14T14:15:00.943Z',
    effectiveTo: '9999-12-31T00:00:00.000Z',
  },
];

export const MOCK_CREDIT_RISK_RATINGS_DESCRIPTIONS: string[] = MOCK_CREDIT_RISK_RATINGS.map((rating) => rating.description);
