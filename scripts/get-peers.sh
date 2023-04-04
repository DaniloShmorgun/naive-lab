#! /bin/bash

PEERS=$(curl -s http://localhost:$1/peers)

echo "on port $1:"
echo $PEERS | jq
