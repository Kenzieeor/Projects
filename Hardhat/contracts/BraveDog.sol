// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract BraveDog is Ownable, ReentrancyGuard, ERC721Enumerable {
    // CONFIGURATION
    bool public paused = false;
    string private baseTokenURI;

    // MINT TIME
    uint256 public freemintStart;
    uint256 public whitelistStart;
    uint256 public publicStart;

    // MAPPING
    mapping(address => bool) public freemintWallets;
    mapping(address => bool) public whitelistWallets;
    mapping(address => uint256) public freemintMinted;
    mapping(address => uint256) public whitelistMinted;
    mapping(uint256 => uint256) public claimedRoyalties;

    // ROYALTIES
    uint256 public totalRoyalties;
    uint256 public currentRoyalties;
    uint256 public mintRewards;

    // CONSTANT
    uint256 public constant MAX_SUPPLY = 30;
    uint256 public constant FREEMINT_PRICE = 0 ether;
    uint256 public constant WHITELIST_PRICE = 1 ether;
    uint256 public constant PUBLIC_PRICE = 2 ether;
    uint256 public constant FREEMINT_MAXS = 1;
    uint256 public constant WHITELIST_MAXS = 10;
    uint256 public constant MINT_ROYALTIES = 10;

    // EVENT
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
        require(amount > 0, "Amount must be greater than zero");
        require(supply + amount <= MAX_SUPPLY, "Exceeds max supply");

        uint256 price;
        if (block.timestamp >= publicStart) {
            price = PUBLIC_PRICE;
            require(msg.value == price * amount, "Incorrect CRO for public mint");
        } else if (block.timestamp >= whitelistStart) {
            price = WHITELIST_PRICE;
            require(whitelistWallets[msg.sender], "Not in whitelist");
            require(whitelistMinted[msg.sender] + amount <= WHITELIST_MAXS, "Exceeds whitelist allocation");
            require(msg.value == price * amount, "Incorrect CRO for whitelist mint");
            whitelistMinted[msg.sender] += amount;
        } else if (block.timestamp >= freemintStart) {
            price = FREEMINT_PRICE;
            require(freemintWallets[msg.sender], "Not in freemint list");
            require(freemintMinted[msg.sender] + amount <= FREEMINT_MAXS, "Exceeds freemint allocation");
            require(msg.value == price * amount, "Incorrect CRO for freemint");
            freemintMinted[msg.sender] += amount;
        } else {
            revert("Minting not started");
        }

        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = supply + i + 1;
            _safeMint(msg.sender, tokenId);
            claimedRoyalties[tokenId] = currentRoyalties;
        }

        uint256 newSupply = totalSupply();
        if (price > 0 && newSupply > 0) {
            uint256 royalties = (msg.value * MINT_ROYALTIES) / 100;
            _addRewards(royalties);
            mintRewards += msg.value - royalties;
        }

        emit Minted(amount);
    }

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

    // METADATA
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseTokenURI = newBaseURI;
        emit BaseURIChanged(newBaseURI);
    }

    // ROYALTIES CONFIGURATION
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

    function claimRoyalties(
        uint256[] memory tokensToClaim
    ) external nonReentrant {
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

    function setMintTime(
        uint256 _freemintStart,
        uint256 _whitelistStart,
        uint256 _publicStart
    ) external onlyOwner {
        require(
            _freemintStart < _whitelistStart && _whitelistStart < _publicStart,
            "Invalid mint time order"
        );

        freemintStart = _freemintStart;
        whitelistStart = _whitelistStart;
        publicStart = _publicStart;
    }

    function getMintTime()
        external
        view
        returns (uint256 freemint, uint256 whitelist, uint256 publicMint)
    {
        return (freemintStart, whitelistStart, publicStart);
    }

    function tokensOfOwner(
        address owner
    ) external view returns (uint256[] memory) {
        uint256 count = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokenIds;
    }

    // WHITELIST
    function addFreemint(address[] calldata wallets) external onlyOwner {
        for (uint256 i = 0; i < wallets.length; i++) {
            freemintWallets[wallets[i]] = true;
        }
    }

    function addWhitelist(address[] calldata wallets) external onlyOwner {
        for (uint256 i = 0; i < wallets.length; i++) {
            whitelistWallets[wallets[i]] = true;
        }
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
