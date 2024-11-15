import { DEAL_STATUS } from '@ukef/dtfs2-common';
import { DEAL } from '../constants';

/**
 * The builder creates a valid deal object for the amendment button.
 * It can then be modified to test different scenarios.
 */
export class AmendmentButtonDealBuilder {
  constructor() {
    this.deal = {
      status: DEAL_STATUS.CONFIRMED,
      tfm: {
        stage: DEAL.DEAL_STAGE.CONFIRMED,
      },
      dealSnapshot: {
        submissionType: DEAL.SUBMISSION_TYPE.AIN,
      },
    };
  }

  withStatus(status) {
    this.deal.status = status;
    return this;
  }

  withTfmStage(stage) {
    this.deal.tfm.stage = stage;
    return this;
  }

  withDealSnapshotSubmissionType(submissionType) {
    this.deal.dealSnapshot.submissionType = submissionType;
    return this;
  }

  build() {
    return this.deal;
  }
}
