import { BaseViewModel } from '../base-view-model';

export type CompletedCorrectionViewModel = {
  dateSent: {
    formattedDateSent: string;
    dataSortValue: number;
  };
  exporter: string;
  formattedReasons: string;
  formattedPreviousValues: string;
  formattedCorrectedValues: string;
  bankCommentary?: string;
};

export type RecordCorrectionHistoryViewModel = BaseViewModel & {
  completedCorrections: CompletedCorrectionViewModel[];
};
