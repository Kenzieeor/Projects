// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Azuki is Ownable, ReentrancyGuard, ERC721Enumerable {
    // CONFIGURATION
    bool public paused = false;
    string private baseTokenURI;

    // MINT TIME
    uint256 public publicStart;

    // ROYALTIES
    uint256 public totalRoyalties;
    uint256 public currentRoyalties;
    uint256 public mintRewards;

    // MAPPING
    mapping(uint256 => uint256) public claimedRoyalties;
    mapping(address => uint256) public mintedPerWallet;

    // CONSTANT
    uint256 public constant MAX_SUPPLY = 200;
    uint256 public constant MINT_ROYALTIES = 10;

    // EVENTS
    event Minted(uint256 amount);
    event RoyaltiesAdded(uint256 amount);
    event BaseURIChanged(string newBaseURI);
    event PausedStateChanged(bool paused);
    event RoyaltiesClaimed(address indexed user, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        string memory uri
    ) ERC721(name, symbol) {
        baseTokenURI = uri;
    }

    // MINT
    function mint(uint256 amount) external payable {
        uint256 supply = totalSupply();
        require(!paused, "Minting is paused");
        require(block.timestamp >= publicStart, "Minting not started yet");
        require(amount > 0, "Amount must be greater than zero");
        require(supply + amount <= MAX_SUPPLY, "Exceeds max supply");

        if (supply < 100) {
            require(mintedPerWallet[msg.sender] == 0, "Already minted");
            require(amount == 1, "Can only mint 1 token");
        }

        uint256 totalCost = getPrice(amount);
        require(msg.value == totalCost, "Incorrect CRO amount");

        // Minting
        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = supply + i + 1;
            _safeMint(msg.sender, tokenId);
            claimedRoyalties[tokenId] = currentRoyalties;
        }

        if (supply < 100) {
            mintedPerWallet[msg.sender] = 1;
        }

        uint256 newSupply = totalSupply();
        if (msg.value > 0 && newSupply > 0) {
            uint256 royalties = (msg.value * MINT_ROYALTIES) / 100;
            _addRewards(royalties);
            mintRewards += msg.value - royalties;
        }

        emit Minted(amount);
    }

    // TEAM MINT
    function teamMint(uint256 amount, address to) external onlyOwner {
        uint256 supply = totalSupply();
        require(!paused, "Minting is paused");
        require(amount > 0, "Amount must be greater than zero");
        require(supply + amount <= MAX_SUPPLY, "Exceeds max supply");

        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = supply + i + 1;
            _safeMint(to, tokenId);
            claimedRoyalties[tokenId] = currentRoyalties;
        }

        emit Minted(amount);
    }

    // GET PRICE
    function getPrice(uint256 amount) public view returns (uint256) {
        require(amount > 0, "Amount must be greater than zero");
        uint256 supply = totalSupply();
        uint256 totalCost;
        for (uint256 i = 1; i <= amount; i++) {
            uint256 tokenId = supply + i;
            if (tokenId <= 100) {
                totalCost += 1 ether;
            } else {
                totalCost += 2 ether;
            }
        }
        return totalCost;
    }

    // METADATA
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseTokenURI = newBaseURI;
        emit BaseURIChanged(newBaseURI);
    }

    // ROYALTIES
    function addRoyalties() external payable {
        _addRewards(msg.value);
    }

    function _addRewards(uint256 amount) internal {
        require(amount > 0, "Amount must be greater than zero");
        require(totalSupply() > 0, "No tokens minted");

        totalRoyalties += amount;
        currentRoyalties += amount / totalSupply();

        emit RoyaltiesAdded(amount);
    }

    function getRewardsToken(uint256 id) public view returns (uint256) {
        return currentRoyalties - claimedRoyalties[id];
    }

    function getRoyalties(address user) external view returns (uint256) {
        uint256 balance;
        uint256 count = balanceOf(user);
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            balance += getRewardsToken(tokenId);
        }
        return balance;
    }

    function claimRoyalties(uint256[] memory tokensToClaim) external nonReentrant {
        uint256 rewards;
        for (uint256 i = 0; i < tokensToClaim.length; i++) {
            uint256 tokenId = tokensToClaim[i];
            require(ownerOf(tokenId) == msg.sender, "Not token owner");
            rewards += getRewardsToken(tokenId);
            claimedRoyalties[tokenId] = currentRoyalties;
        }

        require(rewards > 0, "No royalties to claim");
        payable(msg.sender).transfer(rewards);

        emit RoyaltiesClaimed(msg.sender, rewards);
    }

    function claimAllRoyalties() external nonReentrant {
        uint256 rewards;
        uint256 count = balanceOf(msg.sender);
        require(count > 0, "You don't own any tokens");

        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(msg.sender, i);
            rewards += getRewardsToken(tokenId);
            claimedRoyalties[tokenId] = currentRoyalties;
        }

        require(rewards > 0, "No royalties to claim");
        payable(msg.sender).transfer(rewards);

        emit RoyaltiesClaimed(msg.sender, rewards);
    }

    // OWNER CONFIG
    function setMintTime(uint256 _publicStart) external onlyOwner {
        publicStart = _publicStart;
    }

    function getMintTime() external view returns (uint256 publicMint) {
        return publicStart;
    }

    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 count = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokenIds;
    }

    function togglePause() external onlyOwner {
        paused = !paused;
        emit PausedStateChanged(paused);
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 amount = mintRewards;
        require(amount > 0, "No funds to withdraw");
        mintRewards = 0;
        payable(owner()).transfer(amount);

        emit Withdrawn(owner(), amount);
    }
}
