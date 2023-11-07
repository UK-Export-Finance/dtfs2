export const fixAzureEnvironmentVariables = () => {
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith('CUSTOMCONNSTR_')) {
      const fixedKey = key.substr('CUSTOMCONNSTR_'.length);
      process.env[fixedKey] = process.env[key];
      console.info('Fixed %s to %s', key, fixedKey);
    }
  });
};
