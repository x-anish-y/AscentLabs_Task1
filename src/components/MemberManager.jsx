import React, { useState } from 'react';
import { UserPlus, X, Users } from 'lucide-react';

export default function MemberManager({ members, onAddMember, onRemoveMember, expenses }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a name');
      return;
    }
    if (members.some(m => m.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" is already in the group`);
      return;
    }
    onAddMember(trimmed);
    setName('');
    setError('');
  };

  const handleRemove = (memberName) => {
    // Check if this member is part of any logged expense
    const hasExpense = expenses.some(
      exp => exp.payer === memberName || (exp.splitBetween && exp.splitBetween.includes(memberName))
    );
    if (hasExpense) {
      if (!window.confirm(`"${memberName}" is linked to existing expenses. Removing them may affect calculations. Proceed?`)) {
        return;
      }
    }
    onRemoveMember(memberName);
  };

  return (
    <div className="card">
      <h3 className="card-title">
        <Users size={18} className="text-primary" />
        Group Members ({members.length})
      </h3>

      <form onSubmit={handleSubmit} className="form-group">
        <div className="form-row">
          <input
            type="text"
            placeholder="Add new person (e.g. Rahul)"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ flex: '0 0 auto' }}>
            <UserPlus size={16} />
            Add
          </button>
        </div>
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.35rem' }}>{error}</p>}
      </form>

      <div className="member-list">
        {members.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No members in group yet. Add at least two people to start splitting expenses.</p>
        ) : (
          members.map((m) => (
            <span key={m} className="member-pill">
              {m}
              <button
                type="button"
                className="member-remove-btn"
                title={`Remove ${m}`}
                onClick={() => handleRemove(m)}
              >
                <X size={13} />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
