import React, { useState, useEffect } from 'react';
import './css/App.css';
import { getWeb3, requestAccounts, getSelectedAccount } from './utils/getWeb3';
import { Switch, Route } from 'react-router-dom';

function App() {
  const [web3, setWeb3] = useState();
  const [selectedAddress, setSelectedAddress] = useState();

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const currentAddress = await getSelectedAccount();

      setWeb3(web3)
      setSelectedAddress(currentAddress)

      if(currentAddress){
        await connectEth();
      }
    }
    init();
  }, [])


  const connectEth = async () => {
    setSelectedAddress(await requestAccounts());

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
        <button onClick={connectEth}>
          Connect Metamask
        </button>
      </div>
    )
  }
  
  return (
    <div>
      
    </div>
  );
}

export default App;
