const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {

    const amount = ethers.utils.parseUnits("10.0");
    let escrow;
    let kedemToken;

    before(async function () {

        console.log('### starting. amount = ', amount);

        //deploy token
        const KedemToken = await ethers.getContractFactory("KedemToken");
        kedemToken = await KedemToken.deploy(100000000);
        await kedemToken.deployed();

        // Get test accounts
        const accounts = await hre.ethers.getSigners();
        deployer = accounts[0];
        happyPathAccount = accounts[1];
        unhappyPathAccount = accounts[2];
        /**
         * Transfer some ERC20s to happyPathAccount
         * */
        const transferTx = await kedemToken.transfer(happyPathAccount.address, "80000000000000000000");
        await transferTx.wait();
        /**
         * Deploy Escrow Contract
         *
         * - Add ERC20 address to the constructor
         * - Add escrow admin wallet address to the constructor
         * */
        const Escrow = await ethers.getContractFactory("Escrow");
        escrow = await Escrow.deploy(kedemToken.address);
        await escrow.deployed();
        /** 
         * Seed ERC20 allowance
         * */
        const erc20WithSigner = kedemToken.connect(happyPathAccount);
        const approveTx = await erc20WithSigner.approve(escrow.address, "90000000000000000000");
        await approveTx.wait();
    });

    it("Happy Path: depositEscrow", async function () {
        const contractWithSigner = escrow.connect(happyPathAccount);
        const trxHash = await escrow.getHash(amount);
        const depositEscrowTx = await contractWithSigner.depositEscrow(trxHash, amount);
       await depositEscrowTx.wait();
        expect(
          (await kedemToken.balanceOf(happyPathAccount.address)).toString()
        ).to.equal("70000000000000000000");
    });

    it("Unhappy Path: depositEscrow - Transaction hash cannot be empty!", async function () {
        const contractWithSigner = escrow.connect(unhappyPathAccount);
        let err = "";
        try {
            await contractWithSigner.depositEscrow(ethers.constants.HashZero, amount)
        }
        catch(e) {
            err = e.message;
        }
        expect(err).to.equal("VM Exception while processing transaction: reverted with reason string 'Transaction hash cannot be empty!'");
    });

    it("Unhappy Path: depositEscrow - Escrow amount cannot be equal to 0.", async function () {
        const contractWithSigner = escrow.connect(unhappyPathAccount);
        const trxHash = await escrow.getHash(amount);
        let err = "";
        try {
            await contractWithSigner.depositEscrow(trxHash, ethers.utils.parseUnits("0"))
        }
        catch(e) {
            err = e.message;
        }
        expect(err).to.equal("VM Exception while processing transaction: reverted with reason string 'Escrow amount cannot be equal to 0.'");
    });

    it("Unhappy Path: depositEscrow - Unique hash conflict, hash is already in use.", async function () {
        const contractWithSigner = escrow.connect(happyPathAccount);
        const trxHash = await escrow.getHash(amount);
        const depositEscrowTx = await contractWithSigner.depositEscrow(trxHash, amount);
        await depositEscrowTx.wait();
        expect(
            (await kedemToken.balanceOf(happyPathAccount.address)).toString()
        ).to.equal("60000000000000000000");
        let err = "";
        try {
            await contractWithSigner.depositEscrow(trxHash, amount)
        }
        catch(e) {
            err = e.message;
        }
        expect(err).to.equal("VM Exception while processing transaction: reverted with reason string 'Unique hash conflict, hash is already in use.'");
    });

    it("Unhappy Path: depositEscrow - ERC20: insufficient allowance", async function () {
        const contractWithSigner = escrow.connect(unhappyPathAccount);
        const trxHash = await escrow.getHash(amount);
        let err = "";
        try {
            await contractWithSigner.depositEscrow(trxHash, amount)
        }
        catch(e) {
            err = e.message;
        }
        expect(err).to.equal("VM Exception while processing transaction: reverted with reason string 'ERC20: insufficient allowance'");
    });
});