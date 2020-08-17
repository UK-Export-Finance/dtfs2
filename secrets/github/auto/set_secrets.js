const sodium = require('tweetsodium');
const value = "plain-text-secret";
const axios = require('axios');
var fs = require('fs');
const csv = require('csv-parser');
var util = require('util');

const username = "davidcarboni";
const owner = "notbinary";
const repo = "dtfs2"
const pat_path = "./pat.txt"
const csv_path = "./environment_variables.csv"


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

function getPersonalAccessToken() {

    console.log("Getting personal access token...")


    try {
        if (fs.existsSync(pat_path)) {
            return fs.readFileSync(pat_path, 'utf8').trim();
        } else {
            console.log(`Please put a Github Personal Access Token with 'repo' scope into a file called ${path}`)
        }
    } catch(err) {
        console.error(err)
    }
}

async function getRepoPublicKey(pat) {

    console.log("Getting repository public key...")

    try {
        const url = `https://${username}:${pat}@api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`
        const response = await axios.get(url);
        publicKey = response.data;
        console.log(util.inspect(publicKey));
        return publicKey;
    } catch (error) {
        console.log("Error getting repo public key.")
        console.error(error);
    }
}

async function listRepoSecrets(pat) {

    console.log("Listing repository secrets...")

    try {
        const url = `https://${username}:${pat}@api.github.com/repos/${owner}/${repo}/actions/secrets?per_page=100`
        const response = await axios.get(url);
        if (response.data.total_count > 100) {
            throw "Too many secrets. Update me for pagination.";
        }
        secrets = response.data.secrets;
        var keys = []
        console.log(`Repo secrets for ${repo}:`)
        secrets.forEach(function (secret) {
            console.log(` - ${secret.name}`);
            keys.push(secret.name)
        });
        return keys;
    } catch (error) {
        console.log("Error listing repo secrets.")
        console.error(error);
    }
}

async function encrypt(secretValue, key) {

    console.log("Encrypting secret value...")

    // Convert the message and key to Uint8Array's (Buffer implements that interface)
    const messageBytes = Buffer.from(secretValue);
    const keyBytes = Buffer.from(publicKey.key, 'base64');
    
    // Encrypt using LibSodium.
    encryptedBytes = sodium.seal(messageBytes, keyBytes);
    encryptedB64 = Buffer.from(encryptedBytes).toString('base64');
    console.log(encryptedB64)
    return encryptedB64
}

async function setSecret(secretName, encryptedValue, key_id, pat) {

    console.log("Setting secret on Github...")

    try {
        const url = `https://${username}:${pat}@api.github.com/repos/${owner}/${repo}/actions/secrets/${secretName}`
        const message = {"encrypted_value": encryptedValue, "key_id": key_id};
        console.log(util.inspect(message));
        console.log(JSON.stringify(message));
        const response = await axios.put(url, message);
        if (response.status == 201) {
            console.log(`Created: ${secretName}`);
            return true;
        } else if (response.status == 204) {
            console.log(`Updated: ${secretName}`);
            return true;
        } else if (response.status == 422) {
            console.log(`Unprocessable entity: ${secretName}`);
            console.log(response.data)
            return false;
        } else if (response.status == 429) {
            console.log(` <<< Too many requests: ${secretName}`);
            return false;
        } else {
            console.error(`Unexpected ${response.status} for ${secretName}`);
            console.log(util.inspect(response.data));
            return false;
        }
    } catch (error) {
        console.log(`Error setting secret ${secretName}.`)
        console.error(error);
    }

}

async function processKey(row, secretsList, publicKey, pat) {
    secrets = {};
    const key = row["Key"];
    console.log(`Processing: ${key}`);
    console.log(`Environments:`)
    Object.keys(row).forEach(async (key) => {

        // For each environment where a value is specified, set the secret value:
        if (key !== "Key" && row[key]) {

            // Secret name
            var secretName
            if (key === "all") {
                secretName = `${row["Key"]}`
            } else {
                secretName = `${key.toUpperCase()}_${row["Key"]}`
            }
            console.log(` - ${key} -> ${secretName}`)
            removeItem(secretsList, secretName);

            // Encrypt secret value
            secretValue = await encrypt(row[key], publicKey.key)

            // Add the secret to the list
            secrets[secretName] = secretValue
        }
    });
    return secrets;
}

function removeItem(array, item) {
    console.log(` b: ${array.length}`)
    console.log(`  -> removing ${item}`)
    const index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
    }
    console.log(` a: ${array.length}`)
    return array
}

async function main() {

    // Get the repo public key
    const pat = getPersonalAccessToken();
    const publicKey = await getRepoPublicKey(pat);
    const secretsList = await listRepoSecrets(pat);
    console.log(secretsList)

    // Parse the input csv
    var secrets = {}
    fs.createReadStream(csv_path)
        .pipe(csv())
        .on('data', async (row) => {
            console.log(row);
            const newSecrets = await processKey(row, secretsList, publicKey, pat);
            secrets = {
                ...secrets,
                ...newSecrets
            }
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            console.log(`Secrets not included in the csv (${secretsList.length}):\n ${secretsList}`);
    
            // Set the secrets, but delay each call so we don't hit the Github abuse detection mechanism
            delay = 2000;
            Object.keys(secrets).forEach((secretName) => {
                delay += 5000;
                setTimeout(async function() {
                    await setSecret(secretName, secrets[secretName], publicKey.key_id, pat);
                }, delay);
            })
        });

}

main();