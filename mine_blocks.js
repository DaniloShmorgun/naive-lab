const axios = require('axios');

const nodes = [
  'http://localhost:5001',
  'http://localhost:5002',
  'http://localhost:5003',
  'http://localhost:5004',
];

let blockCount = 0;
let transactionCount = 0;

// Generate a random number between min and max (inclusive)
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Mine a block on a random node
async function mineBlock() {
  const node = nodes[getRandomInt(0, nodes.length - 1)];
  console.log(`Mining block on node: ${node}`);
  try {
    const response = await axios.post(`${node}/mineBlock`);
    console.log('Mined block:', response.data);
    blockCount++; // increment block count
  } catch (error) {
    console.error('Error mining block:', error.message);
  }
}

// Get the address and balance for a node
async function getAddressAndBalance(node) {
  try {
    const addressResponse = await axios.get(`${node}/address`);
    const address = addressResponse.data.address;

    const balanceResponse = await axios.get(`${node}/balance`);
    const balance = balanceResponse.data.balance;

    return { address, balance };
  } catch (error) {
    console.error('Error fetching address and balance:', error.message);
    return null;
  }
}

// Create a valid transaction on a random node
async function createValidTransaction() {
  const senderNode = nodes[getRandomInt(0, nodes.length - 1)];
  const sender = await getAddressAndBalance(senderNode);

  if (!sender || sender.balance === 0) {
    console.log('No funds available for a transaction.');
    return;
  }

  const receiverNode = nodes.find((node) => node !== senderNode);
  const receiver = await getAddressAndBalance(receiverNode);

  if (!receiver) {
    console.log('Unable to fetch receiver address.');
    return;
  }

  console.log(`Creating transaction from ${senderNode} to ${receiverNode}`);

  const randomAmount = getRandomInt(1, sender.balance);

  try {
    const response = await axios.post(`${senderNode}/sendTransaction`, {
      address: receiver.address,
      amount: randomAmount,
    });
    console.log('Created transaction:', response.data);
    transactionCount++; // increment transaction count
  } catch (error) {
    console.error('Error creating transaction:', error.message);
  }
}

let toStop = false;

// Main function
async function main() {
  const startTimestamp = Date.now();

  while (true) {
    if (toStop) { break; }

    const action = getRandomInt(0, 1);

    if (action === 0) {
      await mineBlock();
    } else {
      await createValidTransaction();
    }

    // await new Promise((resolve) => setTimeout(resolve, getRandomInt(10, 100)));
  }

  const endTimestamp = Date.now();

  console.log(`Mining completed. Mined ${blockCount} blocks and created ${transactionCount} transactions in ${endTimestamp - startTimestamp}ms.`);
}

process.on('SIGINT', async () => {
  console.log('SIGINT signal received. Stopping mining...');

  toStop = true;

  // process.exit();
});

main().catch((error) => {
  console.error('Error in main function:', error.message);
});
