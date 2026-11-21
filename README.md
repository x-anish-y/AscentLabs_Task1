# Hisaab (AscentLabs_Task1)

A clean, responsive group expense splitting and debt settlement web application. Hisaab tracks group expenses, computes net balances per person in real-time, and generates an optimal settle-up plan with the fewest possible transactions using a greedy cash flow minimization algorithm.

**Live Demo:** [https://ascent-labs-task1-hisaab.vercel.app/](https://ascent-labs-task1-hisaab.vercel.app/) *(or deploy URL)*  
**Repository:** [https://github.com/x-anish-y/AscentLabs_Task1](https://github.com/x-anish-y/AscentLabs_Task1)

---

## Features

- **Member Management**: Add people to your group or remove them dynamically.
- **Expense Logging**: Log expenses with description, amount in ₹, payer, and custom participant split (default: equally between everyone).
- **Edit & Delete**: Full CRUD support for expenses with instant balance recalculation.
- **Optimal Settle-Up Plan**: Uses a greedy cash flow minimization algorithm matching the largest debtor with the largest creditor to minimize total transactions.
- **Paise-Level Financial Accuracy**: All amounts are parsed and computed in integer paise (1 Rupee = 100 Paise) to completely eliminate floating-point arithmetic errors (`0.1 + 0.2 !== 0.3`). Remainder paise are systematically distributed.
- **Fault-Tolerant Persistence**: Safe synchronization with `localStorage` wrapped in `try/catch` blocks.
- **Unit Tested Algorithm**: Standalone unit test suite (`npm test`) covering math, odd splits, and greedy settlement edge cases.
- **Modern, Responsive Dark UI**: Optimized for mobile, tablet, and desktop viewports with accessible input states.

---

## Tech Stack

- **Frontend Library**: React 19
- **Build Tool & Bundler**: Vite
- **Icons**: Lucide React
- **Styling**: Custom modern CSS using CSS variables (no bloated CSS frameworks)
- **State & Storage**: React Hooks (`useState`, `useMemo`, `useEffect`) + `localStorage`
- **Testing**: Node.js Native Test Assertions (`assert/strict`)

---

## Project Structure

```text
AscentLabs_Task1/
├── src/
│   ├── components/
│   │   ├── BalanceSummary.jsx    # Visual cards for net balances (creditor/debtor)
│   │   ├── ExpenseForm.jsx       # Add & edit expense modal/card with validation
│   │   ├── ExpenseList.jsx       # List of logged expenses with edit/delete actions
│   │   ├── MemberManager.jsx     # Member addition, validation, and badges
│   │   └── SettleUpPlan.jsx      # Greedy minimal settlement instructions ("A pays B Rs X")
│   ├── hooks/
│   │   └── useLocalStorage.js    # Resilient localStorage hook with error boundary
│   ├── utils/
│   │   ├── settleUp.js           # Core greedy settle-up & balance calculation engine
│   │   └── settleUp.test.js      # Unit tests for settleUp logic
│   ├── App.jsx                   # Main application layout and coordinator
│   ├── index.css                 # Clean, modern design system and theme variables
│   └── main.jsx                  # React application entry point
├── package.json
└── vite.config.js
```

---

## Getting Started Locally

### Prerequisites

- Node.js (v18+)
- npm (v9+)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/x-anish-y/AscentLabs_Task1.git
   cd AscentLabs_Task1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run unit tests:
   ```bash
   npm test
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```
