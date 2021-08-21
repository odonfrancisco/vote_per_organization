import Web3 from 'web3';

async function getWeb3() {
    let web3;
    try {
        if (window.ethereum) {
            web3 = new Web3(Web3.givenProvider);
            return web3;
        // Use Mist/MetaMask's provider.
        } else if (window.web3) {
            web3 = window.web3;
            console.log('Injected web3 detected.');
        } else {
            console.log('Enable MetaMask');
        }
    } catch (e) {
        console.log(e);
    }
    return web3
}

async function requestAccounts() {
    if (window.ethereum) {

        try{
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            return accounts[0];
        } catch(err) {
            console.error(err);
        }
    }
    
}

const addTokenToWallet = tokenAddr => {    
    window.ethereum
        .request({
        method: 'wallet_watchAsset',
        params: {
            type: 'ERC20',
            options: {
                address: tokenAddr,
                symbol: 'ACTK',
                decimals: 0,
                // image: ''
            },
        },
        })
        .catch(err => {
        console.error(err);
        })
}

export {getWeb3, requestAccounts, addTokenToWallet};