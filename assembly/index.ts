// @nearfile
import { context, storage, logging, PersistentMap } from "near-sdk-as";

// --- contract code goes below

const balances = new PersistentMap<string, u64>("b:");
const approves = new PersistentMap<string, u64>("a:");
const votes = new PersistentMap<string, u64>("c:");

const TOTAL_SUPPLY: u64 = 1000000;
const name: string ="Light";
const symbol: string="LI";
const precision:u8=8;
export function init(initialOwner: string): void {
  logging.log("initialOwner: " + initialOwner);
  assert(storage.get<string>("init") == null, "Already initialized token supply");
  balances.set(initialOwner, TOTAL_SUPPLY);
  storage.set("init", "done");
}

export function totalSupply(): string {
  return TOTAL_SUPPLY.toString();
}

export function tokenName(): string {
  return name;
}

export function tokenSymbol(): string {
  return symbol;
}

export function tokenPrecision(): u8 {
  return precision;
}
export function balanceOf(tokenOwner: string): u64 {
  logging.log("balanceOf: " + tokenOwner);
  if (!balances.contains(tokenOwner)) {
    return 0;
  }
  const result = balances.getSome(tokenOwner);
  return result;
}

export function allowance(tokenOwner: string, spender: string): u64 {
  const key = tokenOwner + ":" + spender;
  if (!approves.contains(key)) {
    return 0;
  }
  return approves.getSome(key);
}

export function transfer(to: string, tokens: u64): boolean {
  logging.log("transfer from: " + context.sender + " to: " + to + " tokens: " + tokens.toString());
  const fromAmount = getBalance(context.sender);
  assert(fromAmount >= tokens, "not enough tokens on account");
  assert(getBalance(to) <= getBalance(to) + tokens,"overflow at the receiver side");
  balances.set(context.sender, fromAmount - tokens);
  balances.set(to, getBalance(to) + tokens);
  return true;
}

export function approve(spender: string, tokens: u64): boolean {
  logging.log("approve: " + spender + " tokens: " + tokens.toString());
  approves.set(context.sender + ":" + spender, tokens);
  return true;
}

export function transferFrom(from: string, to: string, tokens: u64): boolean {
  const fromAmount = getBalance(from);
  assert(fromAmount >= tokens, "not enough tokens on account");
  const approvedAmount = allowance(from, to);
  assert(tokens <= approvedAmount, "not enough tokens approved to transfer");
  assert(getBalance(to) <= getBalance(to) + tokens,"overflow at the receiver side");
  balances.set(from, fromAmount - tokens);
  balances.set(to, getBalance(to) + tokens);
  return true;
}

function getBalance(owner: string): u64 {
  return balances.contains(owner) ? balances.getSome(owner) : 0;
}

/*
export function get_num(): u64 {
  return storage.getPrimitive<u64>("counter", 1);
}

// Public method - Increment the counter
export function increment(): void {
  safeguard_overflow()
  const new_value = get_num()+1;
  storage.set<u64>("counter", new_value);
  logging.log("Increased number to " +  new_value.toString());
}

// Public method - Decrement the counter
export function decrement(): void {
  safeguard_underflow()
  const new_value = get_num() - 1;
  storage.set<u64>("counter", new_value);
  logging.log("Decreased number to " + new_value.toString());
}

// Public method - Reset to zero
export function reset(): void {
  storage.set<u64>("counter", 1);
  logging.log("Reset counter to one");
}

// Private method - Safeguard against overflow
function safeguard_overflow(): void{
  const value = get_num()
  assert(value < 127, "Counter is at maximum")
}

// Private method - Safeguard against underflow
function safeguard_underflow(): void{
  const value = get_num()
  assert(value > -128, "Counter is at minimum")
}
*/

export function vote():u64{
  let num_votes:u64=1
  //assert(getBalance(context.sender)>=vote_count);
  if(!votes.contains(context.sender)){
    assert((num_votes*num_votes) <= getBalance(context.sender), "not enough tokens to vote");
    votes.set(context.sender,num_votes);
  }
  else{
    let num_votes=votes.getSome(context.sender);
    num_votes++;
    assert((num_votes*num_votes) <= getBalance(context.sender), "not enough tokens to vote");
    votes.set(context.sender,num_votes);

  }
  let vote_count=votes.getSome(context.sender);
  
  transfer("light.sputnikv2.testnet",vote_count*vote_count);
  //logging.log("vote from" + context.sender + "with tokens : " + vote_count.toString());
  return vote_count;
}
