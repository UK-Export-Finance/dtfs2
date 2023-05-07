function NotifyClient() {
  return {
    sendEmail: () => Promise.resolve(true),
  };
}

module.exports.NotifyClient = NotifyClient;
