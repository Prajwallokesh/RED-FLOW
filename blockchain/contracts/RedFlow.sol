// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title RedFlow
 * @dev Cryptographic Proof and Verification Registry for RedFlow Blood Supply Chain
 * 
 * Rules:
 * - Only stores cryptographic hashes (keccak256), flags, and state tags.
 * - Zero Personally Identifiable Information (PII) is written on-chain.
 * - Enforces admin permissioning.
 */
contract RedFlow {
    address public deployer;

    struct DonorRecord {
        bytes32 dataHash;
        bool verified;
        bool flagged;
        address verifiedBy;
        address flaggedBy;
        uint256 timestamp;
    }

    struct BloodUnitRecord {
        bytes32 dataHash;
        string status;
        address createdBy;
        address updatedBy;
        uint256 timestamp;
    }

    mapping(string => DonorRecord) public donors;
    mapping(string => BloodUnitRecord) public bloodUnits;
    mapping(address => bool) public admins;

    event DonorVerified(string indexed donorId, bytes32 dataHash, address indexed verifiedBy, uint256 timestamp);
    event DonorFlagged(string indexed donorId, bool flagStatus, bytes32 reasonHash, address indexed flaggedBy, uint256 timestamp);
    event BloodUnitCreated(string indexed unitId, bytes32 dataHash, string status, address indexed createdBy, uint256 timestamp);
    event BloodUnitStatusUpdated(string indexed unitId, string status, bytes32 updatedHash, address indexed updatedBy, uint256 timestamp);

    modifier onlyDeployer() {
        require(msg.sender == deployer, "Only contract deployer can perform this action");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == deployer, "Only authorized admin can perform this action");
        _;
    }

    constructor() {
        deployer = msg.sender;
        admins[msg.sender] = true;
    }

    function addAdmin(address _admin) external onlyDeployer {
        require(_admin != address(0), "Invalid admin address");
        admins[_admin] = true;
    }

    function verifyDonor(string calldata donorId, bytes32 donorHash) external onlyAdmin {
        require(bytes(donorId).length > 0, "donorId cannot be empty");
        require(donorHash != bytes32(0), "donorHash cannot be empty");
        
        donors[donorId] = DonorRecord({
            dataHash: donorHash,
            verified: true,
            flagged: false,
            verifiedBy: msg.sender,
            flaggedBy: address(0),
            timestamp: block.timestamp
        });

        emit DonorVerified(donorId, donorHash, msg.sender, block.timestamp);
    }

    function flagDonor(string calldata donorId, bool flagStatus, bytes32 reasonHash) external onlyAdmin {
        require(bytes(donorId).length > 0, "donorId cannot be empty");
        
        DonorRecord storage record = donors[donorId];
        record.flagged = flagStatus;
        record.flaggedBy = msg.sender;
        record.timestamp = block.timestamp;

        emit DonorFlagged(donorId, flagStatus, reasonHash, msg.sender, block.timestamp);
    }

    function addBloodUnit(string calldata unitId, bytes32 unitHash, string calldata status) external onlyAdmin {
        require(bytes(unitId).length > 0, "unitId cannot be empty");
        require(unitHash != bytes32(0), "unitHash cannot be empty");
        require(bloodUnits[unitId].dataHash == bytes32(0), "Blood unit already registered on-chain");

        bloodUnits[unitId] = BloodUnitRecord({
            dataHash: unitHash,
            status: status,
            createdBy: msg.sender,
            updatedBy: msg.sender,
            timestamp: block.timestamp
        });

        emit BloodUnitCreated(unitId, unitHash, status, msg.sender, block.timestamp);
    }

    function updateBloodUnitStatus(string calldata unitId, string calldata status, bytes32 updatedHash) external onlyAdmin {
        require(bytes(unitId).length > 0, "unitId cannot be empty");
        require(bloodUnits[unitId].dataHash != bytes32(0), "Blood unit does not exist on-chain");
        require(updatedHash != bytes32(0), "updatedHash cannot be empty");

        BloodUnitRecord storage record = bloodUnits[unitId];
        record.status = status;
        record.dataHash = updatedHash;
        record.updatedBy = msg.sender;
        record.timestamp = block.timestamp;

        emit BloodUnitStatusUpdated(unitId, status, updatedHash, msg.sender, block.timestamp);
    }

    function getDonorHash(string calldata donorId) external view returns (bytes32) {
        return donors[donorId].dataHash;
    }

    function getBloodUnitHash(string calldata unitId) external view returns (bytes32, string memory) {
        BloodUnitRecord memory record = bloodUnits[unitId];
        return (record.dataHash, record.status);
    }
}
