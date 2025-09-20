// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract Presale is Initializable, ReentrancyGuardUpgradeable, OwnableUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    IERC20Upgradeable public tokenAddress;
    address public treasuryAddress;

    uint256 public rate;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public claimTime;
    uint256 public totalCap;
    uint256 public totalRaised;

    uint256 public constant MIN_BUY = 10 ether;
    uint256 public constant MAX_BUY = 5000 ether;

    mapping(address => uint256) public contributions;
    mapping(address => uint256) public tokenAllocations;
    mapping(address => bool) public hasClaimed;

    event Purchased(address indexed buyer, uint256 spent, uint256 tokensReceived);
    event TokensClaimed(address indexed claimer, uint256 amount);
    event ClaimTimeUpdated(uint256 newClaimTime);
    event PresaleEnded(uint256 finalRaised, uint256 timestamp);

    modifier presaleActive() {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Presale is not active");
        require(totalRaised < totalCap, "Presale cap reached");
        _;
    }

    function initialize(
        address _tokenAddress,
        address _treasuryAddress,
        uint256 _rate,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _claimTime,
        uint256 _totalCap
    ) public initializer {
        require(_tokenAddress != address(0), "Token address required");
        require(_treasuryAddress != address(0), "Treasury address required");
        require(_rate > 0, "Rate must be greater than 0");
        require(_startTime < _endTime, "Invalid time range");
        require(_claimTime >= _endTime, "Claim start time must be after presale end");
        require(_totalCap >= MAX_BUY, "Cap must be >= max individual limit");

        __ReentrancyGuard_init();
        __Ownable_init();

        tokenAddress = IERC20Upgradeable(_tokenAddress);
        treasuryAddress = _treasuryAddress;
        rate = _rate;
        startTime = _startTime;
        endTime = _endTime;
        claimTime = _claimTime;
        totalCap = _totalCap;
    }

    receive() external payable {
        buy();
    }

    fallback() external payable {
        buy();
    }

    function buy() public payable presaleActive nonReentrant {
        require(msg.value >= MIN_BUY, "Minimum purchase is 10 CRO");
        require(msg.value <= MAX_BUY, "Maximum purchase is 5000 CRO");
        require(contributions[msg.sender] + msg.value <= MAX_BUY, "Exceeds max allocation per wallet");
        require(totalRaised + msg.value <= totalCap, "Purchase exceeds total cap");

        uint256 tokenAmount = msg.value * rate;
        uint256 contractBalance = tokenAddress.balanceOf(address(this));
        require(tokenAmount <= contractBalance, "Not enough tokens left");

        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        tokenAllocations[msg.sender] += tokenAmount;

        (bool sent, ) = treasuryAddress.call{value: msg.value}("");
        require(sent, "Failed to send CRO to treasury");

        if (totalRaised >= totalCap) {
            if (claimTime > block.timestamp) {
                claimTime = block.timestamp;
                emit ClaimTimeUpdated(block.timestamp);
            }
            emit PresaleEnded(totalRaised, block.timestamp);
        }

        emit Purchased(msg.sender, msg.value, tokenAmount);
    }

    function claim() external nonReentrant {
        require(isPresaleEnded(), "Presale not ended");
        require(block.timestamp >= claimTime, "Claim period not started");
        require(!hasClaimed[msg.sender], "Tokens already claimed");

        uint256 amount = tokenAllocations[msg.sender];
        require(amount > 0, "No tokens to claim");

        hasClaimed[msg.sender] = true;
        tokenAddress.safeTransfer(msg.sender, amount);

        emit TokensClaimed(msg.sender, amount);
    }

    // --- Admin Functions ---
    function setRate(uint256 _newRate) external onlyOwner {
        require(_newRate > 0, "Invalid rate");
        rate = _newRate;
    }

    function setTimeStamp(uint256 _newstartTime, uint256 _newEndTime) external onlyOwner {
        require(_newstartTime < _newEndTime, "Invalid times");
        startTime = _newstartTime;
        endTime = _newEndTime;
    }

    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasuryAddress = _newTreasury;
    }

    function setLimit(uint256 _newLimit) external onlyOwner {
        require(_newLimit >= totalRaised, "Cap cannot be less than raised amount");
        totalCap = _newLimit;
    }

    function setClaimTime(uint256 _newClaimTime) external onlyOwner {
        claimTime = _newClaimTime;
        emit ClaimTimeUpdated(_newClaimTime);
    }

    function withdrawTokens() external nonReentrant onlyOwner {
        uint256 amount = tokenAddress.balanceOf(address(this));
        require(amount > 0, "No tokens to withdraw");
        tokenAddress.safeTransfer(owner(), amount);
    }

    function withdraw() external nonReentrant onlyOwner {
        uint256 balance = address(this).balance;
        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Withdraw failed");
    }

    // --- Emergency Withdrawals ---
    function emergencyWithdraw(address to) external onlyOwner {
        require(to != address(0), "Invalid address");
        uint256 amount = address(this).balance;
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Failed to withdraw CRO");
    }

    function emergencyWithdrawToken(address to) external onlyOwner {
        require(to != address(0), "Invalid address");
        uint256 balance = tokenAddress.balanceOf(address(this));
        tokenAddress.safeTransfer(to, balance);
    }

    // --- View Functions ---
    function isPresaleEnded() public view returns (bool) {
        return block.timestamp > endTime || totalRaised >= totalCap;
    }

    function getUserInfo(address user) external view returns (
        uint256 contributed,
        uint256 allocation,
        bool claimed
    ) {
        return (
            contributions[user],
            tokenAllocations[user],
            hasClaimed[user]
        );
    }
}
