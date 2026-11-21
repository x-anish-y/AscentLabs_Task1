/**
 * Hisaab - Settle Up Algorithm (Greedy Cash Flow Minimizer)
 *
 * All amounts are handled in integer PAISE (1 Rupee = 100 Paise)
 * to avoid floating-point representation bugs (e.g. 0.1 + 0.2 !== 0.3).
 */

/**
 * Converts a decimal rupee string/number to integer paise.
 * Throws an error if invalid, zero, or negative.
 * @param {string|number} amount
 * @returns {number} Integer paise
 */
export function rupeesToPaise(amount) {
  if (typeof amount === 'number') {
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }
    return Math.round(amount * 100);
  }

  const clean = String(amount).trim();
  const parsed = parseFloat(clean);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error('Amount must be a positive number');
  }
  return Math.round(parsed * 100);
}

/**
 * Converts integer paise to decimal rupees string.
 * @param {number} paise
 * @returns {string} E.g. "500" or "500.50"
 */
export function paiseToRupees(paise) {
  const rs = Math.abs(paise) / 100;
  return rs % 1 === 0 ? rs.toFixed(0) : rs.toFixed(2);
}

/**
 * Formats integer paise into standard Indian Rupee notation.
 * e.g., 50000 -> "Rs 500", 50050 -> "Rs 500.50"
 * @param {number} paise
 * @returns {string}
 */
export function formatRupees(paise) {
  const sign = paise < 0 ? '-' : '';
  return `${sign}Rs ${paiseToRupees(paise)}`;
}

/**
 * Computes net balance in paise for each member.
 * Net balance = (Total money paid by person) - (Total share owed by person)
 *
 * @param {string[]} members - Array of member names
 * @param {Array<{ payer: string, amountInPaise: number, splitBetween: string[] }>} expenses
 * @returns {Record<string, number>} Map of name to net balance in paise
 */
export function calculateNetBalances(members, expenses) {
  const balances = {};
  for (const m of members) {
    balances[m] = 0;
  }

  for (const exp of expenses) {
    const { payer, amountInPaise, splitBetween } = exp;

    // Only process if payer is still in the group
    if (!members.includes(payer)) continue;

    // Filter splitters to only active members
    const validSplitters = (splitBetween || []).filter(m => members.includes(m));
    if (validSplitters.length === 0) continue;

    // Credit payer with the full amount paid
    balances[payer] = (balances[payer] || 0) + amountInPaise;

    // Deduct each splitter's fair share in exact integer paise
    const baseShare = Math.floor(amountInPaise / validSplitters.length);
    const remainder = amountInPaise % validSplitters.length;

    validSplitters.forEach((person, idx) => {
      // Distribute leftover paise so the sum of individual shares exactly equals amountInPaise
      const share = idx < remainder ? baseShare + 1 : baseShare;
      balances[person] = (balances[person] || 0) - share;
    });
  }

  return balances;
}

/**
 * Greedy Cash Flow Minimization Algorithm
 * Computes the minimum number of settle-up transactions needed to clear all debts.
 *
 * Strategy:
 * 1. Filter out settled members (net balance = 0).
 * 2. Separate into Creditors (balance > 0) and Debtors (balance < 0).
 * 3. Sort both descending by magnitude.
 * 4. Match the largest debtor with the largest creditor:
 *    - Transact min(debt, credit).
 *    - Deduct settled amount from both.
 *    - Whichever becomes 0 is removed; the other stays with the remaining balance.
 * 5. Repeat until all balances are zero.
 *
 * @param {Record<string, number>} netBalances
 * @returns {Array<{ from: string, to: string, amountInPaise: number, text: string }>}
 */
export function calculateSettlements(netBalances) {
  const creditors = [];
  const debtors = [];

  for (const [person, balance] of Object.entries(netBalances)) {
    if (balance > 0) {
      creditors.push({ name: person, amount: balance });
    } else if (balance < 0) {
      debtors.push({ name: person, amount: -balance }); // positive debt amount
    }
  }

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];

  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const settledAmount = Math.min(creditor.amount, debtor.amount);

    if (settledAmount > 0) {
      transactions.push({
        from: debtor.name,
        to: creditor.name,
        amountInPaise: settledAmount,
        text: `${debtor.name} pays ${creditor.name} Rs ${paiseToRupees(settledAmount)}`
      });
    }

    creditor.amount -= settledAmount;
    debtor.amount -= settledAmount;

    if (creditor.amount === 0) cIdx++;
    if (debtor.amount === 0) dIdx++;
  }

  return transactions;
}
