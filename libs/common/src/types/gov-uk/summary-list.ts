import { Prettify } from '../types-helper';

type GovUkField =
  | {
      text: string;
      classes?: string;
      attributes?: Record<string, string>;
    }
  | {
      html: string;
      classes?: string;
      attributes?: Record<string, string>;
    };

type ActionItem = Prettify<
  GovUkField & {
    href?: string;
    text?: string;
    visuallyHiddenText?: string;
    attributes?: Record<string, string>;
  }
>;

/**
 * Type of the `rows array object` for the {@link https://design-system.service.gov.uk/components/summary-list/ | GOV.UK Summary List component }
 */
export type SummaryListRow = {
  key: GovUkField;
  value: GovUkField;
  actions?: {
    items: ActionItem[];
  };
};
