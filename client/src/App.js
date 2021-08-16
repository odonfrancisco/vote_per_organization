import React, { useState, useEffect } from 'react';
import { getWeb3, requestAccounts } from './utils/getWeb3';
import { createVotingContract } from './utils/votingContract';
import OrganizationDetails from './components/organization/OrganizationDetails';
import OrganizationList from './components/organization/OrganizationList';
import OrganizationCreate from './components/organization/OrganizationCreate';
import NavBar from './components/NavBar';
import { Switch, Route, Redirect } from 'react-router-dom';
import './css/App.css';

import getAccessToken from './utils/getTokenContract';

function App() {
  const [web3, setWeb3] = useState();
  const [accessToken, setAccessToken] = useState();
  const [selectedAddress, setSelectedAddress] = useState();
  const [tokenURIs, setTokenURIs] = useState([]);
  const [redirect, setRedirect] = useState();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const acctArray = await window.ethereum.request({method: 'eth_accounts'});
      const currentAddress = acctArray[0];
      const accessToken = await getAccessToken(web3);

      setAccessToken(accessToken);
      setWeb3(web3)
      setSelectedAddress(currentAddress)
      if(currentAddress){
        await connectEth(currentAddress, accessToken);
      }
    }
    init();
  }, [refresh])

  // this refreshes the page anytime user changes accounts
  useEffect(() => {
    window.ethereum.on("accountsChanged", accounts => {
      setRefresh(refresh => !refresh);
    })
    return(() => window.ethereum.removeAllListeners());
  }, [])

  const connectEth = async (
    currentAddress,
    accessTokenRef = accessToken) => {
      setSelectedAddress(await requestAccounts());
      checkIfUserAccess(accessTokenRef, currentAddress || await requestAccounts());
  }

  const checkIfUserAccess = async (
    accessToken, 
    currentAddress) => {
      const balanceOfUser = await accessToken.methods.balanceOf(currentAddress).call();
      const userTokenURIs = [];

      for(let i = 0; i < balanceOfUser; i++){
        const tokenId = await accessToken.methods.tokenOfOwnerByIndex(currentAddress, i).call();
        const tokenURI = await accessToken.methods.tokenURI(tokenId).call();
        userTokenURIs.push(tokenURI);
      }

      setTokenURIs(userTokenURIs);
      
      // using == because accessToken.balanceOf returns a string
      if(balanceOfUser == 1){
        setRedirect(<Redirect to={{
          pathname: `/organizations/${userTokenURIs[0]}`
        }}/>);
      } else if(balanceOfUser > 1){
        // Should be passing array of TokenURI's? or call for them inside /organizations?
        setRedirect(<Redirect to="/organizations"/>)
      } else {
        setRedirect(<Redirect to="/newOrganization"/>)
      }
  }

  const createOrganization = async name => {
    await createVotingContract(name, selectedAddress, web3, accessToken._address);
    setRefresh(refresh => !refresh);
  }

  if(!web3) {
    return (
      <div>
        <h1>Please install MetaMask to use this Dapp</h1>
      </div>
    )
  }

  if(selectedAddress === null || selectedAddress === undefined) {
    return (
      <div>
        <h1>Please connect your MetaMask account to use this Dapp</h1>
        <button onClick={() => connectEth()}>
          Connect Metamask
        </button>
      </div>
    )
  }

  return (
    <div> 
      {/* Is this the correct way to render a redirect? */}
      {redirect}
      
      <NavBar/>
      
      <Switch>
        <Route exact path="/newOrganization">
          <OrganizationCreate 
            createOrganization={createOrganization}
            tokenAddr={accessToken._address}
          />
        </Route>
        <Route exact path="/organizations">
          <OrganizationList tokenURIs={tokenURIs}/>
        </Route>
        <Route path="/organizations/:address">
          <OrganizationDetails 
            web3={web3}
            accessToken={accessToken}
          />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
