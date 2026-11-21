/**
 * Unit tests for Hisaab Settle Up Algorithm
 * Run with: node src/utils/settleUp.test.js
 */

import assert from 'node:assert/strict';
import {
  rupeesToPaise,
  paiseToRupees,
  formatRupees,
  calculateNetBalances,
  calculateSettlements
} from './settleUp.js';

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
  }
}

console.log('\n--- Running Hisaab Settle-Up Tests ---');

test('rupeesToPaise converts valid rupee values to integer paise correctly', () => {
  assert.equal(rupeesToPaise(100), 10000);
  assert.equal(rupeesToPaise('50.25'), 5025);
  assert.equal(rupeesToPaise('0.99'), 99);
  assert.equal(rupeesToPaise(33.33), 3333);
});

test('rupeesToPaise throws error on zero or negative values', () => {
  assert.throws(() => rupeesToPaise(0), /Amount must be a positive number/);
  assert.throws(() => rupeesToPaise(-50), /Amount must be a positive number/);
  assert.throws(() => rupeesToPaise('abc'), /Amount must be a positive number/);
});

test('paiseToRupees formats integers correctly', () => {
  assert.equal(paiseToRupees(10000), '100');
  assert.equal(paiseToRupees(5025), '50.25');
  assert.equal(formatRupees(5025), 'Rs 50.25');
  assert.equal(formatRupees(-5000), '-Rs 50');
});

test('calculateNetBalances evenly divides expenses with exact paise preservation', () => {
  const members = ['Alice', 'Bob', 'Charlie'];
  // 100 Rs = 10000 paise split between 3 people: 3334, 3333, 3333
  // Alice paid 10000, owes 3334 -> net +6666
  // Bob owes 3333 -> net -3333
  // Charlie owes 3333 -> net -3333
  const expenses = [
    {
      payer: 'Alice',
      amountInPaise: 10000,
      splitBetween: ['Alice', 'Bob', 'Charlie']
    }
  ];

  const balances = calculateNetBalances(members, expenses);
  assert.equal(balances['Alice'], 6666);
  assert.equal(balances['Bob'], -3333);
  assert.equal(balances['Charlie'], -3333);

  // Sum of all balances must be exactly zero!
  const totalBalance = Object.values(balances).reduce((sum, b) => sum + b, 0);
  assert.equal(totalBalance, 0);
});

test('calculateSettlements matches largest debtor with largest creditor greedily', () => {
  // Alice net +6666, Bob net -3333, Charlie net -3333
  const netBalances = {
    Alice: 6666,
    Bob: -3333,
    Charlie: -3333
  };

  const settlements = calculateSettlements(netBalances);
  assert.equal(settlements.length, 2);
  // Both Bob and Charlie pay Alice
  assert.equal(settlements[0].to, 'Alice');
  assert.equal(settlements[1].to, 'Alice');
  const totalSettled = settlements.reduce((sum, s) => sum + s.amountInPaise, 0);
  assert.equal(totalSettled, 6666);
});

test('calculateSettlements resolves 4-person multi-expense debts in minimum transactions', () => {
  // Alice paid 400 for all 4 (Alice, Bob, Charlie, Dave) -> each owes 100
  // Dave paid 200 for Bob & Dave -> each owes 100
  // Net balances:
  // Alice: paid 400, owes 100 -> +300
  // Dave: paid 200, owes (100 + 100) = 200 -> 0
  // Bob: paid 0, owes (100 + 100) = 200 -> -200
  // Charlie: paid 0, owes 100 -> -100
  const members = ['Alice', 'Bob', 'Charlie', 'Dave'];
  const expenses = [
    { payer: 'Alice', amountInPaise: 40000, splitBetween: members },
    { payer: 'Dave', amountInPaise: 20000, splitBetween: ['Bob', 'Dave'] }
  ];

  const netBalances = calculateNetBalances(members, expenses);
  assert.equal(netBalances['Alice'], 30000);
  assert.equal(netBalances['Dave'], 0);
  assert.equal(netBalances['Bob'], -20000);
  assert.equal(netBalances['Charlie'], -10000);

  const settlements = calculateSettlements(netBalances);
  // Bob pays Alice Rs 200, Charlie pays Alice Rs 100 (only 2 transactions needed!)
  assert.equal(settlements.length, 2);
  assert.equal(settlements[0].from, 'Bob');
  assert.equal(settlements[0].to, 'Alice');
  assert.equal(settlements[0].amountInPaise, 20000);
  assert.equal(settlements[1].from, 'Charlie');
  assert.equal(settlements[1].to, 'Alice');
  assert.equal(settlements[1].amountInPaise, 10000);
});

test('calculateSettlements handles already settled group', () => {
  const netBalances = { Alice: 0, Bob: 0 };
  const settlements = calculateSettlements(netBalances);
  assert.equal(settlements.length, 0);
});

console.log(`\nTests passed: ${passed}/${total}`);
if (passed === total) {
  console.log('All tests passed successfully!\n');
} else {
  process.exit(1);
}
