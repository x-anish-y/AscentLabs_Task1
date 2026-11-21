import React from 'react';
import { Wallet, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { paiseToRupees } from '../utils/settleUp';

export default function BalanceSummary({ netBalances }) {
  const members = Object.keys(netBalances);

  if (members.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h3 className="card-title">
        <Wallet size={18} className="text-primary" />
        Individual Net Balances
      </h3>

      <div className="balance-grid">
        {members.map((person) => {
          const balance = netBalances[person] || 0;
          const isCreditor = balance > 0;
          const isDebtor = balance < 0;
          const isSettled = balance === 0;

          return (
            <div
              key={person}
              className={`balance-card ${isCreditor ? 'creditor' : isDebtor ? 'debtor' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="balance-person-name">{person}</span>
                {isCreditor && <TrendingUp size={16} style={{ color: 'var(--success)' }} />}
                {isDebtor && <TrendingDown size={16} style={{ color: 'var(--danger)' }} />}
                {isSettled && <CheckCircle2 size={16} style={{ color: 'var(--text-muted)' }} />}
              </div>

              <div>
                <div
                  className={`balance-amount ${
                    isCreditor ? 'positive' : isDebtor ? 'negative' : 'neutral'
                  }`}
                >
                  {isSettled
                    ? 'Rs 0'
                    : `${isDebtor ? '-' : '+'}Rs ${paiseToRupees(Math.abs(balance))}`}
                </div>
                <div className="balance-subtext">
                  {isCreditor && 'gets back in total'}
                  {isDebtor && 'owes in total'}
                  {isSettled && 'settled up'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
