let web3;
let sale;
let coin;
let account;
let tokenPrice;
let tokensAvailable;
function formatNumber(number) {
    number = number + "";
    let x = number.split(".");
    let y = "";
    let c = 0;
    for(let i = x[0].length-1; i >= 0; i--) {
        y += x[0][i];
        c++;
        if(c%3==0 && i != 0) y += ",";

    }
    let result =  y.split("").reverse().join("");
    if(x[1]) result +="." + x[1];
    return result;
}

window.onload = async () => {
    // permissions and account fetching
    if(window.ethereum) {
        let accounts = await ethereum.request({method: 'eth_accounts'});
        account = accounts[0];
        
        document.getElementById("account").textContent = "Your account: " + account;
    } else {
        console.error("NO ETHEREUM CONNECTED")
    }

    // init web3
    let provider = Web3.givenProvier || "ws://localhost:7545";
    web3 = new Web3(provider);
    
    // init contracts
    let saleData = await fetch("AlexCoinSale.json");
    let saleJson = await saleData.json();
    let saleContract = TruffleContract(saleJson);
    await saleContract.setProvider(provider);
    sale = await saleContract.deployed();

    let coinData = await fetch("AlexCoin.json");
    let coinJson = await coinData.json();
    let coinContract = TruffleContract(coinJson);
    await coinContract.setProvider(provider);
    coin = await coinContract.deployed();

    // available tokens
    tokensAvailable = 75000000;
    document.getElementById("tokensAvailable").textContent = formatNumber(tokensAvailable);

    // render token price
    tokenPrice = await sale.tokenPrice();
    document.getElementById("tokenPrice").textContent = "Price of one coin: " + web3.utils.fromWei(tokenPrice, "ether") + " ETH";
    
    // render user balance
    async function updateEthBalance() {
        let userBalance = await web3.eth.getBalance(account);
        document.getElementById("balance").textContent = "Your Ethereum balance: " + formatNumber(web3.utils.fromWei(userBalance, "ether")) + " ETH";
    }
    updateEthBalance();
    
    // change infos on input input
    function updateSelectedCoins() {
        let numberOfTokens = document.getElementById("numberOfTokens").value;
        document.getElementById("selectedTokenPrice").textContent = formatNumber((numberOfTokens || 0)) + " coin" + (numberOfTokens==1 ? "":"s")  +" will cost " + formatNumber(web3.utils.fromWei(web3.utils.toHex(web3.utils.BN(numberOfTokens).mul(web3.utils.BN(tokenPrice))))) + " ETH";
    }
    document.getElementById("numberOfTokens").onchange = updateSelectedCoins;
    document.getElementById("numberOfTokens").oninput = updateSelectedCoins;
    updateSelectedCoins();
    
    // update progressbar
    async function updateProgress() {
        let soldCoins = (await sale.tokensSold()).toNumber();
        document.getElementById("tokensSold").textContent = formatNumber(soldCoins);

        let progressPercent = soldCoins / tokensAvailable * 100;
        document.getElementById("progress").style.width = progressPercent + "%";
    }
    updateProgress();

    // update alexcoin balance
    async function updateAlexCoins() {
        let alexcoins = await coin.balanceOf(account);
        document.getElementById("alexCoinBalance").textContent = "Your AlexCoin balance: " + formatNumber(alexcoins.toNumber()) + " AlexCoins";
    }
    updateAlexCoins();

    // Subscribe to sell event
    async function sellEvent() {
        let subscription = await sale.Sell((err, event) => {
            if(err) console.log(err);
            console.log("RECEIVED SALE EVENT");
            updateProgress();
        });
    }
    sellEvent();
    
    // buy tokens on submit
    document.getElementById("form").onsubmit = async (e) => {
        e.preventDefault();
        let numberOfTokens = document.getElementById("numberOfTokens").value;
        document.getElementById("loader").style.display = "";
        document.getElementById("content").style.display = "none";

        let result = await sale.buyTokens(numberOfTokens, {
            from:  account,
            value: web3.utils.BN(numberOfTokens).mul(web3.utils.BN(tokenPrice))
        });
        console.log("BOUGHT TOKENS");
        document.getElementById("numberOfTokens").value = 1;
        await updateAlexCoins();
        await updateEthBalance();

        document.getElementById("loader").style.display = "none";
        document.getElementById("content").style.display = "flex";
    }

    // show content
    document.getElementById("loader").style.display = "none";
    document.getElementById("content").style.display = "flex";
}
