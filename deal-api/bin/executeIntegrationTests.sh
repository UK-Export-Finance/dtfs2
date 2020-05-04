HERE=$(pwd)
LOG="$HERE/../pipeline.log"


start=`date +%s`
docker-compose up -d
dockerComposeResult=$?

[ $dockerComposeResult -eq 0 ] && echo "Giving mongo 10 seconds to start.." && sleep 10

end=`date +%s`
[ $dockerComposeResult -eq 0 ] && echo "{\"stage\": \"deal-api:executeIntegrationTests:startMongo\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"deal-api:executeIntegrationTests:startMongo\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
[ $dockerComposeResult -ne 0 ] && exit $dockerComposeResult




start=`date +%s`

npm run api-test-quick
testResult=$?

end=`date +%s`

[ $testResult -eq 0 ] && echo "{\"stage\": \"deal-api:executeIntegrationTests:tests\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"deal-api:executeIntegrationTests:tests\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"


start=`date +%s`
docker-compose down
dockerDownResult=$?
end=`date +%s`
[ $dockerDownResult -eq 0 ] && echo "{\"stage\": \"deal-api:executeIntegrationTests:stopMongo\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"deal-api:executeIntegrationTests:stopMongo\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"

exit $testResult
