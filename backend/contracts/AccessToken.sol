// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import '@openzeppelin/contracts/utils/Counters.sol';

contract AccessToken is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  
  constructor() 
    ERC721("Access Token", "ACTK") {}

  function mintToken(address approvedAddr, string memory vc) external returns(uint) {
    uint newTokenId = _tokenIds.current();
    _mint(approvedAddr, newTokenId);
    _setTokenURI(newTokenId, vc);
    _tokenIds.increment();  
    return(newTokenId);
  }
}
