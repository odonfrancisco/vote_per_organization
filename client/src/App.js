// Styling imports
import './css/App.css';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
// React
import React, { useState, useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
// Web3 utility functions
import getAccessToken from './utils/getTokenContract';
import { getWeb3, requestAccounts } from './utils/getWeb3';
import { createVotingContract } from './utils/votingContract';
// Components
import OrganizationDetails from './components/organization/OrganizationDetails';
import OrganizationList from './components/organization/OrganizationList';
import OrganizationCreate from './components/organization/OrganizationCreate';
import NavBar from './components/NavBar';

// tasks
/* Store tokenURI org name in browser localstorage as temporary fix 
to not having org name saved to tokenURI (and so as to not be 
calling new web3.contract per item in list (would be fucking nuts if someone 
had like 28 different orgs they're a part of) )*/ 
// Fix navbar float feature

// feature creep
// could add a function so that poll will automatically decide itself in x amount of time
// // or adding a button for admin to decide a poll
// prevent admin from creating a second poll with the same name
/* Would sort polls by already decided. Have those that've been decided
on separate section */ 
/* Make 'Happy Voting' on header take you to a random organization (tht u own)
when clicked */
// Show result per option on decided
// show message when user votes on poll and it resets, explaining that poll ended in a draw
// I feel like i'm not leveraging the emitted contract events 
/* could potentially add a feature to let admin specify a name
per approved address */
/* ERC721 not supported by wallet_watchAsset just yet, so currently
adding accesstoken to user wallet as an erc20 token */
// set accessTokenID to a real ID instead of its index. something like uuid
/* When creating org, the popup explaining the need to confirm two
transactions would be unecessary if using ipfs in conjunction with tokenURI */



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
    window.ethereum.on("accountsChanged", () => {
      /* When on a particular organization page, and changed accounts
      to one that also has just one org, i would get a 'must have access
      token to perform this action' error, so i added this redirect
      to avoid that error from happening */
      setRedirect(<Redirect to={{
        pathname: `/`
      }}/>);
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
      
      if(balanceOfUser === '1'){
        setRedirect(<Redirect to={{
          pathname: `/organizations/${userTokenURIs[0]}`
        }}/>);
      } else if(balanceOfUser > 1){
        setRedirect(<Redirect to="/organizations"/>)
      } else {
        setRedirect(<Redirect to="/newOrganization"/>)
      }
  }

  const createOrganization = async name => {
    let success = false;
    await createVotingContract(name, selectedAddress, web3, accessToken._address)
      .then(() => {
        setRedirect(<Redirect to={{
          pathname: `/`
        }}/>);
        setRefresh(refresh => !refresh);    
        success = true;
      })
      .catch(err => {
        console.error(err);
      })
    return success;
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
    <Container disableGutters> 
      {/* Is this the correct way to render a redirect? */}
      {redirect}
      
      <NavBar/>
        <Box mt={3}>
          <Container>
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

          </Container>
        </Box>
    </Container>
  );
}

export default App;
