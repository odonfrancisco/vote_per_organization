pragma solidity ^0.8.6;

import "./VotingContract.sol";

contract CreatorContract {
    struct ContractRef {
        address _address;
        string name;
    }

    event Debug (
        uint a,
        string description
    );

    event ContractCreated (
        address _address,
        uint index
    );

    // Map of user address and the contracts they've created
    mapping(address => ContractRef[]) public contractMap;

    function createContract(string calldata name) external stringLength(name) {
        // Creates new instance of voting contract
        VotingContract newVotingContract = new VotingContract(name, msg.sender, address(this));
        address contractAddr = address(newVotingContract);
        // saves a reference of the new voting contract 
        ContractRef memory ref = ContractRef(contractAddr, newVotingContract.name());
        // stores contract reference under creator's mapping
        contractMap[msg.sender].push(ref);

        emit ContractCreated(contractAddr, contractMap[msg.sender].length -1);
    }

    /* Want to remove a VotingContract. Not sure if possible. 
    I can delete the reference to it, but the SC would still exist
    in the EVM */

    function updateContractAdmin(
        address newAdmin, 
        address oldAdmin, 
        address contractAddr) 
        external
        onlyAdmin(oldAdmin, contractAddr) {
            // reference to admin's array of contractRefs
            ContractRef[] storage contractRefs = contractMap[oldAdmin];
            // Store particular ContractRef if found
            uint contractIndex;
            bool foundContract = false;

            for(uint i = 0; i < contractRefs.length; i++){
                ContractRef memory current = contractRefs[i];
                if(current._address == contractAddr){
                    // stores particular ContractRef to local var
                    // contractRef = current;
                    contractIndex = i;
                    // delete contractRefs[i];
                    foundContract = true;
                    break;
                }
            }

            /* if  contract was found inside forloop, 
            adds contractRef to newAdmin's map */
            if(foundContract) {
                ContractRef memory contractRef = ContractRef(
                    contractRefs[contractIndex]._address,
                    contractRefs[contractIndex].name
                );
                /* Need to work on this. most likely want to replace
                element with last element of array */ 
                delete contractRefs[contractIndex];
                
                contractMap[newAdmin].push(contractRef);
                emit ContractCreated(contractRef._address, 
                    contractMap[newAdmin].length -1
                );
            }
        
    }

    function addContract(address _address, ContractRef memory ref) internal {
        contractMap[_address].push(ref);
    }

    function updateContract(
        string calldata newName,
        address admin, 
        address contractAddr) 
        external
        onlyAdmin(admin, contractAddr)
        stringLength(newName) {
            ContractRef[] storage contractRefs = contractMap[admin];

            for(uint i = 0; i < contractRefs.length; i++){
                ContractRef storage current = contractRefs[i];
                if(current._address == contractAddr){
                    current.name = newName;
                    break;
                }
            }        
    }

    modifier onlyAdmin(address sender, address contractAddr) {
        bool isAdmin = false;
        ContractRef[] memory refs = contractMap[sender];
        for(uint i = 0; i < refs.length; i++){
            ContractRef memory current = refs[i];
            if(current._address == contractAddr){
                isAdmin = true;
            }
        }
        require(isAdmin, "Only admin can perform this action");
        _;
    }

    modifier stringLength(string calldata str) {
        // emit Debug(bytes(str).length, str);
        require(bytes(str).length > 0, "String parameter must be of a valid length");
        _;
    }

}