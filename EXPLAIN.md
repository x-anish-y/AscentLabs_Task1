# Code Walkthrough Cheat Sheet - Hisaab (AscentLabs_Task1)

Use this guide during technical interviews or code reviews to explain your codebase with confidence.

---

## 1. High-Level Architecture & File-by-File Breakdown

```text
src/
├── utils/settleUp.js        -> Core algorithmic engine: integer conversions, net balance calculations, and greedy settlement logic.
├── utils/settleUp.test.js   -> Standalone test suite verifying exact math, split remainders, and debt settlement.
├── hooks/useLocalStorage.js -> Custom React hook wrapping localStorage with try/catch fallback for resilient persistence.
├── components/
│   ├── MemberManager.jsx    -> Handles group members, validation against duplicates, and safe member deletion.
│   ├── ExpenseForm.jsx      -> Form for creating and editing expenses with paise conversion and participant selection.
│   ├── ExpenseList.jsx      -> Chronological expense feed with edit/delete triggers.
│   ├── BalanceSummary.jsx   -> Real-time visual cards displaying who is owed and who owes money.
│   └── SettleUpPlan.jsx     -> Displays the computed minimal settle-up transactions ("A pays B Rs X").
├── App.jsx                  -> Top-level component holding state, calling settlement utilities via useMemo, and orchestrating layout.
├── index.css                -> Custom CSS design system using CSS variables, flexbox, and CSS grid.
└── main.jsx                 -> Standard React 19 entry point mounting into the DOM.
```

---

## 2. Key Functions & Algorithms in Plain Language

### 1. `rupeesToPaise(amount)` (`src/utils/settleUp.js`)
- **What it does:** Accepts a string or numeric value in rupees (e.g., `49.50`) and turns it into integer paise (`4950`).
- **Why:** In JavaScript, `0.1 + 0.2 === 0.30000000000000004` due to IEEE-754 binary floating-point representation. By doing all arithmetic in integer cents/paise, we completely eliminate fractional rounding bugs.

### 2. `calculateNetBalances(members, expenses)` (`src/utils/settleUp.js`)
- **What it does:** Calculates each person's single net position.
- **Plain English:**
  - If you paid for an expense, your net balance increases by the total amount.
  - For every expense you participated in, your net balance decreases by your equal share: `Math.floor(amount / participants)`.
  - Leftover indivisible paise from division are given 1-by-1 to the first few participants to ensure the sum of shares matches the total exactly.
  - At the end: $\sum \text{balances} = 0$.

### 3. `calculateSettlements(netBalances)` (`src/utils/settleUp.js`)
- **What it does:** Solves the Cash Flow Minimization problem greedily.
- **Algorithm Steps:**
  1. Separate everyone with non-zero balances into two lists: **Creditors** (people owed money, balance $> 0$) and **Debtors** (people who owe money, balance $< 0$).
  2. Sort Creditors descending (biggest creditor first) and Debtors descending (biggest debtor first).
  3. Greedily match the largest debtor with the largest creditor. The payment amount is $\min(\text{debt}, \text{credit})$.
  4. Deduct the settled amount from both. Whichever person's balance becomes 0 is removed.
  5. Repeat until all balances reach 0.
- **Result:** Produces the settle-up list with format: `"A pays B Rs X"`.

---

## 3. Why Each Technical Decision Was Made

1. **Integer Paise vs Floats:**
   - *Decision:* Multiply by 100 on input, perform all operations on integers, divide by 100 on display.
   - *Reason:* Standard banking/fintech convention (Stripe, PayPal, Splitwise). Avoids floating point creep where ₹0.01 appears or disappears out of nowhere.

2. **Greedy Settlement Heuristic:**
   - *Decision:* Matched largest creditor with largest debtor ($O(N \log N)$).
   - *Reason:* Standard Splitwise approach. While the theoretical minimum transaction problem is NP-complete (variant of Subset Sum), greedy matching yields optimal or near-optimal transactions in $O(N \log N)$ time with simple, explainable code.

3. **`useMemo` for Calculations in `App.jsx`:**
   - *Decision:* Memoized `netBalances` and `settlements`.
   - *Reason:* Avoids recalculating the algorithm on unrelated renders (like typing in a text field). Only recomputes when `members` or `expenses` change.

4. **Pure CSS Variables over CSS Frameworks:**
   - *Decision:* Hand-crafted CSS using custom properties (`--bg-card`, `--primary`, etc.).
   - *Reason:* Zero runtime overhead, clean readable CSS, fully responsive with CSS grid and flexbox, without adding large external dependencies.

5. **`try/catch` in `useLocalStorage`:**
   - *Decision:* Wrapped read/write operations in defensive `try/catch`.
   - *Reason:* Browsers in Private/Incognito mode or strict security policies can throw `QuotaExceededError` or `SecurityError` when accessing `window.localStorage`. The hook gracefully falls back to React state without crashing the app.

---

## 4. 8 Likely Interview Questions & Short Answers

### Q1: Why did you work with paise instead of normal decimal rupees?
> "JavaScript numbers are 64-bit IEEE-754 floating points, which cannot precisely represent fractional decimals like 0.1 or 0.2. To prevent rounding errors and ensure that the sum of split shares always equals the total expense down to the exact paisa, I store all values as integer paise and only convert back to rupees for display."

### Q2: How does the settle-up algorithm work?
> "It calculates each person's net balance first. Members with positive balances are Creditors; members with negative balances are Debtors. We sort both lists descending and iteratively match the largest debtor with the largest creditor, transferring $\min(\text{debt}, \text{credit})$ until all debts are cleared. This minimizes total transactions greedily."

### Q3: Is the greedy approach always mathematically guaranteed to yield the absolute minimum transactions?
> "In most real-world scenarios, yes. However, mathematically, cash flow minimization is an NP-complete problem equivalent to the Subset Sum problem. For example, if Debtor A owes 50, Debtor B owes 50, and Creditor C is owed 100, greedy solves it in 2 steps. But if isolated sub-groups exist whose balances independently sum to zero, a subset-sum partition could theoretically isolate them. The greedy approach is the industry standard (used by Splitwise) because it runs efficiently in $O(N \log N)$ without exponential overhead."

### Q4: How do you handle remainders when an amount doesn't divide evenly?
> "When dividing integer paise by $N$ participants, `Math.floor(paise / N)` gives the base share, and `paise % N` gives the remainder. I distribute the remainder 1 paisa at a time to the first few participants. This ensures $\sum \text{shares} \equiv \text{total}$ without losing even a single paisa."

### Q5: How do you handle persistence and what happens if localStorage is unavailable?
> "I built a custom `useLocalStorage` hook that wraps `getItem` and `setItem` in `try/catch` blocks. If storage fails (such as in restricted private browsing mode or when storage quota is exceeded), it logs a warning and maintains standard React in-memory state so the UI never crashes."

### Q6: Why did you choose React state over Redux or Zustand?
> "The state for this app consists solely of `members` and `expenses`. Adding external state management libraries like Redux or Zustand would be over-engineering. React's built-in `useState` combined with `useMemo` handles reactive state and derived calculations cleanly and performantly."

### Q7: What is the time complexity of the settlement algorithm?
> "Extracting balances takes $O(E \times P)$, where $E$ is the number of expenses and $P$ is the average participants per expense. Sorting creditors and debtors takes $O(M \log M)$, where $M$ is the number of group members. The greedy matching while-loop takes at most $O(M)$ iterations. Therefore, the overall time complexity is $O(E \cdot P + M \log M)$, which executes in milliseconds even for hundreds of transactions."

### Q8: What happens when an expense is edited or deleted?
> "Because `netBalances` and `settlements` are derived values wrapped in `useMemo` dependent on `[members, expenses]`, updating or deleting an expense from state triggers an immediate, synchronous recalculation of all balances and the settle-up plan."
