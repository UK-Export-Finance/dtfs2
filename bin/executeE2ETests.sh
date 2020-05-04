HERE=$(pwd)
LOG="$HERE/pipeline.log"


start=`date +%s`
docker-compose up -d
dockerComposeResult=$?

end=`date +%s`
[ $dockerComposeResult -eq 0 ] && echo "{\"stage\": \"cypress:startDocker\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"cypress:startDocker\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"
[ $dockerComposeResult -ne 0 ] && exit $dockerComposeResult




start=`date +%s`

npx cypress run --spec "cypress/integration/**/*.spec.js" --config video=false
testResult=$?

end=`date +%s`

[ $testResult -eq 0 ] && echo "{\"stage\": \"cypress:tests\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"cypress:tests\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"


start=`date +%s`
docker-compose down
dockerDownResult=$?
end=`date +%s`
[ $dockerDownResult -eq 0 ] && echo "{\"stage\": \"cypress:stopDocker\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"cypress:stopDocker\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"

exit $testResult
