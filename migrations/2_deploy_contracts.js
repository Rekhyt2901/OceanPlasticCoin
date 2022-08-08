const AlexCoin = artifacts.require("AlexCoin.sol");
const AlexCoinSale = artifacts.require("AlexCoinSale.sol");

module.exports = async function (deployer) {
  await deployer.deploy(AlexCoin);
  await deployer.deploy(AlexCoinSale, 2000000000000000, AlexCoin.address);
};
