HERE=$(pwd)
if [ -f "secrets/companies_house_api_key.txt" ]; then
    export COMPANIES_HOUSE_API_KEY=$(cat secrets/companies_house_api_key.txt)
    echo "Set the Companies House API key."
fi

if [ -f "secrets/set_azure_api_keys.sh" ]; then
    source ./secrets/set_azure_api_keys.sh
    echo "API keys set"
else
    if [ -z "$AZURE_WORKFLOW_STORAGE_ACCOUNT" ]; then
        echo "WARNING: AZURE API KEYS NOT SET"
    fi
fi

LOG="$HERE/pipeline.log"

pipelinestart=`date +%s`

start=`date +%s`

cd "$HERE" && docker-compose up -d --build
testResult=$?

end=`date +%s`

[ $testResult -eq 0 ] && echo "{\"stage\": \"pipeline:environment-startup\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"pipeline:envirionment-startup\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
[ $testResult -ne 0 ] && exit $testResult

start=`date +%s`

echo "waiting 10 seconds to ensure mongo db has started before we run integration tests against it.."
sleep 10

end=`date +%s`
echo "{\"stage\": \"pipeline:wait-for-mongo\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG"


start=`date +%s`

docker exec deal-api env
docker exec deal-api curl -v deal-api-data:27017
docker exec deal-api curl -v localhost:5001
docker logs deal-api
docker exec deal-api /bin/sh ./bin/api-test.sh
apiTestResults=$?

end=`date +%s`

[ $apiTestResults -eq 0 ] && echo "{\"stage\": \"pipeline:deal-api-integration-tests\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"pipeline:deal-api-integration-tests\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
[ $apiTestResults -ne 0 ] && exit $apiTestResults


start=`date +%s`

cd "$HERE/utils/mock-data-loader" && node ./re-insert-mocks.js
loadDataResult=$?

end=`date +%s`

[ $loadDataResult -eq 0 ] && echo "{\"stage\": \"pipeline:prepare-data\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"pipeline:prepare-data\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
[ $loadDataResult -ne 0 ] && exit $loadDataResult

start=`date +%s`

cd "$HERE" && ./bin/updateDependencies.sh && ./bin/executeE2ETests.sh
cypressResult=$?

end=`date +%s`

[ $cypressResult -eq 0 ] && echo "{\"stage\": \"pipeline:cypress\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"pipeline:cypress\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"

start=`date +%s`
docker-compose down
dockerDownResult=$?
end=`date +%s`
[ $dockerDownResult -eq 0 ] && echo "{\"stage\": \"pipeline:environment-shutdown\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"pipeline:environment-shutdown\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"

echo "{\"stage\": \"pipeline\", \"duration\": \"$((end-pipelinestart))\", \"result\": \"pass\"}" >> "$LOG"
exit $cypressResult
