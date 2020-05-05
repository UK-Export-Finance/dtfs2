HERE=$(pwd)
LOG="$HERE/pipeline.log"


start=`date +%s`


npm install
testResult=$?


end=`date +%s`

[ $testResult -eq 0 ] && echo "{\"stage\": \"pipeline:updateCypressDependencies\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"pipeline:updateCypressDependencies\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
exit $testResult
