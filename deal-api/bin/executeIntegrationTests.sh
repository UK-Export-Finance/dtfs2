HERE=$(pwd)
LOG="$HERE/../pipeline.log"

start=`date +%s`

npm run api-test-quick
testResult=$?

end=`date +%s`

[ $testResult -eq 0 ] && echo "{\"stage\": \"deal-api:executeIntegrationTests:tests\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"deal-api:executeIntegrationTests:tests\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
exit $testResult
