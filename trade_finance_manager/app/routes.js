const express = require('express')
const request = require('request')
const fs = require('fs');
const router = express.Router()


// Add your routes here - above the module.exports line
router.get('/salesforce/new_task/:subject', function(req, res){


    let SF = JSON.parse(fs.readFileSync('salesforce.json'));

    var access_token = ''
    var options = {
        url: `${SF.LoginURL}?username=${SF.Username}&password=${SF.Password}${SF.token}&client_id=${SF.ClientID}&client_secret=${SF.ClientSecret}&grant_type=password`,
        headers: {},
        method: 'POST',
    };

    request(options, function (error, response) { 
        if (error) throw new Error(error);
        
        access_token = JSON.parse(response.body)['access_token'];

        var options = {
        'method': 'POST',
        'url': 'https://ef-alpha--dtfsalpha.my.salesforce.com/services/data/v20.0/sobjects/Task',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({"Subject":`Do something ${Date.now()}`})
        
        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            res.send(response.body);
        });
    });

})

module.exports = router
