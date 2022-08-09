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
    for (let i = x[0].length - 1; i >= 0; i--) {
        y += x[0][i];
        c++;
        if (c % 3 == 0 && i != 0) y += ",";

    }
    let result = y.split("").reverse().join("");
    if (x[1]) result += "." + x[1];
    return result;
}

function createAlert(message, type, timeTillFadeout) {
    let alertPlaceholder = document.getElementById("liveAlertPlaceholder");
    while(alertPlaceholder.firstChild) alertPlaceholder.removeChild(alertPlaceholder.firstChild);

    let wrapper = document.createElement('div');
    wrapper.style.transition = `opacity 1s`;
    let div1 = document.createElement("div");
    div1.classList.add("alert", `alert-${type}`, "alert-dismissible");
    div1.setAttribute("role", "alert");
    let div2 = document.createElement("div");
    div2.textContent = message;
    let button = document.createElement("button");
    button.setAttribute("type", "button");
    button.classList.add("btn-close");
    button.setAttribute('data-bs-dismiss', "alert");
    button.setAttribute("aria-label", "Close");
    
    div1.appendChild(div2);
    div1.appendChild(button);
    wrapper.appendChild(div1);
    alertPlaceholder.appendChild(wrapper);
    setTimeout(() => wrapper.style.opacity = "0", timeTillFadeout);
}


window.onload = async () => {
    // Check if MetaMask is in Browser
    if (window.ethereum) {
        document.getElementById("loader").style.display = "";

        // check if metamask account is already connected
        if ((await ethereum.request({ method: 'eth_accounts' })).length > 0) {
            let accs = await ethereum.request({ method: 'eth_accounts' });
            account = accs[0];
            document.getElementById("account").textContent = "Your account: " + account;
            document.getElementById("enableMetaMask").style.display = "none";
            init();
            return;
        }

        // account is not already connected => showing connect button
        document.getElementById("loader").style.display = "none";
        document.getElementById("enableMetaMask").style.display = "";
        document.getElementById("loader").style.display = "none";
        document.getElementById("enableMetaMaskButton").onclick = async () => {
            document.getElementById("enableMetaMaskButton").setAttribute("disabled", true);
            document.getElementById("loader").style.display = "";

            try {
                let accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                account = accounts[0];
                document.getElementById("account").textContent = "Your account: " + account;
                document.getElementById("enableMetaMask").style.display = "none";
                init();
                return;
            } catch {
                // account connection was cancelled
                document.getElementById("enableMetaMaskButton").disabled = false;;
                document.getElementById("loader").style.display = "none";
                return;
            }
        }
    } else {
        // MetaMask not in Browser
        console.error("NO ETHEREUM CONNECTED");
        document.getElementById("loader").style.display = "none";
        document.getElementById("noMetaMask").style.display = "";
        return;
    }
}

async function init() {
    // Handle MetaMask account change
    async function handleAccountChange(accounts) {
        document.getElementById("loader").style.display = "";
        document.getElementById("content").style.display = "none";
        // Handle unconnected account?
        account = accounts[0];
        document.getElementById("account").textContent = "Your account: " + account;
        await updateEthBalance();
        await updateAlexCoins();
        document.getElementById("loader").style.display = "none";
        document.getElementById("content").style.display = "flex";
    }
    window.ethereum.on("accountsChanged", handleAccountChange);

    // Handle MetaMask network change
    function handleChainChange(chainId) {
        if (chainId == 0x1) {
            document.getElementById("content").style.display = "flex";
            document.getElementById("wrongNetwork").style.display = "none";
            return;
        }
        document.getElementById("content").style.display = "none";
        document.getElementById("wrongNetwork").style.display = "";
    }
    window.ethereum.on("chainChanged", handleChainChange);
    handleChainChange(ethereum.networkVersion);
    document.getElementById("content").style.display = "none";

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
    tokensAvailable = 269000000;
    document.getElementById("tokensAvailable").textContent = formatNumber(tokensAvailable);

    // render token price
    tokenPrice = await sale.tokenPrice();
    // document.getElementById("tokenPrice").textContent = "Price of one coin: " + web3.utils.fromWei(tokenPrice, "ether") + " ETH";
    document.getElementById("tokenPrice").textContent = web3.utils.fromWei(tokenPrice, "ether") + " ETH";


    // render user balance
    async function updateEthBalance() {
        let userBalance = await web3.eth.getBalance(account);
        // document.getElementById("balance").textContent = "Your Ethereum balance: " + formatNumber(web3.utils.fromWei(userBalance, "ether")) + " ETH";
        document.getElementById("balance").textContent = formatNumber(web3.utils.fromWei(userBalance, "ether")) + " ETH";
    }
    await updateEthBalance();

    // change infos on input input
    function updateSelectedCoins() {
        let numberOfTokens = document.getElementById("numberOfTokens").value;
        document.getElementById("selectedTokenPrice").textContent = formatNumber((numberOfTokens || 0)) + " coin" + (numberOfTokens == 1 ? "" : "s") + " will cost " + formatNumber(web3.utils.fromWei(web3.utils.toHex(web3.utils.BN(numberOfTokens).mul(web3.utils.BN(tokenPrice))))) + " ETH";
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
    await updateProgress();

    // update alexcoin balance
    async function updateAlexCoins() {
        let alexcoins = await coin.balanceOf(account);
        // document.getElementById("alexCoinBalance").textContent = "Your Ocean Plastic Coin balance: " + formatNumber(alexcoins.toNumber()) + " coins";
        document.getElementById("alexCoinBalance").textContent = formatNumber(alexcoins.toNumber()) + " coins";
        if (alexcoins < 1) {
            document.getElementById("coinBalanceContainer").classList.remove("bg-success");
            document.getElementById("coinBalanceContainer").classList.add("bg-danger");
        } else {
            document.getElementById("coinBalanceContainer").classList.add("bg-success");
            document.getElementById("coinBalanceContainer").classList.remove("bg-danger");
        }
    }
    await updateAlexCoins();

    // Subscribe to sell event
    async function sellEvent() {
        let subscription = await sale.Sell((err, event) => {
            if (err) console.log(err);
            updateProgress();
        });
    }
    await sellEvent();

    // buy tokens on submit
    document.getElementById("form").onsubmit = async (e) => {
        e.preventDefault();
        let numberOfTokens = document.getElementById("numberOfTokens").value;

        let userBalance = await web3.eth.getBalance(account);
        if(userBalance < numberOfTokens * tokenPrice) {
            createAlert("Not enough ETH to buy coins", "danger", 3000);
            return;
        }
        let coinsLeft = tokensAvailable - (await sale.tokensSold()).toNumber();
        if(numberOfTokens > coinsLeft) {
            createAlert("Not enough coins left for sale", "danger", 3000);
            return;
        }


        document.getElementById("loader").style.display = "";
        document.getElementById("content").style.display = "none";

        try {
            let result = await sale.buyTokens(numberOfTokens, {
                from: account,
                value: web3.utils.BN(numberOfTokens).mul(web3.utils.BN(tokenPrice))
            });
            document.getElementById("numberOfTokens").value = 1;
            await updateAlexCoins();
            await updateEthBalance();
        } catch (err) {
            console.error(err.message);
            createAlert(err.message, "danger", 7000);
            // alert("Transaction Failed. " + err.message);
        }

        document.getElementById("loader").style.display = "none";
        document.getElementById("content").style.display = "flex";
    }

    // show content
    document.getElementById("loader").style.display = "none";
    document.getElementById("content").style.display = "flex";
}
