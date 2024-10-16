#!/bin/bash
set -m
/opt/mssql/bin/sqlservr &

echo "⚡ Initialising MSSQL Server"

# Executes SQL query
query() {
  /opt/mssql-tools/bin/sqlcmd -C -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "$1" >/dev/null
  return $?
}

# Initial DB setup
initialise() {
  readonly DB="USE [$SQL_DB_NAME];"

  # 1. Database
  query "CREATE DATABASE [$SQL_DB_NAME];"

  # 2. User
  query "CREATE LOGIN $SQL_DB_USERNAME WITH PASSWORD = '$SQL_DB_PASSWORD';"
  query "$DB CREATE USER $SQL_DB_USERNAME FOR LOGIN $SQL_DB_USERNAME;"

  # 3. Permissions
  query "$DB ALTER ROLE db_datareader ADD MEMBER $SQL_DB_USERNAME;"
  query "$DB ALTER ROLE db_datawriter ADD MEMBER $SQL_DB_USERNAME;"
  query "$DB ALTER ROLE db_ddladmin ADD MEMBER $SQL_DB_USERNAME;"
}

# Boot check
while ! query "SELECT 1;"; do
  echo "❌ MSSQL boot has failed, retrying"
  sleep 3
done

echo "⚠️ MSSQL is now running."

initialise

echo "✅ MSSQL has been initialised."

# Run process in the foreground
fg
