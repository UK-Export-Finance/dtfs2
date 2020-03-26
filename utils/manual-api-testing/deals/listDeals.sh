TOKEN=$1

curl -H "Content-Type: application/json; charset=utf-8" -H "Authorization: Bearer $TOKEN" http://localhost:5001/api/deals
