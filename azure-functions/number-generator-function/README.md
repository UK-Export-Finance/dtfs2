# Azure Durable Function - Number Generator
Azure function to call Number Generator API and check if it already exists in API

# Inputs
POST to DOMAIN/api/orchestrators/numbergenerator
passing the portalIds in the form of
  {
    "entityType": deal|facility,
  }

# Outputs
On completion, the durable function returns the generated ID:
  {
    "ukefId": ID
  }

  # Errors
Errors are returned in this format
  {
    "num": "ERROR_NUM_GENERATOR",
    "error": [
      {
          "status": 401,
          "statusText": "Unauthorized",
          "data": {
              "error": "Invalid Client"
          },
          "requestConfig": {
              "method": "post",
              "url": "https://dev-ukef-tf-ea-v1.uk-e1.cloudhub.io/api/v1/numbers",
              "auth": {
                  "password": "xxx"
              },
              "headers": {
                  "Content-Type": "application/json"
              },
              "data": [
                  {
                      "numberTypeId": 1,
                      "createdBy": "Portal v2/TFM",
                      "requestingSystem": "Portal v2/TFM"
                  }
              ]
          },
          "date": "2021-08-04T15:47:54.041Z"
      }
    ]
  }
  