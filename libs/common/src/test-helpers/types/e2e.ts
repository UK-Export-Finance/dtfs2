import { AnyObject } from '../../types';

export type DealOverrides = {
  details?: { submissionDate?: string; [key: string]: unknown };
  mockFacilities?: { [key: string]: unknown }[];
  bank?: AnyObject;
  submissionDetails?: AnyObject;
  [key: string]: unknown;
};
