echo Running execute-component-tests script
start=`date +%s`
HOME=$(pwd)
LOG="$HOME/pipeline.log"

echo Executing component tests for portal
{
  cd "$HOME/portal" && npm run component-test &&
    {
      end=`date +%s`
      echo "component-tests execution time (seconds): $((end-start)) : pass" >> "$LOG"
    }
} || {
  end=`date +%s`
  echo "component-tests execution time (seconds): $((end-start)) : fail" >> "$LOG"
  exit 1
}
