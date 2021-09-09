# Azure Durable Function - Number Generator
Azure function to call Number Generator API and check if it already exists in API

# Inputs
POST to DOMAIN/api/orchestrators/numbergenerator
passing the portalIds in the form of
  {
    "dealId": "123321",
    "facilities": ["2222", "3333", "4444"]
  }

# Outputs
On completion, the durable function returns the generated IDs:
  {
    "deal": {
        "id": 123321,
        "ukefId": "0030005648"
    },
    "facilityTasks": [
        {
            "id": 2222,
            "ukefId": "0030005650"
        },
        {
            "id": 3333,
            "ukefId": "0030005647"
        },
        {
            "id": 4444,
            "ukefId": "0030005649"
        }
    ]
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
                  "password": "9be2961393e84a31A1716b71EE0d1573"
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