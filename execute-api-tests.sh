echo Running execute-api-tests script
start=`date +%s`
HOME=$(pwd)
LOG="$HOME/pipeline.log"

echo Executing api tests for deal-api
cd "$HOME/deal-api" && docker-compose up -d

echo "Giving mongo 10 seconds to start.."
sleep 10
# not found a good approach here; it starts responding to port requests before it's able to take connections...

{
  npm run api-test-quick &&
    {
      docker-compose down

      end=`date +%s`
      echo "api-tests execution time (seconds): $((end-start)) : pass" >> "$LOG"
    }
} || {
  docker-compose down

  end=`date +%s`
  echo "api-tests execution time (seconds): $((end-start)) : fail" >> "$LOG"
  exit 1
}
