# Data Migration :rocket:

Scripts to migrate Portal V1 deals, facilities, users, and banks
(BSS/EWCS, GEF) to Portal V2.

:warning: **Important**: To import any deals (BSS/EWCS/GEF), the database
must have all Mandatory Criteria and Eligibility Criteria versions. These
are stored in mock-data-loader.

## Setup :gear:

```shell
npm install
```

Make sure Docker is running in the root directory of the repo. :whale:

## Portal - Generic Scripts (BSS, EWCS, GEF) :computer:

### Migrate a Single User Belonging to a Certain Bank :man_technologist:

To migrate a single user from V1 to V2 who belongs to a specific bank,
you should create a JSON file containing the user's data and then use
the following command:

```shell
node bss-ewcs/migrate-users.js --bankId=961 --file=./path/to/user.json
```

This script will map the V1 user's data to the V2 structure and add it
to the users collection. Ensure that the user's bank is already in the
banks collection.

### Migrate All Users/Banks :busts_in_silhouette:

To migrate multiple users from V1 to V2 along with their associated
banks, create a JSON file containing the users' data and use the
following command:

```shell
node bss-ewcs/migrate-users.js --file=./path/to/users.json
```

This script will map the V1 users' data to the V2 structure and add
them to the users collection. Make sure that the user banks are already
in the banks collection.

## BSS/EWCS Scripts :chart_with_upwards_trend:

### Migrate All BSS/EWCS Deals :moneybag:

To migrate all BSS/EWCS deals from V1 to V2, the script grabs deals
from an Azure fileshare (containing deals from Workflow) and adds them
to the Portal/BSS database. Use the following command:

```shell
node bss-ewcs/migrate-deals.js
```

This script will map the V1 deals to the V2 structure and add them to
the deals collection. Facilities associated with these deals will also
be added to the facilities collection.

### Archive a BSS/EWCS Deal :file_folder:

To archive a successfully migrated BSS/EWCS deal, use the following command:

```shell
node bss-ewcs/archive-deal.js <dealId>
```

Example:

```shell
node bss-ewcs/archive-deal.js 12345
```

This script will move the deal XML file and its associated folder from the
migration directory to the archived success folder in the Azure fileshare.

## GEF Scripts :rocket:

### Migrate All GEF Deals :money_with_wings:

To migrate all GEF deals from V1 to V2, create JSON files containing
the GEF deals' data and use the following command:

```shell
node gef/migrate-deals.js --path=./gef/dump
```

This script will map the V1 GEF deals' data to the V2 structure and add
them to the deals collection. Facilities associated with these deals
will also be added to the facilities collection.

### Migrate a Single GEF Deal :page_facing_up:

To migrate a single GEF deal from V1 to V2, create a JSON file
containing the deal's data and use the following command:

```shell
node gef/migrate-deal.js --file=./gef/dump/12345.json
```

This script will map the V1 GEF deal's data to the V2 structure and add
it to the deals collection. Facilities associated with this deal will
also be added to the facilities collection.

Make sure to follow the instructions and provide the required input data
in JSON files as needed for each migration script.

---
