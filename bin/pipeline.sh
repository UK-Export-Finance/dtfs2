#!/usr/bin/env bash

# Be a bit lenient here, but make sure we get a value set
HERE=${PWD}
if [ -z "$HERE" ]; then
    HERE=${pwd}
fi
if [ -z "$HERE" ]; then
    echo "Current directory not set. Halting."
    exit 1
fi
LOG="$HERE/pipeline.log"

# Set and check environment variables and secrets
for s in $(ls secrets/set_*); do 
    echo " - $s"
    source $s
done
if [ -f "secrets/companies_house_api_key.txt" ]; then
    export COMPANIES_HOUSE_API_KEY=$(cat secrets/companies_house_api_key.txt)
    echo "Set the Companies House API key."
fi

if [ -z "$AZURE_WORKFLOW_STORAGE_ACCOUNT" ]; then
    echo "WARNING: AZURE API KEYS NOT SET"
fi
if [ -z "$COMPANIES_HOUSE_API_KEY" ]; then
    echo "WARNING: COMPANIES HOUSE API KEY NOT SET"
fi
if [ -z "$GOV_NOTIFY_API_KEY" ]; then
    echo "WARNING: GOV NOTIFY API KEY NOT SET"
fi
if [ -z "$JWT_SIGNING_KEY" ]; then
    echo "WARNING: JWT KEY PAIR VALUES NOT SET"
fi

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

cd "$HERE/utils/mock-data-loader" && npm install && node ./re-insert-mocks.js

start=`date +%s`

docker-compose exec deal-api /bin/sh ./bin/api-test.sh
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
