const typeBxmlTemplate = `
<?xml version="1.0"?>
<Deal portal_deal_id="{{dealId}}" bank_deal_id="uat test 10 Multi Facilities" Message_Type="B" Action_Code="{{actionCode}}">
  <UKEF_deal_id>40000016</UKEF_deal_id>
  <Deal_status>{{status}}</Deal_status>
  <Deal_comments/>
  <BSSFacilities>
    <BSS_portal_facility_id>39817</BSS_portal_facility_id>
    <BSS_ukef_facility_id>40000030</BSS_ukef_facility_id>
    <BSS_status>Issued acknowledged</BSS_status>
    <BSS_comments/>
  </BSSFacilities>
</Deal>
`;

module.exports = typeBxmlTemplate;
