export const DRAGON_ROUTER_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_key",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "_values",
				"type": "uint256[]"
			},
			{
				"internalType": "address[]",
				"name": "_targets",
				"type": "address[]"
			},
			{
				"internalType": "bytes[]",
				"name": "_payloads",
				"type": "bytes[]"
			}
		],
		"name": "execute",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "_targets",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "_values",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256",
				"name": "_fee",
				"type": "uint256"
			}
		],
		"name": "withdraw2users",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "withdrawETH",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "withdrawToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
]