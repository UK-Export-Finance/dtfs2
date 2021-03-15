const sodium = require('tweetsodium');
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const util = require('util');

const username = process.env.USERNAME;
const owner = 'foundry4';
const repo = 'dtfs2';
const pat_path = './pat.txt';
const csv_path = './environment_variables.csv';

const { Octokit } = require('@octokit/rest');
const { throttling } = require('@octokit/plugin-throttling');
const { env } = require('process');


const ThrottledOctokit = Octokit.plugin(throttling);

// Processes a csv of the form:
//
// Key , all, Dev, Test, Prod
// KEY1,    , a  , b   , c
// KEY2, 0
//
// Into GH Secrets:
//
// DEV_KEY1=a
// TEST_KEY1=b
// PROD_KEY1=c
// KEY2=0

// It's helpful to know that if you get an error that looks like this in Github actions,
// it tends to mean that a secret value was empty. It's not obvious, so noting it here:
//
// The command failed with an unexpected error. Here is the traceback:
//
// string index out of range

function getPersonalAccessToken() {
  console.log('Getting personal access token...');

  try {
    if (fs.existsSync(pat_path)) {
      return fs.readFileSync(pat_path, 'utf8').trim();
    }
    console.log(`Please put a Github Personal Access Token with 'repo' and 'admin:org' scope into a file called ${path}`);
  } catch (err) {
    console.error(err);
  }
}

function shorten(s) {
  if (s.length > 10) {
    return `${s.substring(0, 10)}...`;
  }
  return s;
}

function encrypt(secretValue, key) {
  // Convert the message and key to Uint8Array's (Buffer implements that interface)
  const messageBytes = Buffer.from(secretValue);
  const keyBytes = Buffer.from(key, 'base64');

  // Encrypt using LibSodium.
  encryptedBytes = sodium.seal(messageBytes, keyBytes);
  encryptedB64 = Buffer.from(encryptedBytes).toString('base64');
  // console.log(`${shorten(secretValue)} -> ${shorten(encryptedB64)}`)
  return encryptedB64;
}

function processKey(row) {
  const { Key, ...rowData } = row;

  const secrets = Object.entries(rowData).filter(([_, secretValue]) => Boolean(secretValue))
    .map(([environment, secretValue]) => (secretValue && {
      environment,
      secretValue,
    }));
  return { [Key]: secrets };
}

async function getRepo(octokit) {
  console.log('Getting repo information...');

  const response = await octokit.repos.get({
    owner,
    repo,
  });

  if (response.status === 200) {
    return response.data;
  }
  console.log(response);
  throw ('Error getting repo information');
}

// async function getRepoPublicKey(octokit) {
//   console.log('Getting repository public key...');

//   const response = await octokit.actions.getRepoPublicKey({
//     owner,
//     repo,
//   });

//   if (response.status === 200) {
//     console.log(response.data);
//     return response.data;
//   }
//   console.log(response);
//   throw ('Error getting repo public key');
// }

function getPublicKeys(octokit, repository_id, environmentList) {
  console.log('Getting environemnt public keys...');

  const responses = environmentList.map((environment_name) => {
    console.log(`Getting public key for ${environment_name} environment`);
    let response;

    if (environment_name === 'all') {
      response = octokit.actions.getRepoPublicKey({
        owner,
        repo,
      });
    } else {
      response = octokit.actions.getEnvironmentPublicKey({
        repository_id,
        environment_name,
      });
    }
    return new Promise((resolve, reject) => {
      response.then((r) => {
        resolve({
          publicKey: r.data,
          environment_name,
        });
      });
    });
  });

  return responses;
}


async function getOrgPublicKey(octokit) {
  console.log('Getting org public key...');

  const response = await octokit.actions.getOrgPublicKey({
    org: owner,
  });

  if (response.status === 200) {
    return response.data;
  }
  console.log(response);
  throw ('Error getting org public key');
}

function listRepoSecrets(octokit, repository_id, environmentList) {
  console.log('Listing repository secrets...');
  console.log({ environmentList });

  const responses = environmentList.map((environment_name) => {
    let response;

    if (environment_name === 'all') {
      response = octokit.actions.listRepoSecrets({
        owner,
        repo,
        per_page: 100,
      });
    } else {
      response = octokit.actions.listEnvironmentSecrets({
        repository_id,
        environment_name,
      });
    }

    return new Promise((resolve, reject) => {
      response.then((r) => {
        resolve({
          response: r,
          environment: environment_name,
        });
      });
    });
  });

  return responses;


  // console.log(response);
  // throw ('Error listing repo secrets');
}

async function setOrgSecret(secret_name, secret_value, orgPublicKey, repoId, octokit) {
  const encrypted_value = encrypt(secret_value, orgPublicKey.key);
  try {
    const response = await octokit.actions.createOrUpdateOrgSecret({
      org: owner,
      secret_name,
      encrypted_value,
      key_id: orgPublicKey.key_id,
      visibility: 'selected',
      selected_repository_ids: [repoId],
    });

    if (response.status === 201 || response.status == 204) {
      console.log(`${secret_name} * org`);
      return '';
    }
  } catch (err) {
    console.log(` - Error setting ${secret_name} on the organisation.`);
    console.log(util.inspect(err));
    return secret_name;
  }
}

async function setSecret(secret_name, { environment, secretValue }, publicKey, orgPublicKey, repoId, octokit) {
  const encrypted_value = encrypt(secretValue, publicKey.key);
  // console.log({
  try {
    // Broken:
    // const response = await octokit.actions.createOrUpdateRepoSecret(
    //  - doesn't add the secret name to the end of the path
    // const response = await octokit.request("PUT /repos/:owner/:repo/actions/secrets/:name", {
    if (environment === 'all') {
      const response = await octokit.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name,
        encrypted_value,
        key_id: publicKey.key_id,
      });

      if (response.status === 201 || response.status == 204) {
        console.log(`Setting repo secret: ${secret_name}`);
        return '';
      }
      // Looks like that didn't work.
      console.log(response);
      throw (`Error setting secret value: ${secret_name}: status code ${response.status}`);
    } else {
      const response = await octokit.actions.createOrUpdateEnvironmentSecret({
        repository_id: repoId,
        environment_name: environment,
        secret_name,
        encrypted_value,
        key_id: publicKey.key_id,
      });

      if (response.status === 201 || response.status === 204) {
        console.log(`Setting environment secret on ${environment}: ${secret_name} = ${secretValue}`);
        return '';
      }
      // Looks like that didn't work.
      console.log(response);
      throw (`Error setting secret value: ${secret_name}: status code ${response.status}`);
    }
  } catch (err) {
    // If Github is stuck in an "Abuse Detection" state then
    // fall back to setting the secret at the organisation level:
    // console.log(err)
    console.log(` - Error setting ${environment} - ${secret_name},`, { errorName: err.name, errorStatus: err.status });
    // return setOrgSecret(secret_name, secretValue, orgPublicKey, repoId, octokit);
    // console.log('didnt work');
  }
}

function checkForMissingSecrets(currentSecrets, newSecrets) {
  const missingSecrets = [];
  Object.entries(newSecrets).forEach(([secretName, envSecrets]) => {
    envSecrets.forEach((envSecret) => {
      const currentEnv = currentSecrets.find(({ environment }) => environment === envSecret.environment);
      if (!currentEnv) return;
      if (!currentEnv.secrets.includes(secretName)) {
        // console.log({ currentEnv, secretName });
        missingSecrets.push(`${currentEnv.environment}:${secretName}`);
      }
    });
  });
  if (missingSecrets.length > 0) {
    console.log(`Secrets not included in the csv (${missingSecrets.length}):\n ${missingSecrets.join(', ')}`);
  }
}

async function main() {
  // const octokit = new Octokit({auth: pat, userAgent: username});
  const octokit = new ThrottledOctokit({
    auth: getPersonalAccessToken(),
    userAgent: username,
    throttle: {
      onRateLimit: (retryAfter, options) => {
        console.log(
          `Request quota exhausted for request - retry after ${retryAfter}s: ${options.method} ${options.url}`,
        );

        // Retry twice after hitting a rate limit error, then give up
        if (options.request.retryCount <= 2) {
          console.log(`Retrying after ${retryAfter} seconds!`);
          return true;
        }
      },
      onAbuseLimit: (retryAfter, options) => {
        // does not retry, only logs a warning
        console.log(
          `Abuse detected for request - retry after ${retryAfter}s: ${options.method} ${options.url}`,
        );
      },
    },
  });

  // Get the repo and org public keys
  let envPublicKeys;

  // const orgPublicKey = await getOrgPublicKey(octokit);
  const repo = await getRepo(octokit);

  // List the current secrets

  let currentSecretsList = [];
  let envPublicKeysList = [];

  // Parse the input csv
  let secrets = {};

  fs.createReadStream(csv_path)
    .pipe(csv())
    .on('headers', (headers) => {
      const envList = headers.filter((environmentName) => environmentName !== 'Key');
      currentSecretsList = listRepoSecrets(octokit, repo.id, envList);
      envPublicKeysList = getPublicKeys(octokit, repo.id, envList);
    })
    .on('data', async (row) => {
      const newSecrets = await processKey(row);
      secrets = {
        ...newSecrets,
        ...secrets,
      };
    })
    .on('end', async () => {
      console.log('CSV file successfully processed');


      const currentSecretsResults = await Promise.all(currentSecretsList);
      envPublicKeys = await Promise.all(envPublicKeysList);


      const currentSecrets = currentSecretsResults.map(({ environment, response }) => {
        if (response.status === 200) {
          // Check we've got all the secrets
          total_count = response.data.total_count;
          if (total_count > 100) {
            throw ('Too many secrets, need to paginate.');
          }

          // Collate secret names
          const { secrets } = response.data;
          names = [];
          secrets.forEach((secret) => {
            names.push(secret.name);
          });

          // Azure acces credentials aren't in the spreadsheet, so don't show them as left-over
          names = names.filter((item) => item !== 'AZURE_DIGITAL_DEV');
          names = names.filter((item) => item !== 'AZURE_DIGITAL_TEST');
          names = names.filter((item) => item !== 'AZURE_DIGITAL_PROD');

          return {
            environment,
            secrets: names,
          };
        }
      });

      checkForMissingSecrets(currentSecrets, secrets);

      // Set the secrets, but delay each call to try and avoid the Github abuse detection mechanism
      // NB Github abuse detection seems to fire for most secrets, and in a consistent pattern.
      //    once a secret gets "blocked" it seems to stay blocked permanently.
      // Update: it appears that there's a limit of 100 secrets per repo, unless they're set on an
      // environment. At the time of writing, Octokit doesn't support environments.
      // delay = 10;
      Object.entries(secrets).forEach(async ([secretName, secretValues]) => {
        const failed_secrets = [];
        // delay += 10;
        // setTimeout(async function() {
        secretValues.forEach(async (secretValue) => {
          const { publicKey } = envPublicKeys.find(({ environment_name }) => environment_name === secretValue.environment);

          const result = await setSecret(secretName, secretValue, publicKey, '', repo.id, octokit);
          if (result) {
            failed_secrets.push({
              environment: secretValue.environment,
              secretName,
            });
          }
        });
        // }, delay);

        if (failed_secrets.length) {
          console.log(`${failed_secrets.length} failed secrets`, failed_secrets);
        }
      });
    });
}

main();
