HERE=$(pwd)
LOG="$HERE/pipeline.log"


start=`date +%s`
docker-compose up -d --build
dockerComposeResult=$?

end=`date +%s`
[ $dockerComposeResult -eq 0 ] && echo "{\"stage\": \"docker-compose:up\", \"duration\": \"$((end-start))\", \"result\": \"pass\"}" >> "$LOG" || echo "{\"stage\": \"docker-compose:up\", \"duration\": \"$((end-start))\", \"result\": \"fail\"}" >> "$LOG"

exit $dockerComposeResult
