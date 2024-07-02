#!/bin/bash


restart_docker_sql_container() {
  docker restart $container_name
  return $?
}

execute_docker_sql_command() {
  docker exec $container_name //opt//mssql-tools//bin//sqlcmd -S localhost -U sa -P "AbC!2345" -Q "$1"
  return $?
}

readonly container_name=dtfs2-dtfs-sql-1
readonly container_start_wait_time=20

echo "Restarting docker container '$container_name'..."

restart_docker_sql_container

echo "Waiting $container_start_wait_time seconds for container to start..."
sleep $container_start_wait_time

echo "Attempting to drop and recreate database '$SQL_DB_NAME'..."

execute_docker_sql_command "DROP DATABASE $SQL_DB_NAME"
execute_docker_sql_command "CREATE DATABASE $SQL_DB_NAME"

echo "Successfully recreated database '$SQL_DB_NAME'"

echo "Attempting to create database user '$1' for database '$SQL_DB_NAME'..."

# Create a new user in the database and map it to the login
execute_docker_sql_command "USE [$SQL_DB_NAME]; CREATE USER $1 FOR LOGIN $1;"

# Grant the new user required permissions
execute_docker_sql_command "USE [$SQL_DB_NAME]; ALTER ROLE db_datareader ADD MEMBER $1;"
execute_docker_sql_command "USE [$SQL_DB_NAME]; ALTER ROLE db_datawriter ADD MEMBER $1;"
execute_docker_sql_command "USE [$SQL_DB_NAME]; ALTER ROLE db_ddladmin ADD MEMBER $1;"
