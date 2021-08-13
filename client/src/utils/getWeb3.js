import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';


const getWeb3 = () => {
    return new Promise(async (resolve, reject) => {
        const provider = await detectEthereumProvider();
        if(provider) {
            try{
                const web3 = new Web3(window.ethereum);
                resolve(web3);
            } catch(err) {
                reject(err);
            }
        }
        resolve(false);
    });
}

const getSelectedAccount = async () => {
    const provider = await detectEthereumProvider();
    if(!provider) return false;
    if(provider.selectedAddress) return provider.selectedAddress;
    return undefined;    
}

const requestAccounts = async () => {
    const provider = await detectEthereumProvider();
    if(!provider) return false;
    if(provider.selectedAddress) return provider.selectedAddress;
    try{
        await provider.request({method: "eth_requestAccounts"});
    } catch(err) {
        console.error(err);
    }
    return provider.selectedAddress;
}


export {getWeb3, requestAccounts, getSelectedAccount};