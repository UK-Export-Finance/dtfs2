echo Running execute-unit-tests script
HOME=$(pwd)

#echo Executing unit tests for deal-api
#cd "$HOME/deal-api" && npm run unit-test
#cp -rf "$HOME/deal-api/reports" ./reports

echo Executing unit tests for portal
cd "$HOME/portal" && npm run test-quick
