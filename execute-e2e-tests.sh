echo Running execute-e2e-tests script
start=`date +%s`
HOMEDIR=$(pwd)
LOG="$HOMEDIR/pipeline.log"

echo Updating dependencies
npm install

echo Launching docker-compose environment
docker-compose up -d --build

echo Executing tests
npx cypress run --spec "cypress/integration/**/*.spec.js"
testResult=$?

echo Cleaning docker-compose environment
docker-compose down

end=`date +%s`
[ $testResult -eq 0 ] && echo "api-tests execution time (seconds): $((end-start)) : pass" >> "$LOG" || echo "api-tests execution time (seconds): $((end-start)) : fail" >> "$LOG"

exit $testResult
