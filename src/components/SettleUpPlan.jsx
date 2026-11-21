import React from 'react';
import { ArrowRight, CheckCheck, Sparkles } from 'lucide-react';
import { paiseToRupees } from '../utils/settleUp';

export default function SettleUpPlan({ settlements }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="card-title" style={{ margin: 0 }}>
          <Sparkles size={18} className="text-primary" />
          Settle Up Plan ({settlements.length} {settlements.length === 1 ? 'transaction' : 'transactions'})
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
          Greedy Optimal
        </span>
      </div>

      {settlements.length === 0 ? (
        <div className="empty-box">
          <div className="empty-box-icon">
            <CheckCheck size={32} style={{ color: 'var(--success)' }} />
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>All Settled Up!</p>
          <p style={{ fontSize: '0.85rem' }}>No debts pending between group members.</p>
        </div>
      ) : (
        <div className="settlement-list">
          {settlements.map((tx, idx) => (
            <div key={`${tx.from}-${tx.to}-${idx}`} className="settlement-item">
              <div className="settlement-actors">
                <span className="actor-badge" style={{ color: '#f87171' }}>{tx.from}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>pays</span>
                <span className="actor-badge" style={{ color: '#34d399' }}>{tx.to}</span>
              </div>
              <div className="settlement-badge">
                Rs {paiseToRupees(tx.amountInPaise)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
