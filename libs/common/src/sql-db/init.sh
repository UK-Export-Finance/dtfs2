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

echo "Waiting for SQL Server to start..."

# Wait for SQL Server to start
while ! execute_sql_command "SELECT 1;"
do
  current_time=$(get_now_unix_timestamp)
  elapsed_seconds=$((current_time - start_time))

  if [ $elapsed_seconds -gt $time_limit_seconds ]; then
    echo "Error: Failed to create database '$DB_NAME' - SQL Server did not start within $time_limit_seconds seconds."
    exit 1
  fi

  echo "SQL Server not yet started after $elapsed_seconds seconds. Waiting for $interval_seconds more seconds..."
  sleep $interval_seconds
done

echo "SQL Server has started! Attempting to create database '$DB_NAME'..."

# Create the database
execute_sql_command "CREATE DATABASE [$DB_NAME];"

fg
