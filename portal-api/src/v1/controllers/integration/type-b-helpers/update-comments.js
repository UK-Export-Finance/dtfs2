const dealCommentsController = require('../../deal-comments.controller');

const updateComments = async (dealId, workflowDeal) => {
  const { Deal_comments: dealComments = [] } = workflowDeal;
  const { Action_Code: actionCode } = workflowDeal.$;

  const user = {
    username: 'UKEF workflow',
  };

  if (dealComments.length) {
    if (actionCode === '007') {
      await dealCommentsController.addUkefDecision(dealId, dealComments[0], user);
    } else {
      await dealCommentsController.addComment(dealId, dealComments[0], user);
    }
  }
};

module.exports = updateComments;

/*
replicates Drupal code
/portal/docroot/modules/custom/ukef_xml_workflow/modules/
ukef_xml_workflow_import/src/Plugin/QueueWorker/UkefXmlWorkflowImportBase.php

// Update deal comments from the XML.
          switch ($data['@attributes']['Action_Code']) {
            case '007':
              $node->field_special_conditions->value = !empty($data['Deal_comments']) ?
                $data['Deal_comments'] : '';
              break;

            default:
              $node->field_deal_comments->value = !empty($data['Deal_comments']) ?
                $data['Deal_comments'] : '';
          }
*/
