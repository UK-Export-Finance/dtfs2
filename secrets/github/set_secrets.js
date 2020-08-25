const sodium = require('tweetsodium');
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
var util = require('util');

const username = "davidcarboni";
const owner = "notbinary";
const repo = "dtfs2"
const pat_path = "./pat.txt"
const csv_path = "./environment_variables.csv"

const { Octokit } = require("@octokit/rest");

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

    console.log("Getting personal access token...")

    try {
        if (fs.existsSync(pat_path)) {
            return fs.readFileSync(pat_path, 'utf8').trim();
        } else {
            console.log(`Please put a Github Personal Access Token with 'repo' and 'admin:org' scope into a file called ${path}`)
        }
    } catch(err) {
        console.error(err)
    }
}

function shorten(s) {
    if (s.length > 10) {
        return s.substring(0, 10) + '...';
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
    console.log(`${shorten(secretValue)} -> ${shorten(encryptedB64)}`)
    return encryptedB64
}

function processKey(row, secretsList) {
    secrets = {};
    const key = row["Key"];
    // console.log(`Processing: ${key}`);
    // console.log(`Environments:`)
    Object.keys(row).forEach((key) => {

        // For each environment where a value is specified, set the secret value:
        if (key !== "Key" && row[key]) {

            // Secret name
            var secretName
            if (key === "all") {
                secretName = `${row["Key"]}`
            } else {
                secretName = `${key.toUpperCase()}_${row["Key"]}`
            }
            // console.log(` - ${key} -> ${secretName}`)
            removeItem(secretsList, secretName);

            // Encrypt secret value
            secretValue = row[key];
            secrets[secretName] = secretValue;
        }
    });
    return secrets;
}

function removeItem(array, item) {
    const index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array
}

async function getRepo(octokit) {

    console.log("Getting repo information...")

    const response = await octokit.repos.get({
        owner,
        repo,
    })

    if (response.status === 200) {
        return response.data;
    } else {
        console.log(response);
        throw("Error getting repo information")
    }
}

async function getRepoPublicKey(octokit) {

    console.log("Getting repository public key...")

    const response = await octokit.actions.getRepoPublicKey({
        owner,
        repo,
    })

    if (response.status === 200) {
        return response.data;
    } else {
        console.log(response);
        throw("Error getting repo public key")
    }
}

async function getOrgPublicKey(octokit) {

    console.log("Getting org public key...")

    const response = await octokit.actions.getOrgPublicKey({
        org: owner,
    })

    if (response.status === 200) {
        return response.data;
    } else {
        console.log(response);
        throw("Error getting org public key")
    }
}

async function listRepoSecrets(octokit) {

    console.log("Listing repository secrets...")

    const response = await octokit.actions.listRepoSecrets({
        owner: owner,
        repo: repo,
        per_page: 100,
    })

    if (response.status === 200) {

        // Check we've got all the secrets
        total_count = response.data.total_count
        if (total_count > 100) {
            throw("Too many secrets, need to paginate.")
        }

        // Collate secret names
        secrets = response.data.secrets;
        names = []
        secrets.forEach(function (secret) {
            names.push(secret.name);
          });
        return names;

    } else {
        console.log(response);
        throw("Error listing repo secrets")
    }
}

async function setOrgSecret(secret_name, secret_value, orgPublicKey, repoId, octokit) {

    console.log(` - Setting org secret: ${secret_name}`);
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
            return "";
        }
        
    } catch (err) {
        console.log(` - Error setting ${secret_name} on the organisation.`);
        console.log(util.inspect(err));
        return secret_name;
    }
}

async function setSecret(secret_name, secret_value, repoPublicKey, orgPublicKey, repoId, octokit) {

    console.log(`Setting repo secret: ${secret_name}`);

    const encrypted_value = encrypt(secret_value, repoPublicKey.key);
    //console.log({
    try {
        // Broken:
        // const response = await octokit.actions.createOrUpdateRepoSecret(
        //  - doesn't add the secret name to the end of the path
        //const response = await octokit.request("PUT /repos/:owner/:repo/actions/secrets/:name", {
        const response = await octokit.actions.createOrUpdateRepoSecret({
            owner,
            repo,
            secret_name,
            encrypted_value,
            key_id: repoPublicKey.key_id,
        });

        if (response.status === 201 || response.status == 204) {
            return "";
        }

        // Looks like that didn't work.
        console.log(response);
        throw(`Error setting secret value: ${secret_name}: status code ${response.status}`);
        
    } catch (err) {

        // If Github is stuck in an "Abuse Detection" state then
        // fall back to setting the secret at the organisation level:
        console.log(` - Error setting ${secret_name}, falling back to org-level secret.`);
        if (secret_name.endsWith("_DEAL_API_URL")) {
            console.log(util.inspect(err));
        }
        return setOrgSecret(secret_name, secret_value, orgPublicKey, repoId, octokit);;
    }
}

async function main() {

    // Get the repo public key
    const pat = getPersonalAccessToken();
    const octokit = new Octokit({auth: pat, userAgent: username});
    const repoPublicKey = await getRepoPublicKey(octokit);
    const orgPublicKey = await getOrgPublicKey(octokit);
    const repo = await getRepo(octokit);
    
    // List the current secrets
    const secretsList = await listRepoSecrets(octokit);

    // Parse the input csv
    var secrets = {}
    var failed_secrets = []
    fs.createReadStream(csv_path)
        .pipe(csv())
        .on('data', async (row) => {
            // console.log(row);
            const newSecrets = await processKey(row, secretsList, repoPublicKey);
            secrets = {
                ...secrets,
                ...newSecrets
            }
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            if (secretsList.length > 0) {
                console.log(`Secrets not included in the csv (${secretsList.length}):\n ${secretsList}`);
            }
            // Set the secrets, but delay each call to try and avoid the Github abuse detection mechanism
            delay = 2000;
            Object.keys(secrets).forEach((secretName) => {
                delay += 2000;
                setTimeout(async function() {
                    result = await setSecret(secretName, secrets[secretName], repoPublicKey, orgPublicKey, repo.id, octokit);
                    if (result) {
                        failed_secrets.push(secretName)
                    }
                }, delay);
            })
        });

}

main();