export type GovNotifyEmailResponse = {
  status: number;
  data: {
    content: object;
    id: string;
    reference: string;
    sanitised_content: object;
    scheduled_for: string | null;
    template: object;
    uri: string;
  };
};
