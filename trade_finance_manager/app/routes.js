const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line
router.get('/hello', function(req, res){
    res.send('hello world')
})

router.get('/salesforce_update', function (req, res) {
    var request = require('request');
    var token = '00D1x0000008goz!AQkAQMGWcqHGsxyUILsZVQM3jLTHC8p9QOxtIT1e5dOpJekNJrElAuhdhLnNxae5vAReSAgbvYVlrLQOot62bSL8ZqTZEr93'
    var options = {
    'method': 'POST',
    'url': 'https://ef-alpha--dtfsalpha.my.salesforce.com/services/data/v20.0/sobjects/Task',
    'headers': {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
        'Cookie': 'BrowserId=XG2EE8aREeqnoglEKl9mDQ; rememberUn=false; inst=APP_1x; com.salesforce.LocaleInfo=uk; oinfo=c3RhdHVzPURFTU8mdHlwZT0yJm9pZD0wMEQxeDAwMDAwMDhnb3o=; disco=1x:00D1x0000008goz:0051x000003jBSE:1; autocomplete=1; sid=00D1x0000008goz!AQkAQEkzqifDGrbMVXSMikGS380zzeovNeWGCtGamkawM8DTCmAP8fLLY8jMoxnJ.b2Xa6SiACCw46WhWQp7JEsINQW9pnpO; sid_Client=x000003jBSEx0000008goz; clientSrc=82.23.77.93; oid=00D1x0000008goz; sfdc_lv2=KxG83HPaW0uQf+qqqQTqXimQ2E96Tgs3Mt+Ufs8rJ8TTAWl/Tk6Gh+QVL+f2MXCeI='
    },
    body: `{\n    \"WhoId\": null,\n    \"WhatId\": \"a0n1x000002EZfyAAG\",\n    \"Subject\": \"Created by Simon at ${Date.now()}\",\n    \"ActivityDate\": null,\n    \"Status\": \"Open\",\n    \"Priority\": \"Normal\",\n    \"OwnerId\": \"0051x000003hH96AAE\",\n    \"Description\": null,\n    \"Type\": null,\n    \"CallDurationInSeconds\": null,\n    \"CallType\": null,\n    \"CallDisposition\": null,\n    \"CallObject\": null,\n    \"ReminderDateTime\": \"2020-07-09T07:00:00.000+0000\",\n    \"IsReminderSet\": false,\n    \"IsRecurrence\": false,\n    \"Meeting_Rating__c\": null,\n    \"Account__c\": null,\n    \"Referred_to__c\": null,\n    \"UKEF_Division__c\": null,\n    \"Appointment_Type__c\": null,\n    \"Products_to_Discuss__c\": null,\n    \"Sub_Type__c\": null,\n    \"Campaign__c\": null,\n    \"Contact__c\": null,\n    \"Lead__c\": null,\n    \"Meeting_Type__c\": null,\n    \"Opportunity__c\": null,\n    \"Engagement_Type__c\": null,\n    \"eContacts__Bundle__c\": null,\n    \"Is_Helpdesk_Related__c\": false,\n    \"Number_of_Delegates__c\": null,\n    \"Number_of_Host_Members__c\": null,\n    \"Subject_Related_To__c\": null\n}`

    };
    request(options, function (error, response) { 
        if (error) throw new Error(error);
        
        res.send(response.body);
    }
    );

  })

module.exports = router
