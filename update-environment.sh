echo Running update-environment script

echo Ensuring root dependencies are up to date..
npm install

echo Ensuring deal-api dependencies are up to date..
cd deal-api && npm install

echo Ensuring portal dependencies are up to date..
cd ../portal && npm install

echo Ensuring utils/mock-data-loader dependencies are up to date..
cd ../utils/mock-data-loader && npm install
