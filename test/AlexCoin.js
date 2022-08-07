let AlexCoin = artifacts.require("AlexCoin.sol");
let zeroAddress = "0x0000000000000000000000000000000000000000";

contract("AlexCoin", (accounts) => {

    it("Sets totalSupply, name, symbol and standard upon deployment", async () => {
        let coinInstance = await AlexCoin.deployed();
        let totalSupply = await coinInstance.totalSupply();
        assert.equal(totalSupply.toNumber(), 86000000000, "Sets total supply to 86 Billion");
        let name = await coinInstance.name();
        assert.equal(name, "AlexCoin", "Sets name to AlexCoin");
        let symbol = await coinInstance.symbol();
        assert.equal(symbol, "ALEX", "Sets symbol to ALEX");
        let standard = await coinInstance.standard();
        assert.equal(standard, "Alex Coin v1.0", "Sets standard to Alex Coin v1.0");
    });
    it("Gives initial Coins to contract Owner", async () => {
        let coinInstance = await AlexCoin.deployed();
        let totalSupply = await coinInstance.totalSupply();
        let coinsOwnedByContractOwner = await coinInstance.balanceOf(accounts[0]);
        assert.equal(coinsOwnedByContractOwner.toNumber(), totalSupply, "Initial supply is given to contract owner")
    });
    it("Transfers Coins", async () => {
        let coinInstance = await AlexCoin.deployed();
        let coinsOwnedByContractOwnerBefore = await coinInstance.balanceOf(accounts[0]);

        let receipt = await coinInstance.transfer(accounts[1], 3);

        let coinsOwnedByContractOwnerAfter = await coinInstance.balanceOf(accounts[0]);
        let coinsOfSecondAccount = await coinInstance.balanceOf(accounts[1]);

        assert.equal(coinsOfSecondAccount.toNumber(), 3, "Second Account received 3 coins");
        assert.equal(coinsOwnedByContractOwnerBefore.toNumber() - 3, coinsOwnedByContractOwnerAfter.toNumber(), "First Account lost 3 coins");

        assert.equal(receipt.logs.length, 1, "trigger one event");
        assert.equal(receipt.logs[0].event, "Transfer", "should be the 'Transfer' event");
        assert.equal(receipt.logs[0].args._from, accounts[0], "logs the account the tokens are transferred frin");
        assert.equal(receipt.logs[0].args._to, accounts[1], "logs the account the tokens are transferred to");
        assert.equal(receipt.logs[0].args._value, 3, "logs the transfer amount");
        let bool = await coinInstance.transfer.call(accounts[1], 1);
        assert.equal(bool, true, "True boolean is returned on successful transfer");



        try {
            assert.fail(await coinInstance.transfer.call(accounts[2], 87000000000));
        } catch(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert 1");
        }
        // assert.equal(bool2, false, "False boolean is returned on unsuccessful transfer, when sender does not have enough coins");
        // assert.equal((await coinInstance.balanceOf(accounts[0])).toNumber(), 86000000000-3, "Coins where not Transfered if sender does not have enough 1");
        // assert.equal((await coinInstance.balanceOf(accounts[2])).toNumber(), 0, "Coins where not Transfered if sender does not have enough 2");
        try {
            assert.fail(await coinInstance.transfer.call(zeroAddress, 1));
        } catch(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert 2");
        }
        // assert.equal(bool3, false, "False boolean is returned on unsuccessful transfer, when sending to zero address");
        // assert.equal((await coinInstance.balanceOf(accounts[0])).toNumber(), 86000000000-3, "Coins where not Transfered if sending to zero address 1");
        // assert.equal((await coinInstance.balanceOf(zeroAddress)).toNumber(), 0, "Coins where not Transfered if sending to zero address 2");
    
        

    });
    it("Approves tokens for delegated transfer", async () => {
        let coinInstance = await AlexCoin.deployed();
        let bool = await coinInstance.approve.call(accounts[1], 100);
        assert.equal(bool ,true, "it returns true");

        let receipt = await coinInstance.approve(accounts[1], 100, {from: accounts[0]});
        assert.equal(receipt.logs.length, 1, "trigger one event");
        assert.equal(receipt.logs[0].event, "Approval", "should be the 'Approval' event");
        assert.equal(receipt.logs[0].args._owner, accounts[0], "logs who sent the approval");
        assert.equal(receipt.logs[0].args._spender, accounts[1], "logs who is approved of spending");
        assert.equal(receipt.logs[0].args._value, 100, "logs the approved amount");

        let allowance = await coinInstance.allowance(accounts[0], accounts[1]);
        assert.equal(allowance, 100, "stores the allowance correctly");

        // reset
        await coinInstance.approve(accounts[1], 0, {from: accounts[0]});
        try {
            assert.fail(await coinInstance.approve.call(zeroAddress, 0, {from: accounts[0]}));
        } catch(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert 1");
        }
    });
    it("Increases and decreases allowances", async () => {
        let coinInstance = await AlexCoin.deployed();
        let bool1 = await coinInstance.increaseAllowance.call(accounts[1], 100, {from: accounts[0]});
        let bool2 = await coinInstance.decreaseAllowance.call(accounts[1], 0);
        assert.equal(bool1 ,true, "it returns true 1");
        assert.equal(bool2 ,true, "it returns true 2");

        let receipt1 = await coinInstance.increaseAllowance(accounts[1], 100, {from: accounts[0]});
        assert.equal(receipt1.logs.length, 1, "trigger one event");
        assert.equal(receipt1.logs[0].event, "Approval", "should be the 'Approval' event");
        assert.equal(receipt1.logs[0].args._owner, accounts[0], "logs who sent the approval");
        assert.equal(receipt1.logs[0].args._spender, accounts[1], "logs who is approved of spending");
        assert.equal(receipt1.logs[0].args._value.toNumber(), 100, "logs the new allowed amount");
        
        let receipt2 = await coinInstance.decreaseAllowance(accounts[1], 90, {from: accounts[0]});
        assert.equal(receipt2.logs.length, 1, "trigger one event");
        assert.equal(receipt2.logs[0].event, "Approval", "should be the 'Approval' event");
        assert.equal(receipt2.logs[0].args._owner, accounts[0], "logs who sent the approval");
        assert.equal(receipt2.logs[0].args._spender, accounts[1], "logs who is approved of spending");
        assert.equal(receipt2.logs[0].args._value.toNumber(), 10, "logs the new allowed amount");

        let allowance = await coinInstance.allowance(accounts[0], accounts[1]);
        assert.equal(allowance, 10, "stores the allowance correctly");

        await coinInstance.decreaseAllowance(accounts[1], 10, {from: accounts[0]});

        try {
            assert.fail(await coinInstance.increaseAllowance.call(zeroAddress, 0, {from: accounts[0]}));
        } catch(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert 1");
        }
        try {
            assert.fail(await coinInstance.decreaseAllowance.call(zeroAddress, 0, {from: accounts[0]}));
        } catch(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert 1");
        }
        try {
            assert.fail(await coinInstance.decreaseAllowance.call(accounts[1], 1000000000, {from: accounts[0]}));
        } catch(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert 1");
        }
    });
    it("Handles delegated transfers", async () => {
        let coinInstance = await AlexCoin.deployed();
        await coinInstance.transfer(accounts[1], 100, {from: accounts[0]});
        await coinInstance.approve(accounts[0], 50, {from: accounts[1]});

        let bool = await coinInstance.transferFrom.call(accounts[1], accounts[2], 10);
        assert.equal(bool ,true, "it returns true");

        let receipt = await coinInstance.transferFrom(accounts[1], accounts[2], 10, {from: accounts[0]});
        assert.equal(receipt.logs.length, 2, "trigger two events");
        assert.equal(receipt.logs[0].event, "Transfer", "should be the 'Transfer' event");
        assert.equal(receipt.logs[0].args._from, accounts[1], "logs the account the tokens are transferred frin");
        assert.equal(receipt.logs[0].args._to, accounts[2], "logs the account the tokens are transferred to");
        assert.equal(receipt.logs[0].args._value, 10, "logs the transfer amount");
        
        assert.equal(receipt.logs[1].event, "Approval", "should be the 'Approval' event");
        assert.equal(receipt.logs[1].args._owner, accounts[1], "logs who sent the approval");
        assert.equal(receipt.logs[1].args._spender, accounts[0], "logs who is approved of spending");
        assert.equal(receipt.logs[1].args._value, 40, "logs the new allowed amount");

        assert.equal((await coinInstance.balanceOf(accounts[1])).toNumber(), 90 + 3, "deducts sent value from 'from-account'");
        assert.equal((await coinInstance.balanceOf(accounts[2])).toNumber(), 10, "adds sent value to 'to-account'");
        assert.equal((await coinInstance.allowance(accounts[1], accounts[0])).toNumber(), 40, "updates the allowance correctly");

        try {
            assert.fail(await coinInstance.transferFrom.call(accounts[1], accounts[2], 55, {from: accounts[0]}));
        } catch(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert 1");
        }

        await coinInstance.approve(accounts[0], 300, {from: accounts[1]});
        try {
            assert.fail(await coinInstance.transferFrom.call(accounts[1], accounts[2], 200));
        } catch(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert 2");
        }

        try {
            assert.fail(await coinInstance.transferFrom.call(accounts[1], zeroAddress, 1));
        } catch(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert 3");
        }

        try {
            assert.fail(await coinInstance.approve.call(zeroAddress, 1));
        } catch(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert 4");
        }
    });
});