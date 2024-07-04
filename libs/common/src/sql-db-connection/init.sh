#!/bin/bash
set -m

execute_sql_command() {
  /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "$1" > /dev/null
  return $?
}

get_now_unix_timestamp() {
  echo $(date +%s)
}

/opt/mssql/bin/sqlservr &

readonly time_limit_seconds=60
readonly interval_seconds=5
readonly start_time=$(get_now_unix_timestamp)

echo "⚡ Initialising MSSQL Server"

# Wait for SQL Server to start
while ! execute_sql_command "SELECT 1;"
do
  current_time=$(get_now_unix_timestamp)
  elapsed_seconds=$((current_time - start_time))

  if [ $elapsed_seconds -gt $time_limit_seconds ]; then
    echo "❌ Error: Failed to create database '$SQL_DB_NAME' - SQL Server did not start within $time_limit_seconds seconds."
    exit 1
  fi

  echo "❌ MSSQL failed to start after $elapsed_seconds seconds. Waiting for $interval_seconds more seconds."
  sleep $interval_seconds
done

echo "✅ MSSQL initialised, creating database '$SQL_DB_NAME'..."

# Create the database
execute_sql_command "CREATE DATABASE [$SQL_DB_NAME];"

echo "⚡Creating user '$SQL_DB_USERNAME'..."

# Create a new login
execute_sql_command "CREATE LOGIN $SQL_DB_USERNAME WITH PASSWORD = '$SQL_DB_PASSWORD';"

# Create a new user in the database and map it to the login
execute_sql_command "USE [$SQL_DB_NAME]; CREATE USER $SQL_DB_USERNAME FOR LOGIN $SQL_DB_USERNAME;"

# Grant the new user required permissions
execute_sql_command "USE [$SQL_DB_NAME]; ALTER ROLE db_datareader ADD MEMBER $SQL_DB_USERNAME;"
execute_sql_command "USE [$SQL_DB_NAME]; ALTER ROLE db_datawriter ADD MEMBER $SQL_DB_USERNAME;"
execute_sql_command "USE [$SQL_DB_NAME]; ALTER ROLE db_ddladmin ADD MEMBER $SQL_DB_USERNAME;"

fg
