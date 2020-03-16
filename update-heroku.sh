echo Running update-heroku script

git checkout master && git pull --rebase
git checkout heroku-dtfs2-portal  && git pull --rebase && git merge --no-edit --commit master && git push && git branch -d heroku-dtfs2-portal
git checkout heroku-dtfs2-deal-api && git pull --rebase && git merge --no-edit --commit master && git push && git branch -d heroku-dtfs2-deal-api
git checkout master
