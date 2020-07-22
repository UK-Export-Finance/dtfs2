const express = require('express')
const request = require('request')
const fs = require('fs');
const router = express.Router()


// Add your routes here - above the module.exports line
router.get('/salesforce/new_task', function(req, res){


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

// Add your routes here - above the module.exports line
router.get('/salesforce/get_contact/contacts/:id', function(req, res){


    let SF = JSON.parse(fs.readFileSync('salesforce.json'));

    var access_token = ''
    var options = {
        url: `${SF.LoginURL}?username=${SF.Username}&password=${SF.Password}${SF.token}&client_id=${SF.ClientID}&client_secret=${SF.ClientSecret}&grant_type=password`,
        headers: {},
        method: 'POST',
    };

    console.log(req.params);
    request(options, function (error, response) { 
        if (error) throw new Error(error);
        
        id = req.params['id']; 
        console.log(id);
        access_token = JSON.parse(response.body)['access_token'];
        var options = {
          'method': 'GET',
          'url': `https://ef-alpha--dtfsalpha.my.salesforce.com/services/data/v20.0/sobjects/Contact/${id}`,
          'headers': {
            'Authorization': `Bearer ${access_token}`
          }
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          res.send(response.body);
        });
    });

})

module.exports = router
