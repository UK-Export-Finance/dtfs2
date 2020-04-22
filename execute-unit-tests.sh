echo Running execute-unit-tests script
start=`date +%s`
HOME=$(pwd)
LOG="$HOME/pipeline.log"

echo Executing unit tests for portal
{
  cd "$HOME/portal" && npm run test-quick &&
    {
      end=`date +%s`
      echo "unit-tests execution time (seconds): $((end-start)) : pass" >> "$LOG"
    }
} || {
  end=`date +%s`
  echo "unit-tests execution time (seconds): $((end-start)) : fail" >> "$LOG"
  exit 1
}
