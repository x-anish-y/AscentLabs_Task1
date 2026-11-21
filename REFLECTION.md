# Project Reflection - Hisaab (AscentLabs_Task1)

## What I Built
I built **Hisaab**, a React application designed to eliminate group expense friction. It allows users to create groups, log shared expenses with customized splits, and automatically computes each person's net balance. Most importantly, it calculates the optimal settle-up transaction plan using a greedy cash flow minimization algorithm, outputting clear instructions in the format `"A pays B Rs X"`.

## What Was Tricky or Broke During Development
1. **Floating Point Rounding & Remainder Distribution:**
   - *The Problem:* Splitting a total like ₹100 among 3 people equals ₹33.3333... If represented as standard floats, `33.33 * 3 = 99.99`, creating a 1-paisa leak where net balances failed to sum to zero.
   - *The Fix:* Converted all amounts to integer paise (1 Rupee = 100 Paise) right at the input boundary (`rupeesToPaise`). When dividing by $N$ participants, computed integer base share `Math.floor(paise / N)` and distributed the `remainder = paise % N` one paisa each to the first remainder participants. This guarantees $\sum \text{shares} = \text{total}$ down to the exact paisa.

2. **Greedy Matching Invariants:**
   - *The Problem:* Debt settlement algorithms can loop indefinitely or produce redundant transactions if debts are not decremented cleanly or if zero-balance members aren't filtered prior to sorting.
   - *The Fix:* Implemented a strict two-pointer approach over sorted creditor and debtor arrays, greedily satisfying the smaller magnitude of the pair on every step and advancing the completed party's pointer.

3. **Data Integrity on Member Removal:**
   - *The Problem:* Deleting a member who participated in prior expenses orphaned transactions and caused `NaN` net balances.
   - *The Fix:* Added confirmation dialogs and sanitization so expenses filter out invalid participants dynamically without throwing uncaught exceptions.

## What I Would Do Differently
- **Graph-Theoretic Exact Subset Sum:** The greedy algorithm runs in $O(N \log N)$ and is standard for real-world apps like Splitwise. However, finding the absolute minimum transactions is NP-complete (equivalent to subset sum). For very small groups ($N \le 10$), an exact bitmask dynamic programming approach could find sub-groups whose net balances sum to 0 to save an extra transaction in rare cyclic edge cases.
- **Multi-Currency Support:** Add live conversion rates if expenses span multiple currencies (e.g., USD / INR).
- **Export to PDF/Receipt:** Allow generating a downloadable summary image or PDF of the settlement plan.
