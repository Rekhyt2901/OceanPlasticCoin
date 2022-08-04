const Migrations = artifacts.require("AlexCoin.sol");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
