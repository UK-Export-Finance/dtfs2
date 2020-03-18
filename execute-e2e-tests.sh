echo Running execute-e2e-tests script
HOME=$(pwd)

docker-compose up -d --build

echo "Waiting for portal to be available on localhost:5000..."

while ! nc -z localhost 5000; do
  sleep 0.1 # wait for 1/10 of the second before check again
done

#//TODO - why can't cypress find itself when i call it like this!>!?!?!?!
( cd "$HOME/e2e-tests" ; npx cypress run )

docker-compose down
