// contracts/KEDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract KedemToken is ERC20, Ownable{

    event minted(uint256 additionalSupply);
    event burned(uint256 tokensBurned);

    constructor(uint256 initialSupply) ERC20("KedemToken", "KDM") {
        _mint(msg.sender, initialSupply * 10 ** decimals());

        emit minted(initialSupply);

    }


    function mint(uint256 additionalSupply) public onlyOwner {
         _mint(msg.sender, additionalSupply * 10 ** decimals());

        emit minted(additionalSupply);
    }


    function burn(uint tokensToBurn) public onlyOwner {
        _burn(msg.sender, tokensToBurn);

        emit burned(tokensToBurn);
    }
}

