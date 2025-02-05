import { Prettify } from '../types-helper';

type GovUkField = Prettify<
  | {
      text: string;
      classes?: string;
    }
  | {
      html: string;
      classes?: string;
    }
>;

type ActionItem = Prettify<
  GovUkField & {
    href?: string;
    visuallyHiddenText?: string;
    attributes?: Record<string, string>;
  }
>;

export type SummaryListRow = {
  key: GovUkField;
  value: GovUkField;
  actions?: {
    items: ActionItem[];
  };
};
