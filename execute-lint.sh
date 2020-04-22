start=`date +%s`
HOME=$(pwd)
LOG="$HOME/pipeline.log"

{
    npm run lint &&
    {
      end=`date +%s`
      echo "lint execution time (seconds): $((end-start)) : pass" >> "$LOG"
    }
} || {
  end=`date +%s`
  echo "lint execution time (seconds): $((end-start)) : fail" >> "$LOG"
  exit 1
}
