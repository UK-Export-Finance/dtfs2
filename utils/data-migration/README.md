# data-migration

Scripts to migrate deals and users/banks from Portal V1 to Portal V2.

:warning: Knowledge in this area has been lost - it was built a long time ago when Workflow integration was a requirement. These scripts may now be useless. See below.

## Migrate single bank e.g. bankId 961

```shell
node migrate-users.js --bankId=961 --file=./path/to/user.json
```

## Migrate all banks

```shell
node migrate-users.js --file=./path/to/user.json
```

## Migrate all deals

:warning: This is now out of date and will not work.

Grabs deals from an Azure fileshare (that would contain deals from Workflow) and add them to our Portal/BSS database collection.

This was built initially with the v1 data structure of BSS. Facilities were initially part of a deal document, all in the `deals` MongoDB collection. Now, facilities are seperated and a BSS deal contains an array of facility ids.

```shell
node migrate-users.js --file=./path/to/user.json
```

## Moving fowrards

Data migration requirements or approach has not been discussed as a team.

All of these migration scripts may now be useless. The deals script in particular, is based on receiving data from Workflow.

Workflow is being retired, and the migration mapping is based on an old data structure.

Questions to be asked:

- Do we _need_ to migrate V1 deals into the new system?
- If so, where will we get V1 deals from? Considering that Workflow is being retired
- How and where will we migrate real world users and banks from for staging/production?
