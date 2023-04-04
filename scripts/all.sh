curl http://localhost:3001/blocks | jq
curl http://localhost:3002/blocks | jq

curl http://localhost:3001/peers | jq
curl http://localhost:3002/peers | jq

curl -H "Content-Type: application/json" --data '{"peer": "ws://node1:6001"}' http://localhost:3002/addPeer

curl http://localhost:3001/peers | jq
curl http://localhost:3002/peers | jq

curl http://localhost:3001/blocks | jq
curl http://localhost:3002/blocks | jq

curl -X POST http://localhost:3001/mineBlock | jq

curl http://localhost:3001/balance | jq
curl http://localhost:3002/balance | jq

curl http://localhost:3002/address | jq

response=$(curl http://localhost:3002/address)
address_node2=$(echo $response | jq -r '.address')

curl -H "Content-type: application/json" --data "{\"address\":\"$address_node2\", \"amount\":5}" http://localhost:3001/sendTransaction | jq

curl http://localhost:3001/blocks | jq
curl http://localhost:3002/blocks | jq

curl http://localhost:3001/peers | jq
curl http://localhost:3002/peers | jq

curl http://localhost:3001/balance | jq
curl http://localhost:3002/balance | jq

curl -X POST http://localhost:3001/mineBlock | jq

curl http://localhost:3001/transactionPool | jq
curl http://localhost:3002/transactionPool | jq

curl http://localhost:3001/balance | jq
curl http://localhost:3002/balance | jq
