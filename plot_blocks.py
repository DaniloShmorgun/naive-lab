import json
import matplotlib.pyplot as plt

# Load blocks data from JSON file
with open('blocks.json', 'r') as f:
    blocks = json.load(f)

# Extract difficulty, nonce, and number of transactions from the blocks
difficulty_values = [block['difficulty'] for block in blocks]
nonce_values = [block['nonce'] for block in blocks]
transaction_counts = [len(block['data']) for block in blocks]

# Calculate total coins mined, total coins sent through transactions, and total rewards earned for all addresses
address_stats = {}

for block in blocks:
    for tx in block['data']:
        for tx_out in tx['txOuts']:
            address = tx_out['address']
            amount = tx_out['amount']
            if address not in address_stats:
                address_stats[address] = {
                    'total_mined': 0,
                    'total_sent': 0,
                    'total_reward': 0
                }
            if tx['txIns'][0]['signature'] == '':
                address_stats[address]['total_mined'] += amount
                address_stats[address]['total_reward'] += amount
            else:
                address_stats[address]['total_sent'] += amount

for address, stats in address_stats.items():
    print(f'Address: {address}')
    print(f'  Total coins mined: {stats["total_mined"]}')
    print(f'  Total coins sent through transactions: {stats["total_sent"]}')
    print(f'  Total rewards earned: {stats["total_reward"]}')
    print()

# Create three separate plots: one for difficulty, one for number of transactions, and one for nonce
fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(6, 12))
fig.suptitle('Difficulty, Number of Transactions, and Nonce')

# Plot difficulty values
ax1.scatter(range(len(blocks)), difficulty_values, marker='o')
ax1.set_ylabel('Difficulty')

# Plot number of transactions
ax2.scatter(range(len(blocks)), transaction_counts, marker='o')
ax2.set_ylabel('Number of Transactions')

# Plot nonce values
ax3.scatter(range(len(blocks)), nonce_values, marker='o')
ax3.set_ylabel('Nonce')
ax3.set_xlabel('Block Index')

# Display the plots
plt.show()
