export type KeyingSheetAdjustmentChange = 'INCREASE' | 'DECREASE' | 'NONE';

export type KeyingSheetAdjustment = {
  amount: number;
  change: KeyingSheetAdjustmentChange;
};
