const path = require('path');
const provider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const secrets = JSON.parse(
  fs.readFileSync('.secrets.json').toString().trim()
);


module.exports = {
  // Configure build to go to client side of app
  contracts_build_directory: path.join(__dirname, "../client/src/contracts"),

  networks: {
    development: {
     host: "127.0.0.1",     
     port: 8545,
     network_id: "*",
    },
    kovan: {
      provider: () => 
        new provider(
          secrets.privateKeys,
          "https://kovan.infura.io/v3/481a67d9cd27407c8c165d9291ab9229",
          0,
          4
        ),
      network_id: 42
    },
    rinkeby: {
      provider: () => 
        new provider(
          secrets.privateKeys,
          "https://rinkeby.infura.io/v3/481a67d9cd27407c8c165d9291ab9229",
          0,
          4
        ),
      network_id: 4
    }
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.6",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },

  db: {
    enabled: false
  }
};
