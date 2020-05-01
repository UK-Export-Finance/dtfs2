HERE=$(pwd)
LOG="$HERE/../pipeline.log"


start=`date +%s`

docker build .
buildResult=$?

end=`date +%s`

[ $buildResult -eq 0 ] && echo "{\"stage\": \"deal-api:buildDockerImage\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"deal-api:buildDockerImage\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"

exit $buildResult
