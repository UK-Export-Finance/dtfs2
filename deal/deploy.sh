heroku container:push web --app dtfs-deal
heroku container:release web --app dtfs-deal
heroku logs --tail --app dtfs-deal
