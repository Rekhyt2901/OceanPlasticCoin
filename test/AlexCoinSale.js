let AlexCoinSale = artifacts.require("AlexCoinSale.sol");
let AlexCoin = artifacts.require("AlexCoin.sol");
let zeroAddress = "0x0000000000000000000000000000000000000000";

contract("AlexCoinSale", (accounts) => {
    let saleInstance;
    let tokenPrice = 100000000000000;
    let numberOfTokens = 100;
    let tokensForSale = 75000000;
    it("Initializes the contract with correct values", async () => {
        saleInstance = await AlexCoinSale.deployed();
        coinInstance = await AlexCoin.deployed();

        let address = saleInstance.address;
        assert.notEqual(address, 0x0, "contract has address");

        let coinContract = await saleInstance.coinContract();
        assert.notEqual(coinContract, 0x0, "has coinContract address");

        let _tokenPrice = await saleInstance.tokenPrice();
        assert.equal(_tokenPrice, tokenPrice, "sets the correct tokenPrice")

    });
    it("Lets people buy tokens", async () => {
        await coinInstance.transfer(saleInstance.address, tokensForSale, {from: accounts[0]});
        
        let receipt = await saleInstance.buyTokens(numberOfTokens, {from: accounts[1], value: numberOfTokens * tokenPrice});
        let tokensSold = await saleInstance.tokensSold();
        assert.equal(tokensSold.toNumber(), numberOfTokens, "counts the sold tokens");
        
        assert.equal(receipt.logs.length, 1, "trigger one event");
        assert.equal(receipt.logs[0].event, "Sell", "should be the 'Sell' event");
        assert.equal(receipt.logs[0].args._buyer, accounts[1], "logs the account that bought tokens");
        assert.equal(receipt.logs[0].args._amount, numberOfTokens, "logs the number of tokens bought");
        assert.equal(receipt.logs[0].args._price, tokenPrice, "logs the price paid per token");

        try {
            assert.fail(await saleInstance.buyTokens(numberOfTokens, {from: accounts[1], value: 1}))
        } catch(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert 1")
        }

        try {
            let tooManyTokens = 86000000001;
            assert.fail(await saleInstance.buyTokens(tooManyTokens, {from: accounts[1], value:web3.utils.toBN(tooManyTokens).mul(web3.utils.toBN(tokenPrice))}))
        } catch(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert 2")
        }

        let buyersBalance = await coinInstance.balanceOf(accounts[1]);
        assert.equal(buyersBalance.toNumber(), numberOfTokens, "Buyer received correct amount of tokens");
        let saleBalance = await coinInstance.balanceOf(saleInstance.address);
        assert.equal(saleBalance.toNumber(), tokensForSale - numberOfTokens, "Sale Contract has correct amount of tokens");
    });
    it("ends the sale", async () => {
        try {
            await saleInstance.endSale({from: accounts[1]});
        } catch(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert 1")
        }
        await saleInstance.endSale({from: accounts[0]});
        let saleBalance = await coinInstance.balanceOf(saleInstance.address);
        let adminBalance = await coinInstance.balanceOf(accounts[0]);
        assert.equal(saleBalance.toNumber(), 0, "Sale doesn't hold any coins anymore");
        assert.equal(adminBalance.toNumber(), 269000000 - numberOfTokens, "Admin received all unsold coins");
        
        let open = await saleInstance.open();
        assert.equal(open, false, "Sale closed");
    });
});