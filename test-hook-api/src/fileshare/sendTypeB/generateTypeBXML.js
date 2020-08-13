const generateBondXML = (bonds) => {
  if (!bonds || bonds.length ===0 ) {
    return '';
  }
  return bonds.reduce( (xml, bond) => {
    const {BSS_portal_facility_id, BSS_ukef_facility_id, BSS_status, BSS_comments} = bond;
    const additionalXML = `
  <BSSFacilities>
    <BSS_portal_facility_id>${BSS_portal_facility_id}</BSS_portal_facility_id>
    <BSS_ukef_facility_id>${BSS_ukef_facility_id}</BSS_ukef_facility_id>
    <BSS_status>${BSS_status}</BSS_status>
    <BSS_comments>${BSS_comments}</BSS_comments>
  </BSSFacilities>`;

    return `${xml}${additionalXML}`;
  },"");

};

const generateLoanXML = (loans) => {
  if (!loans || loans.length ===0 ) {
    return '';
  }
  return loans.reduce( (xml, loan) => {
    const {EWCS_portal_facility_id, EWCS_ukef_facility_id, EWCS_status, EWCS_comments} = loan;
    const additionalXML = `
  <EWCSFacilities>
    <EWCS_portal_facility_id>${EWCS_portal_facility_id}</EWCS_portal_facility_id>
    <EWCS_ukef_facility_id>${EWCS_ukef_facility_id}</EWCS_ukef_facility_id>
    <EWCS_status>${EWCS_status}</EWCS_status>
    <EWCS_comments>${EWCS_comments}</EWCS_comments>
  </EWCSFacilities>`;

    return `${xml}${additionalXML}`;
  },"");

};

const generateTypeBXML = (typeBSource) => {
  const {portal_deal_id, bank_deal_id, Message_Type, Action_Code} = typeBSource.header;
  const {UKEF_deal_id, Deal_status, Deal_comments} = typeBSource.deal;
  const bonds = generateBondXML(typeBSource.bonds);
  const loans = generateLoanXML(typeBSource.loans);
  return `
<Deal portal_deal_id="${portal_deal_id}" bank_deal_id="${bank_deal_id}" Message_Type="${Message_Type}" Action_Code="${Action_Code}">
  <UKEF_deal_id>${UKEF_deal_id}</UKEF_deal_id>
  <Deal_status>${Deal_status}</Deal_status>
  <Deal_comments>${Deal_comments}</Deal_comments>
  ${bonds}
  ${loans}
</Deal>`
}

module.exports = generateTypeBXML;
