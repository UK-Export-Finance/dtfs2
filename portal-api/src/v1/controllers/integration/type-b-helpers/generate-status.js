const { k2Map } = require('../helpers');

const generateStatus = (portalDeal, workflowDeal) => {
  let workflowStatus = workflowDeal.Deal_status[0];
  const actionCode = workflowDeal.$.Action_Code;

  const portalStatus = portalDeal.status;

  if (workflowStatus && portalStatus !== workflowStatus && actionCode === '004') {
    workflowStatus = 'in_progress_by_ukef';
  }

  return k2Map.findPortalValue('DEAL', 'DEAL_STATUS', workflowStatus);
};

module.exports = generateStatus;

/*
Replicates Drupal code
/portal/docroot/modules/custom/ukef_xml_workflow/modules/
ukef_xml_workflow_import/src/Plugin/QueueWorker/UkefXmlWorkflowImportBase.php

if ($node->field_deal_status->value != $data['Deal_status']) {
    if ($data['@attributes']['Action_Code'] == '004') {
      // For manual Deals we show different status with same meaning
      // Atp = MIA.
      $node->field_deal_status->value = 'in_progress_by_ukef';
    }
    else {
      $node->field_deal_status->value = $data['Deal_status'];
    }
  }

*/
