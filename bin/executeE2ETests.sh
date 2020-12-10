HERE=$(pwd)
LOG="$HERE/pipeline.log"

start=`Start E2E Portal: date +%s`

cd e2e-tests/portal
npx cypress run --spec "cypress/integration/**/*.spec.js" --config video=false
testResult=$?

end=`End E2E Portal: date +%s`

[ $testResult -eq 0 ] && echo "{\"stage\": \"pipeline:cypress:tests\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"pipeline:cypress:tests\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"


exit $testResult
