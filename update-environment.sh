HOME=$(pwd)
LOG="$HOME/pipeline.log"

echo Running update-environment script
start=`date +%s`

runtime=$((end-start))
echo Ensuring root dependencies are up to date..
npm install

echo Ensuring deal-api dependencies are up to date..
cd deal-api && npm install

echo Ensuring portal dependencies are up to date..
cd ../portal && npm install

# [dw] removing this dependency for now;
# //TODO think about where these 'utils' really live; presumably under their 'owning' service?
#echo Ensuring utils/mock-data-loader dependencies are up to date..
#cd ../utils/mock-data-loader && npm install

end=`date +%s`
echo "update-environment execution time (seconds): $((end-start)) : pass" >> "$LOG"
