import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiFilter, FiInbox, FiAlertTriangle, FiRefreshCw, FiLock, FiLogIn } from 'react-icons/fi';
import { quantityAPI } from '../../services/api';
import './History.css';

const OPERATION_FILTERS = [
  { value: 'convert', label: 'Convert' },
  { value: 'compare', label: 'Compare' },
  { value: 'add', label: 'Add' },
  { value: 'subtract', label: 'Subtract' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'divide', label: 'Divide' },
];

const TYPE_FILTERS = [
  { value: 'LENGTH', label: 'Length', color: 'length', emoji: '📏' },
  { value: 'TEMPERATURE', label: 'Temperature', color: 'temp', emoji: '🌡️' },
  { value: 'VOLUME', label: 'Volume', color: 'volume', emoji: '🧪' },
  { value: 'WEIGHT', label: 'Weight', color: 'weight', emoji: '⚖️' },
];

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterMode, setFilterMode] = useState('operation'); // 'operation' | 'type' | 'errored'
  const [selectedFilter, setSelectedFilter] = useState('convert');

  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  const userRaw = localStorage.getItem('user');
  let userName = 'User';
  try {
    const parsed = JSON.parse(userRaw);
    userName = parsed?.name || parsed?.username || parsed?.email?.split('@')[0] || 'User';
  } catch {}

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let data;
      if (filterMode === 'errored') {
        data = await quantityAPI.getErroredHistory();
      } else if (filterMode === 'type') {
        data = await quantityAPI.getHistoryByType(selectedFilter);
      } else {
        data = await quantityAPI.getHistoryByOperation(selectedFilter);
      }
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [filterMode, selectedFilter, isAuthenticated]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFilterModeChange = (mode) => {
    setFilterMode(mode);
    if (mode === 'operation') setSelectedFilter('convert');
    else if (mode === 'type') setSelectedFilter('LENGTH');
  };

  // ===== NOT AUTHENTICATED - Login Gate =====
  if (!isAuthenticated) {
    return (
      <div className="history-page" id="history-page">
        <div className="history-login-gate" id="history-not-authenticated">
          <div className="login-gate-card">
            <div className="login-gate-icon-wrapper">
              <div className="login-gate-icon-bg">
                <FiLock className="login-gate-icon" />
              </div>
            </div>
            <h2 className="login-gate-title">Sign in to View History</h2>
            <p className="login-gate-description">
              Your conversion history is personal and unique to your account. 
              Sign in with your Google account or email to access your saved conversions.
            </p>
            <button className="login-gate-btn" onClick={() => navigate('/login')} id="history-login-btn">
              <FiLogIn />
              <span>Sign In to Continue</span>
            </button>
            <p className="login-gate-hint">
              Don't have an account?{' '}
              <button className="login-gate-link" onClick={() => navigate('/signup')}>
                Create one for free
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===== AUTHENTICATED - Show history =====
  return (
    <div className="history-page" id="history-page">
      <div className="history-header">
        <div className="history-header-content">
          <h1 className="history-title">
            <FiClock className="history-title-icon" />
            Your Conversion History
          </h1>
          <p className="history-subtitle">
            {userName}'s records — {history.length} result{history.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button className="refresh-btn" onClick={fetchHistory} id="refresh-history-btn" title="Refresh">
          <FiRefreshCw className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {/* Filter Controls */}
      <div className="history-filters" id="history-filters">
        <div className="filter-mode-tabs">
          <button
            className={`filter-tab ${filterMode === 'operation' ? 'filter-tab--active' : ''}`}
            onClick={() => handleFilterModeChange('operation')}
          >
            <FiFilter /> By Operation
          </button>
          <button
            className={`filter-tab ${filterMode === 'type' ? 'filter-tab--active' : ''}`}
            onClick={() => handleFilterModeChange('type')}
          >
            <FiFilter /> By Type
          </button>
          <button
            className={`filter-tab filter-tab--error ${filterMode === 'errored' ? 'filter-tab--active' : ''}`}
            onClick={() => handleFilterModeChange('errored')}
          >
            <FiAlertTriangle /> Errors
          </button>
        </div>

        {filterMode === 'operation' && (
          <div className="filter-options">
            {OPERATION_FILTERS.map((op) => (
              <button
                key={op.value}
                className={`filter-chip ${selectedFilter === op.value ? 'filter-chip--active' : ''}`}
                onClick={() => setSelectedFilter(op.value)}
              >
                {op.label}
              </button>
            ))}
          </div>
        )}

        {filterMode === 'type' && (
          <div className="filter-options">
            {TYPE_FILTERS.map((type) => (
              <button
                key={type.value}
                className={`filter-chip filter-chip--${type.color} ${selectedFilter === type.value ? 'filter-chip--active' : ''}`}
                onClick={() => setSelectedFilter(type.value)}
              >
                <span>{type.emoji}</span> {type.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="history-error">
          <span>{error}</span>
          <button onClick={fetchHistory}>Retry</button>
        </div>
      )}

      {/* History List */}
      <div className="history-list">
        {loading ? (
          <div className="history-loading">
            <div className="spinner-large"></div>
            <p>Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="history-empty" id="history-empty">
            <div className="empty-icon">
              <FiInbox />
            </div>
            <h3>No records found</h3>
            <p>
              {filterMode === 'errored'
                ? 'No errored conversions found'
                : `No history for ${filterMode === 'type' ? selectedFilter.toLowerCase() : selectedFilter} operations`}
            </p>
          </div>
        ) : (
          history.map((item, index) => (
            <div
              key={index}
              className="history-item"
              style={{ animationDelay: `${index * 0.05}s` }}
              id={`history-item-${index}`}
            >
              <div className="history-item-left">
                <div className="history-conversion">
                  <span className="history-result-string">
                    {item.resultString || `Result: ${item.resultValue}`}
                  </span>
                </div>
              </div>
              {item.resultValue !== null && item.resultValue !== undefined && (
                <div className="history-item-right">
                  <span className="history-result-value">{item.resultValue}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
