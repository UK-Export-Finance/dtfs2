TOKEN=$1

curl -H "Content-Type: application/json; charset=utf-8" -H "Authorization: Bearer $TOKEN" http://localhost:5001/v1/deals/0/20/%7B%22isUsingAdvancedFilter%22:true,%22details.status%22:%7B%22$eq%22:%22Draft%22%7D%7D
