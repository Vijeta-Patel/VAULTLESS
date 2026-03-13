// ============================================================
// FILE: src/lib/ethereum.js
// ============================================================
import { ethers } from 'ethers'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_KEY

const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "bytes32", "name": "commitmentHash", "type": "bytes32" }],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "nullifier", "type": "bytes32" }],
    "name": "authenticate",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "triggerDuress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "newHash", "type": "bytes32" }],
    "name": "refine",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "authFailed",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "identities",
    "outputs": [
      { "internalType": "bytes32", "name": "commitmentHash", "type": "bytes32" },
      { "internalType": "uint256", "name": "enrolledAt", "type": "uint256" },
      { "internalType": "bool", "name": "isLocked", "type": "bool" },
      { "internalType": "bool", "name": "exists", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "Registered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "bytes32", "name": "nullifier", "type": "bytes32" }
    ],
    "name": "AuthSuccess",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "AuthFailed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "DuressActivated",
    "type": "event"
  }
]

function demoTx(label) {
  const hash = '0xDEMO' + Math.random().toString(16).slice(2, 14).padEnd(12, '0')
  console.log(`[VAULTLESS] DEMO: ${label} — ${hash}`)
  return {
    hash,
    wait: async () => ({ transactionHash: hash, status: 1 })
  }
}

export async function connectWallet() {
  if (DEMO_MODE) {
    const addr = '0xDEMO' + Math.random().toString(16).slice(2, 10).padEnd(8, '0').toUpperCase() + '1234'
    console.log('[VAULTLESS] DEMO: wallet connected —', addr)
    return addr
  }
  if (!window.ethereum) throw new Error('MetaMask not installed')
  const provider = new ethers.BrowserProvider(window.ethereum)
  await provider.send('eth_requestAccounts', [])
  const signer = await provider.getSigner()
  const address = await signer.getAddress()
  console.log('[VAULTLESS] Wallet connected:', address)
  return address
}

function getContract() {
  if (!window.ethereum) throw new Error('MetaMask not installed')
  const provider = new ethers.BrowserProvider(window.ethereum)
  return provider.getSigner().then(signer => new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer))
}

export async function registerIdentity(vectorHash) {
  if (DEMO_MODE) return demoTx('register')
  const contract = await getContract()
  const tx = await contract.register(vectorHash)
  console.log('[VAULTLESS] Registered on-chain:', tx.hash)
  return tx
}

export async function authenticateIdentity(nullifier) {
  if (DEMO_MODE) return demoTx('authenticate')
  const contract = await getContract()
  const tx = await contract.authenticate(nullifier)
  console.log('[VAULTLESS] Authenticated on-chain:', tx.hash)
  return tx
}

export async function triggerDuressOnChain() {
  if (DEMO_MODE) return demoTx('triggerDuress')
  const contract = await getContract()
  const tx = await contract.triggerDuress()
  console.log('[VAULTLESS] Duress triggered on-chain:', tx.hash)
  return tx
}

export async function recordAuthFailed() {
  if (DEMO_MODE) return demoTx('authFailed')
  const contract = await getContract()
  const tx = await contract.authFailed()
  console.log('[VAULTLESS] AuthFailed logged on-chain:', tx.hash)
  return tx
}

export function getEtherscanLink(txHash) {
  return `https://sepolia.etherscan.io/tx/${txHash}`
}

export async function getIdentity(address) {
  if (DEMO_MODE) {
    return {
      commitmentHash: '0x' + Math.random().toString(16).slice(2).padEnd(64, '0'),
      enrolledAt: BigInt(Math.floor(Date.now() / 1000)),
      isLocked: false,
      exists: true
    }
  }
  const provider = new ethers.JsonRpcProvider(
    `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`
  )
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
  return contract.identities(address)
}

export function listenToEvents(callback) {
  if (DEMO_MODE) {
    // Simulate periodic events in demo mode
    const events = ['Registered', 'AuthSuccess', 'AuthFailed', 'DuressActivated']
    const interval = setInterval(() => {
      const event = events[Math.floor(Math.random() * events.length)]
      const txHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0')
      callback({ event, txHash, timestamp: Date.now() })
    }, 8000)
    return () => clearInterval(interval)
  }

  if (!window.ethereum) return () => {}
  const provider = new ethers.BrowserProvider(window.ethereum)
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

  const handleEvent = (eventName) => (...args) => {
    const event = args[args.length - 1]
    callback({ event: eventName, txHash: event.log?.transactionHash, timestamp: Date.now() })
    console.log(`[VAULTLESS] Event: ${eventName}`, event)
  }

  contract.on('Registered', handleEvent('Registered'))
  contract.on('AuthSuccess', handleEvent('AuthSuccess'))
  contract.on('AuthFailed', handleEvent('AuthFailed'))
  contract.on('DuressActivated', handleEvent('DuressActivated'))

  return () => contract.removeAllListeners()
}
