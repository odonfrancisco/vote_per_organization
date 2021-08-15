import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';


const getWeb3 = async () => {
    const provider = await detectEthereumProvider();
    if(provider) {
        try{
            const web3 = new Web3(window.ethereum);
            return web3;
        } catch(err) {
            // Don't think i'm properly error-handling here
            console.error(err);
            return false;
        }
    }
    return false;
}

const requestAccounts = async () => {
    const provider = await detectEthereumProvider();
    if(!provider) return false;
    let acctArray = await provider.request({method: 'eth_accounts'});
    if(acctArray.length > 0) return acctArray[0];
    try{
        await provider.request({method: "eth_requestAccounts"});
        acctArray = await provider.request({method: 'eth_accounts'});
    } catch(err) {
        console.error(err);
    }
    
    return acctArray[0];
}


export {getWeb3, requestAccounts};