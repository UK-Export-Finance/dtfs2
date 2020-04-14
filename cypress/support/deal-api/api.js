const api = () => {
    const url = `${Cypress.config('apiProtocol')}${Cypress.config('apiHost')}:${Cypress.config('apiPort')}`;
    console.log(`url for api: ${url}`);
    return url;
}

module.exports.logIn = (opts, callback) => {
  const { username, password } = opts;

  cy.request({
    url: `${api()}/v1/login`,
    method: 'POST',
    body: {username, password},
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    callback && callback(resp.body.token);
  });
}


module.exports.deleteDeal = (token, deal, callback) => {
    cy.request({
      url: `${api()}/v1/deals/${deal._id}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    }).then((resp) => {
      expect(resp.status).to.equal(200);
      callback && callback();
    });
};

module.exports.listAllDeals = (token, callback) => {
  cy.request({
    url: `${api()}/v1/deals`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    callback(resp.body.deals);
  });
};

module.exports.insertDeal = (deal, token, callback) => {
  cy.request({
    url: `${api()}/v1/deals`,
    method: 'POST',
    body: deal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    callback && callback(resp.body);
  });
}
