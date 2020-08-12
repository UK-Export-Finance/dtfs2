const express = require('express');
const azure = require('./drivers/fileshare');
const { AZURE_WORKFLOW_FILESHARE_CONFIG, AZURE_PORTAL_FILESHARE_CONFIG } = require('./config/fileshare.config');
const moment = require('moment');

const routes = express.Router();

const interval = 1000;
const timeout = 20000;

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

const upload = async({fileshare, folder, typeBXML}) => {
  const filename = `${moment().format('YYYY_MM_DD_hh_mm_ss')}.XML`;

  const opts = {
    fileshare,
    folder,
    filename,
    buffer: Buffer.from(`\ufeff${typeBXML}`, 'utf16le'),
    allowOverwrite: true,
  };

  await azure.uploadFile(opts);

  return filename;
}

const isFileThere = async ({fileshare, folder, filename}) => {
  const listing = await azure.listDirectoryFiles({fileshare, folder});
  const matches = listing.filter( (entry)=>{
    return entry.name===filename
  });
  return matches.length > 0;
}

const check = async ({fileshare, folder, filename}, start, callback) => {
  if (moment() > start+timeout) {
    callback('timeout');
  } else {
    const fileThere = await isFileThere({fileshare, folder, filename});
    if (!fileThere) {
      callback(null, 'file gone');
    } else {
      setTimeout( () => {
        check({fileshare, folder, filename}, start, callback);
      }, interval)
    }
  }
}


const fileToBeGone = ({fileshare, folder, filename}) => {
  const start = moment();

  return new Promise( (resolve, reject) => {
    check(
      {fileshare, folder, filename},
      moment(),
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve();
        }
      });
  });
}

routes.route('/typeB')
  .post( async (req, res, next) => {
    const fileshare = AZURE_WORKFLOW_FILESHARE_CONFIG.FILESHARE_NAME;
    const folder = AZURE_WORKFLOW_FILESHARE_CONFIG.IMPORT_FOLDER;

    const typeBXML = generateTypeBXML(req.body);
    console.log(`typeB created ::\n${typeBXML}`);

    const filename = await upload({ fileshare, folder, typeBXML });
    console.log(`typeB uploaded.`)

    await fileToBeGone({fileshare, folder, filename})
      .then( () => {
        console.log(`file has been consumed`);
        res.status(200).send();
      })
      .catch( (err) => {
        console.log(`error while waiting for file to be consumed:\n ${err}`);
        res.status(400).send(err);
      });
  });

module.exports = routes;
