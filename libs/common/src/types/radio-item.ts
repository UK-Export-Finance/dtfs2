export type RadioItem = {
  text: string;
  value: string;
  checked: boolean;
  attributes?: {
    'data-cy'?: string;
  };
};
