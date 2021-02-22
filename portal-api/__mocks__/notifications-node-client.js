
function NotifyClient() {
  // console.log('MOCKING notifications-node-client::NotifyClient');
  return {
    sendEmail: () => Promise.resolve(true),
  };
}

module.exports.NotifyClient = NotifyClient;
