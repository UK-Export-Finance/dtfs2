HERE=$(pwd)
LOG="$HERE/pipeline.log"


start=`date +%s`

cd "$HERE/portal" && npm run ci:dockerise
portalResult=$?

end=`date +%s`

[ $portalResult -eq 0 ] && echo "{\"stage\": \"portal\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"portal\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
[ $portalResult -ne 0 ] && exit $portalResult


start=`date +%s`

cd "$HERE/deal-api" && npm run ci:dockerise
apiResult=$?

end=`date +%s`

[ $apiResult -eq 0 ] && echo "{\"stage\": \"deal-api\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"deal-api\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
[ $apiResult -ne 0 ] && exit $apiResult


start=`date +%s`

cd "$HERE" && ./bin/updateDependencies.sh && ./bin/executeE2ETests.sh
testResult=$?

end=`date +%s`

[ $testResult -eq 0 ] && echo "{\"stage\": \"cypress\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"cypress\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
exit $testResult
