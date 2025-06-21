import { ethers } from "ethers";

// Contract ABI - replace with your actual contract ABI
const CONTRACT_ABI = [
  "function awardItem(address player, string memory tokenURI) public returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)"
];

// Contract address - replace with your actual deployed contract address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

// Validate contract address
function validateContractAddress(address: string): boolean {
  try {
    // Check if it's a valid Ethereum address
    if (!ethers.isAddress(address)) {
      return false;
    }
    // Check if it's not the zero address
    if (address === "0x0000000000000000000000000000000000000000") {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function getContract(signer: ethers.Signer) {
  if (!validateContractAddress(CONTRACT_ADDRESS)) {
    throw new Error("Invalid contract address. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable with a valid deployed contract address.");
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export function getContractReadOnly(provider: ethers.Provider) {
  if (!validateContractAddress(CONTRACT_ADDRESS)) {
    throw new Error("Invalid contract address. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable with a valid deployed contract address.");
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
} 