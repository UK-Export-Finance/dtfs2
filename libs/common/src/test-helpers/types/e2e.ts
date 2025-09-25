import { AnyObject } from '../../types';

export type DealOverrides = {
  details?: { submissionDate?: string; [key: string]: unknown };
  mockFacilities?: AnyObject[];
  bank?: AnyObject;
  submissionDetails?: AnyObject;
  [key: string]: unknown;
};
