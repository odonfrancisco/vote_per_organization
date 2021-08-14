import AccessToken from '../contracts/AccessToken.json';

const getAccessToken = async web3 => {
    const networkId = await web3.eth.net.getId();
    const contractDeployment = await AccessToken.networks[networkId];
    return new web3.eth.Contract(
        AccessToken.abi,
        contractDeployment && contractDeployment.address
    );
}

export default getAccessToken;