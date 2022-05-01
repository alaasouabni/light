import "regenerator-runtime/runtime";

import * as nearAPI from "near-api-js"
import getConfig from "./config"
import { async } from "regenerator-runtime/runtime";



let nearConfig = getConfig(process.env.NODE_ENV || "development");
// Connects to NEAR and provides `near`, `walletAccount` and `contract` objects in `window` scope
async function connect() {
  // Initializing connection to the NEAR node.
  window.near = await nearAPI.connect(Object.assign(nearConfig, { deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() }}));

  // Needed to access wallet login
  window.walletAccount = new nearAPI.WalletAccount(window.near);

  // Initializing our contract APIs by contract name and configuration.
  window.contract = await near.loadContract(nearConfig.contractName, {
    viewMethods: ['totalSupply','tokenName','tokenSymbol','tokenPrecision', 'balanceOf', 'allowance','hist'],
    changeMethods: ['init', 'transfer', 'approve', 'transferFrom','vote'],
    sender: window.walletAccount.getAccountId()
  });
}

function updateUI() {
  if (!window.walletAccount.getAccountId()) {
    Array.from(document.querySelectorAll('.sign-in')).map(it => it.style = 'display: block;');
  } else {
    Array.from(document.querySelectorAll('.after-sign-in')).map(it => it.style = 'display: block;');
  }
}

// Log in user using NEAR Wallet on "Sign In" button click
document.querySelector('.sign-in .btn').addEventListener('click', () => {
  walletAccount.requestSignIn(nearConfig.contractName, 'NEAR token example');
});

document.querySelector('.sign-out .btn').addEventListener('click', () => {
  walletAccount.signOut();
  window.location.replace(window.location.origin + window.location.pathname);
});

document.querySelector('.vote .btn').addEventListener('click', () => {
  contract.vote();
});

async function write(){
  var ch=await contract.hist();
  document.getElementById('History').innerHTML = ch;
  return ch;}
document.querySelector('.history .btn').addEventListener('click', () => {
  write();
});

window.nearInitPromise = connect()
  .then(updateUI)
  .catch(console.error);
