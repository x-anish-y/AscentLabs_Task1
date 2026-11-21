import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit3, X, AlertCircle } from 'lucide-react';
import { rupeesToPaise, paiseToRupees } from '../utils/settleUp';

export default function ExpenseForm({
  members,
  onSaveExpense,
  editingExpense,
  onCancelEdit
}) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('');
  const [splitBetween, setSplitBetween] = useState([]);
  const [error, setError] = useState('');

  // Synchronize when editing an existing expense or when members change
  useEffect(() => {
    if (editingExpense) {
      setDescription(editingExpense.description);
      setAmount(paiseToRupees(editingExpense.amountInPaise));
      setPayer(editingExpense.payer);
      setSplitBetween(editingExpense.splitBetween || members);
      setError('');
    } else {
      resetForm();
    }
  }, [editingExpense, members]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setPayer(members[0] || '');
    setSplitBetween([...members]); // Default: everyone equally
    setError('');
  };

  const handleToggleSplitter = (memberName) => {
    if (splitBetween.includes(memberName)) {
      if (splitBetween.length === 1) {
        setError('At least one person must be included in the split');
        return;
      }
      setSplitBetween(splitBetween.filter(m => m !== memberName));
    } else {
      setSplitBetween([...splitBetween, memberName]);
    }
    setError('');
  };

  const handleSelectAllSplitters = () => {
    setSplitBetween([...members]);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setError('Please provide a description (e.g. Dinner, Groceries)');
      return;
    }

    if (!payer || !members.includes(payer)) {
      setError('Please select a valid payer from the group');
      return;
    }

    if (splitBetween.length === 0) {
      setError('Please select at least one person to split between');
      return;
    }

    let paise;
    try {
      paise = rupeesToPaise(amount);
    } catch {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    onSaveExpense({
      id: editingExpense ? editingExpense.id : `exp-${Date.now()}`,
      description: description.trim(),
      amountInPaise: paise,
      payer,
      splitBetween,
      date: editingExpense ? editingExpense.date : new Date().toISOString()
    });

    if (editingExpense && onCancelEdit) {
      onCancelEdit();
    } else {
      resetForm();
    }
  };

  if (members.length === 0) {
    return (
      <div className="card">
        <h3 className="card-title">Add Expense</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Please add group members above before logging expenses.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card-title">
        {editingExpense ? (
          <>
            <Edit3 size={18} className="text-primary" />
            Edit Expense
          </>
        ) : (
          <>
            <PlusCircle size={18} className="text-primary" />
            Log New Expense
          </>
        )}
      </h3>

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            type="text"
            className="btn-full"
            placeholder="What was this for? (e.g. Dinner, Cab, Groceries)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-row form-group">
          <div>
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="btn-full"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Who Paid?</label>
            <select
              className="btn-full"
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
            >
              {members.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label className="form-label" style={{ margin: 0 }}>
              Split Between ({splitBetween.length} selected)
            </label>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleSelectAllSplitters}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              Select Everyone
            </button>
          </div>

          <div className="checkbox-grid">
            {members.map((m) => (
              <label key={m} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={splitBetween.includes(m)}
                  onChange={() => handleToggleSplitter(m)}
                />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {m}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            {editingExpense ? 'Update Expense' : 'Add Expense'}
          </button>
          {editingExpense && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelEdit}
            >
              <X size={16} />
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
