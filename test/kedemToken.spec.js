const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KedemToken", function () {
  it("should mint new tokens", async function() {
    const KedemToken = await ethers.getContractFactory("KedemToken");
    const kedemToken = await KedemToken.deploy(1000);
    await kedemToken.deployed();

    let totalSupply = await kedemToken.totalSupply()
    expect(totalSupply.toString()).to.equal('1000000000000000000000');

    await kedemToken.mint(100);
    totalSupply = await kedemToken.totalSupply()
    expect(totalSupply.toString()).to.equal('1100000000000000000000');
  })

  it("Should burn tokens", async function () {
    const KedemToken = await ethers.getContractFactory("KedemToken");
    const kedemToken = await KedemToken.deploy(1000);
    await kedemToken.deployed();

    totalSupply = await kedemToken.totalSupply()
    console.log('(1) totalSupply = ', totalSupply);

    //await kedemToken.burn(100000);

    totalSupply = await kedemToken.totalSupply()
    console.log('(2) totalSupply = ', totalSupply);

  });
});

