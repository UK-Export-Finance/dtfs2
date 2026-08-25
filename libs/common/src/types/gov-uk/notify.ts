export type GovNotifyEmailResponse = {
  status: number;
  data: {
    content: Record<string, unknown>;
    id: string;
    reference: string;
    sanitised_content: Record<string, unknown>;
    scheduled_for: string | null;
    template: Record<string, unknown>;
    uri: string;
  };
};
