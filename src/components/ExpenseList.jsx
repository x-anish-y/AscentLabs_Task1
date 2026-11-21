import React from 'react';
import { Receipt, Edit2, Trash2, Calendar, UserCheck } from 'lucide-react';
import { paiseToRupees } from '../utils/settleUp';

export default function ExpenseList({ expenses, onEditExpense, onDeleteExpense }) {
  if (expenses.length === 0) {
    return (
      <div className="card">
        <h3 className="card-title">
          <Receipt size={18} className="text-primary" />
          Expense History (0)
        </h3>
        <div className="empty-box">
          <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>No expenses logged yet</p>
          <p style={{ fontSize: '0.85rem' }}>
            Use the form on the left to add your first group expense.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="card-title" style={{ margin: 0 }}>
          <Receipt size={18} className="text-primary" />
          Expense History ({expenses.length})
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {expenses.map((exp) => (
          <div key={exp.id} className="expense-item">
            <div className="expense-info">
              <h4>{exp.description}</h4>
              <div className="expense-meta">
                <span style={{ color: '#a5b4fc', fontWeight: 500 }}>
                  Paid by {exp.payer}
                </span>
                <span>•</span>
                <span title={`Split between: ${exp.splitBetween.join(', ')}`}>
                  Split with {exp.splitBetween.length} {exp.splitBetween.length === 1 ? 'person' : 'people'}
                </span>
                {exp.date && (
                  <>
                    <span>•</span>
                    <span style={{ color: 'var(--text-faint)' }}>
                      {new Date(exp.date).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="expense-amount-box">
              <span className="expense-amount">
                Rs {paiseToRupees(exp.amountInPaise)}
              </span>
              <div className="expense-actions">
                <button
                  type="button"
                  className="icon-btn"
                  title="Edit expense"
                  onClick={() => onEditExpense(exp)}
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  className="icon-btn delete"
                  title="Delete expense"
                  onClick={() => {
                    if (window.confirm(`Delete expense "${exp.description}"?`)) {
                      onDeleteExpense(exp.id);
                    }
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
