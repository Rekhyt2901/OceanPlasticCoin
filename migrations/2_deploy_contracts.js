const AlexCoin = artifacts.require("AlexCoin.sol");

module.exports = function (deployer) {
  deployer.deploy(AlexCoin);
};
