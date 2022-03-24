# Data migration

Scripts to migrate Portal V1 deals, facilities, users and banks (BSS/EWCS, GEF) to Portal V2.

:warning: To import any deals (BSS/EWCS/GEF), the database must have all Mandatory Criteria and Eligibility Criteria versions. These are stored in mock-data-loader.

## Setup

```shell
npm install
```

Make sure docker is running in the root directory of the repo.

## Portal - generic scripts (BSS, EWCS, GEF)

### Migrate a single user belonging to a certain bank

Add a JSON file to a new directory, and pass the path to the script:

```shell
node bss-ewcs/migrate-users.js --bankId=961 --file=./path/to/user.json
```

The V1 user will be mapped to V2 structure and added to the users collection. The users's bank must already be in the banks collection.

### Migrate all users/banks

Add a JSON file to a new directory, and pass the path to the script:

```shell
node bss-ewcs/migrate-users.js --file=./path/to/users.json
```

V1 users will be mapped to V2 structure and added to the users collection. The user banks must already be in the banks collection.

## BSS/EWCS scripts

### Migrate all BSS/EWCS deals

Grabs deals from an Azure fileshare (that would contain deals from Workflow) and add them to our Portal/BSS database.

```shell
node bss-ewcs/migrate-deals.js
```

V1 deals will be mapped to V2 structure and added to the deals collection. Facilities will be added to the facilities collection.

## GEF scripts

### Migrate all GEF deals

Add JSON files to a new directory, and pass the path to the script:

```shell
node gef/migrate-deals.js --path=./gef/dump 
```

V1 deals will be mapped to V2 structure and added to the deals collection. Facilities will added to the facilities collection.

### Migrate a single GEF deal

Add a JSON file and pass the file to the script:

```shell
node gef/migrate-deal.js --file=./gef/dump/12345.json
```

The V1 deal will be mapped to V2 structure and added to the deals collection. Facilities, will be added to the facilities collection.

