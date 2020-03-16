echo Running update-heroku script

git checkout master && git pull --rebase
git checkout heroku-dtfs2-portal   && git pull --rebase && git merge --no-edit --commit master && git push
git checkout heroku-dtfs2-deal-api && git pull --rebase && git merge --no-edit --commit master && git push
git checkout master
