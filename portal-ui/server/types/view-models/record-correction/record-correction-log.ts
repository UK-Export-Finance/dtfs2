import { BaseViewModel } from '@ukef/portal-ui/server/types/view-models/base-view-model';

export type CompletedCorrectionViewModel = {
  dateSent: {
    formattedDateSent: string;
    dataSortValue: number;
  };
  exporter: string;
  formattedReasons: string;
  formattedPreviousValues: string;
  formattedCorrectedValues: string;
  formattedBankCommentary: string;
};

export type RecordCorrectionLogViewModel = BaseViewModel & {
  completedCorrections: CompletedCorrectionViewModel[];
};
