HERE=$(pwd)
LOG="$HERE/pipeline.log"


start=`date +%s`

cd "$HERE/portal" && ./bin/updateDependencies.sh && ./bin/executeStaticTests.sh
portalResult=$?

end=`date +%s`

[ $portalResult -eq 0 ] && echo "{\"stage\": \"portal\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"portal\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
[ $portalResult -ne 0 ] && exit $portalResult


start=`date +%s`

cd "$HERE/deal-api" && ./bin/updateDependencies.sh && ./bin/executeStaticTests.sh
apiResult=$?

end=`date +%s`

[ $apiResult -eq 0 ] && echo "{\"stage\": \"deal-api\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"deal-api\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
[ $apiResult -ne 0 ] && exit $apiResult


start=`date +%s`

cd "$HERE" && ./bin/updateDependencies.sh && ./bin/launchEnvironment.sh
testResult=$?

end=`date +%s`

[ $testResult -eq 0 ] && echo "{\"stage\": \"cypress:environment-startup\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"cypress\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
[ $testResult -ne 0 ] && exit $testResult

start=`date +%s`

echo "waiting 10 seconds to ensure mongo db has started before we run integration tests against it.."
sleep 10

end=`date +%s`
echo "{\"stage\": \"cypress:wait-for-mongo\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG"


start=`date +%s`

cd "$HERE/deal-api" && ./bin/executeIntegrationTests.sh
apiTestResults=$?

end=`date +%s`

[ $apiTestResults -eq 0 ] && echo "{\"stage\": \"cypress:environment-startup\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"cypress\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
[ $apiTestResults -ne 0 ] && exit $apiTestResults


start=`date +%s`

cd "$HERE" && ./bin/loadMockData.sh
loadDataResult=$?

end=`date +%s`

[ $loadDataResult -eq 0 ] && echo "{\"stage\": \"cypress:environment-startup\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"cypress\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
[ $loadDataResult -ne 0 ] && exit $loadDataResult

start=`date +%s`

cd "$HERE" && ./bin/executeE2ETests.sh
cypressResult=$?

end=`date +%s`

[ $cypressResult -eq 0 ] && echo "{\"stage\": \"cypress:environment-startup\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"cypress\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"

start=`date +%s`
docker-compose down
dockerDownResult=$?
end=`date +%s`
[ $dockerDownResult -eq 0 ] && echo "{\"stage\": \"cypress:stopDocker\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"cypress:stopDocker\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"


exit $cypressResult
