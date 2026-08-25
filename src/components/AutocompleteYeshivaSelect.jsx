import React, { useState, useRef, useEffect } from 'react';
import { Search, Check, X, ChevronDown } from 'lucide-react';

export default function AutocompleteYeshivaSelect({ yeshivotList = [], value, onChange, placeholder = "הקלידי/בחרי שם מדרשה..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Sync display text when value changes
  useEffect(() => {
    if (!value) {
      setSearchQuery('');
    } else if (value === 'other') {
      setSearchQuery('אחר (מדרשה שאינה ברשימה)');
    } else {
      setSearchQuery(value);
    }
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter yeshivot list based on search query
  const filteredYeshivot = yeshivotList.filter(y => 
    y.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleSelect = (name) => {
    onChange(name);
    if (name === 'other') {
      setSearchQuery('אחר (מדרשה שאינה ברשימה)');
    } else {
      setSearchQuery(name);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearchQuery('');
    setIsOpen(true);
  };

  return (
    <div className="custom-select-container" ref={containerRef}>
      <div style={{ relative: 'relative', width: '100%' }}>
        <div 
          className={`custom-select-trigger ${isOpen ? 'active' : ''}`}
          style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => setIsOpen(true)}
        >
          <Search style={{ width: 18, height: 18, color: '#881337', flexShrink: 0 }} />
          
          <input
            type="text"
            className="input-field"
            style={{ 
              border: 'none', 
              background: 'transparent', 
              margin: 0, 
              padding: '0.4rem 0', 
              boxShadow: 'none', 
              fontSize: '0.95rem',
              color: '#111827',
              flex: 1
            }}
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onChange(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 2 }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}

          <ChevronDown 
            style={{ 
              width: 18, 
              height: 18, 
              transition: 'transform 0.2s', 
              transform: isOpen ? 'rotate(180deg)' : 'none', 
              color: '#881337',
              cursor: 'pointer' 
            }} 
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      </div>

      {isOpen && (
        <div className="custom-select-dropdown" style={{ maxHeight: 260 }}>
          {/* Default Option for "other" */}
          <div
            className={`custom-select-option ${value === 'other' ? 'selected' : ''}`}
            onClick={() => handleSelect('other')}
            style={{ color: '#be123c', fontWeight: 700, borderBottom: '1px solid #f3c2ce' }}
          >
            <span>+ אחר (מדרשה שאינה ברשימה)</span>
            {value === 'other' && <Check style={{ width: 16, height: 16, color: '#be123c' }} />}
          </div>

          {filteredYeshivot.length === 0 ? (
            <div style={{ padding: '0.8rem 1rem', color: '#4b5563', fontSize: '0.9rem', textAlign: 'center' }}>
              לא נמצאה מדרשה בשם זה. לחצי על "אחר" להקלדת שם מדרשה חדשה.
            </div>
          ) : (
            filteredYeshivot.map((y) => {
              const isSelected = value === y.name;
              return (
                <div
                  key={y.id}
                  className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(y.name)}
                >
                  <span>{y.name}</span>
                  {isSelected && <Check style={{ width: 16, height: 16, color: '#881337' }} />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
