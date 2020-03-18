echo Running execute-api-tests script
HOME=$(pwd)

echo Executing api tests for deal-api
cd "$HOME/deal-api" && docker-compose up -d

echo "Giving mongo 10 seconds to start.."
sleep 10
# not found a good approach here; it starts responding to port requests before it's able to take connections...

cd "$HOME/deal-api" && npm run api-test && docker-compose down

#echo Executing unit tests for portal
#cd "$HOME/portal" && npm test
