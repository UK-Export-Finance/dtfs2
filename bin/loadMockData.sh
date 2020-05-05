HERE=$(pwd)
LOG="$HERE/pipeline.log"


start=`date +%s`
cd "$HERE/utils/mock-data-loader" && node ./re-insert-mocks.js
dockerComposeResult=$?

end=`date +%s`
[ $dockerComposeResult -eq 0 ] && echo "{\"stage\": \"cypress:loadData\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"cypress:loadData\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"

exit $dockerComposeResult
