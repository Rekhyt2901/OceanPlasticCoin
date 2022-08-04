let AlexCoin = artifacts.require("AlexCoin.sol");

contract("AlexCoin", (accounts) => {

    it("Sets totalSupply upon deployment", async () => {
        let coinInstance = await AlexCoin.deployed();
        let totalSupply = await coinInstance.totalSupply();
        assert.equal(totalSupply.toNumber(), 86000000000, "Sets total supply to 86 Billion")
    });
})