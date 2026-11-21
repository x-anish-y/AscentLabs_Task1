import React, { useState, useMemo } from 'react';
import { Divide, RotateCcw, Trash, IndianRupee } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { calculateNetBalances, calculateSettlements } from './utils/settleUp';
import MemberManager from './components/MemberManager';
import ExpenseForm from './components/ExpenseForm';
import BalanceSummary from './components/BalanceSummary';
import SettleUpPlan from './components/SettleUpPlan';
import ExpenseList from './components/ExpenseList';

const INITIAL_MEMBERS = ['Anish', 'Priya', 'Rahul'];

const INITIAL_EXPENSES = [
  {
    id: 'exp-demo-1',
    description: 'Team Dinner at Cafe',
    amountInPaise: 150000, // Rs 1500.00
    payer: 'Anish',
    splitBetween: ['Anish', 'Priya', 'Rahul'],
    date: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'exp-demo-2',
    description: 'Shared Cab to Airport',
    amountInPaise: 60000, // Rs 600.00
    payer: 'Priya',
    splitBetween: ['Anish', 'Priya'],
    date: new Date().toISOString()
  }
];

export default function App() {
  const [members, setMembers] = useLocalStorage('hisaab_members', INITIAL_MEMBERS);
  const [expenses, setExpenses] = useLocalStorage('hisaab_expenses', INITIAL_EXPENSES);
  const [editingExpense, setEditingExpense] = useState(null);

  // Compute reactive balances in integer paise
  const netBalances = useMemo(() => {
    return calculateNetBalances(members, expenses);
  }, [members, expenses]);

  // Compute minimal settle-up plan
  const settlements = useMemo(() => {
    return calculateSettlements(netBalances);
  }, [netBalances]);

  // Member Handlers
  const handleAddMember = (newMember) => {
    setMembers((prev) => [...prev, newMember]);
  };

  const handleRemoveMember = (memberName) => {
    setMembers((prev) => prev.filter((m) => m !== memberName));
    // Also remove from any expense split list
    setExpenses((prev) =>
      prev.map((exp) => ({
        ...exp,
        splitBetween: exp.splitBetween.filter((m) => m !== memberName)
      }))
    );
  };

  // Expense Handlers
  const handleSaveExpense = (expenseData) => {
    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === expenseData.id ? expenseData : exp))
      );
      setEditingExpense(null);
    } else {
      setExpenses((prev) => [expenseData, ...prev]);
    }
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    if (editingExpense && editingExpense.id === id) {
      setEditingExpense(null);
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all members and expenses to default sample data?')) {
      setMembers(INITIAL_MEMBERS);
      setExpenses(INITIAL_EXPENSES);
      setEditingExpense(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all members and expenses?')) {
      setMembers([]);
      setExpenses([]);
      setEditingExpense(null);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-group">
          <div className="logo-badge">
            <IndianRupee size={24} />
          </div>
          <div>
            <h1 className="brand-title">Hisaab</h1>
            <p className="brand-subtitle">
              Smart Group Expense Splitter & Greedy Settlement Planner
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleResetDemo}
            title="Reload initial sample data"
          >
            <RotateCcw size={14} />
            <span>Reset Demo</span>
          </button>
          <button
            type="button"
            className="btn btn-danger-outline btn-sm"
            onClick={handleClearAll}
            title="Clear all stored data"
          >
            <Trash size={14} />
            <span>Clear All</span>
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="dashboard-grid">
        {/* Left Column: Form & Management */}
        <section>
          <MemberManager
            members={members}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            expenses={expenses}
          />

          <ExpenseForm
            members={members}
            onSaveExpense={handleSaveExpense}
            editingExpense={editingExpense}
            onCancelEdit={() => setEditingExpense(null)}
          />
        </section>

        {/* Right Column: Balances, Settle-Up, and History */}
        <section>
          <BalanceSummary netBalances={netBalances} />

          <SettleUpPlan settlements={settlements} />

          <ExpenseList
            expenses={expenses}
            onEditExpense={(exp) => setEditingExpense(exp)}
            onDeleteExpense={handleDeleteExpense}
          />
        </section>
      </main>
    </div>
  );
}
