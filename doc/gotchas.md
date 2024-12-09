# Gotchas

This file is to document any common errors encountered running locally and their solutions so that devs don't lose time to errors previously encountered by others.

## `Error: Invalid object name`

If you encounter an error of the shape:

```shell
Error: Invalid object name 'PaymentMatchingTolerance'
```

This will usually be caused by an attempt to query a SQL table (in the example above the table name is PaymentMatchingTolerance) and that table doesn't exist.

This error is resolved by running the SQL db migrations. (see [SQL DB docs](./sql-db.md#--run-migrations)).
