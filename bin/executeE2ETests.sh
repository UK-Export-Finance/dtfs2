HERE=$(pwd)
LOG="$HERE/pipeline.log"

start=`date +%s`

npx cypress run --spec "cypress/integration/**/*.spec.js" --config video=false
testResult=$?

end=`date +%s`

[ $testResult -eq 0 ] && echo "{\"stage\": \"pipeline:cypress:tests\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"pipeline:cypress:tests\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"


exit $testResult
