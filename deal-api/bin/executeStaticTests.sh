HERE=$(pwd)
LOG="$HERE/../pipeline.log"


start=`date +%s`

npm run lint
lintResult=$?

end=`date +%s`

[ $lintResult -eq 0 ] && echo "{\"stage\": \"deal-api:executeStaticTests:lint\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"deal-api:executeStaticTests:lint\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
exit $lintResult
