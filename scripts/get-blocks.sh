#! /bin/bash

BLOCKS=$(curl -s http://localhost:$1/blocks)

echo "on port $1:"
echo $BLOCKS | jq

# curl http://localhost:5002/blocks | jq
