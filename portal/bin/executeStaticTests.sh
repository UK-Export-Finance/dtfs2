HERE=$(pwd)
LOG="$HERE/../pipeline.log"


start=`date +%s`

npm run lint
lintResult=$?

end=`date +%s`

[ $lintResult -eq 0 ] && echo "{\"stage\": \"portal:executeStaticTests:lint\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"portal:executeStaticTests:lint\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
[ $lintResult -ne 0 ] && exit $lintResult


start=`date +%s`

npm run test-quick
jestResult=$?

end=`date +%s`

[ $jestResult -eq 0 ] && echo "{\"stage\": \"portal:executeStaticTests:jest\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"portal:executeStaticTests:jest\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"

exit $jestResult
