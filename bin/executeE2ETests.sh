HERE=$(pwd)
LOG="$HERE/pipeline.log"

starttfm=`date +%s`

cd "$HERE/e2e-tests/trade-finance-manager"
npx cypress run --spec "cypress/integration/**/*.spec.js" --config video=false
testResult=$?

endtfm=`date +%s`
[ $testResult -eq 0 ] && echo "{\"stage\": \"pipeline:cypress:tests-tfm\", \"duration\": \"$((endtfm-starttfm))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"pipeline:cypress:tests-tfm\", \"duration\": \"$((endtfm-starttfm))\", \"result\": \"fail\"}" >> "$LOG"


start=`date +%s`

cd "$HERE/e2e-tests/portal"
npx cypress run --spec "cypress/integration/**/*.spec.js" --config video=false
testResult=$?

end=`date +%s`
[ $testResult -eq 0 ] && echo "{\"stage\": \"pipeline:cypress:tests-portal\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"pipeline:cypress:tests-portal\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"

cd "$HERE"

exit $testResult
