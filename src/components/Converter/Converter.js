import React, { useState, useEffect, useCallback } from 'react';
import { FiRepeat } from 'react-icons/fi';
import { quantityAPI } from '../../services/api';
import './Converter.css';

const MEASUREMENT_TYPES = [
  {
    id: 'length',
    name: 'Length',
    icon: '📏',
    emoji: '📐',
    color: 'length',
    backendType: 'LENGTH',
    units: [
      { value: 'METER', label: 'Metres' },
      { value: 'CENTIMETERS', label: 'Centimetres' },
      { value: 'FEET', label: 'Feet' },
      { value: 'INCHES', label: 'Inches' },
      { value: 'YARDS', label: 'Yards' },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    icon: '🌡️',
    emoji: '🔥',
    color: 'temp',
    backendType: 'TEMPERATURE',
    units: [
      { value: 'CELSIUS', label: 'Celsius' },
      { value: 'FAHRENHEIT', label: 'Fahrenheit' },
      { value: 'KELVIN', label: 'Kelvin' },
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    icon: '🧪',
    emoji: '💧',
    color: 'volume',
    backendType: 'VOLUME',
    units: [
      { value: 'LITRE', label: 'Litres' },
      { value: 'MILLILITRE', label: 'Millilitres' },
      { value: 'GALLON', label: 'Gallons' },
    ],
  },
  {
    id: 'weight',
    name: 'Weight',
    icon: '⚖️',
    emoji: '🏋️',
    color: 'weight',
    backendType: 'WEIGHT',
    units: [
      { value: 'GRAM', label: 'Grams' },
      { value: 'KILOGRAM', label: 'Kilograms' },
      { value: 'TONNE', label: 'Tonnes' }
    ],
  }
];

const CONVERT_OPERATIONS = [
  { id: 'convert', label: 'Convert' },
  { id: 'compare', label: 'Compare' },
];

const MATH_OPERATIONS = [
  { id: 'add', label: 'Add' },
  { id: 'subtract', label: 'Subtract' },
  { id: 'multiply', label: 'Multiply' },
  { id: 'divide', label: 'Divide' }
];

// Temperature only supports Convert & Compare
const TEMP_OPERATIONS = [
  { id: 'convert', label: 'Convert' },
  { id: 'compare', label: 'Compare' },
];

const getOpSymbol = (op) => {
  switch(op) {
    case 'compare': return '==';
    case 'add': return '+';
    case 'subtract': return '-';
    case 'multiply': return '×';
    case 'divide': return '÷';
    default: return '→';
  }
};

const Converter = ({ initialMode = 'convert' }) => {
  const [selectedType, setSelectedType] = useState('length');
  const [operation, setOperation] = useState(initialMode === 'convert' ? 'convert' : 'add');

  const [fromValue, setFromValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('METER');

  const [toValue, setToValue] = useState('');
  const [toUnit, setToUnit] = useState('CENTIMETERS');
  const [inputValue2, setInputValue2] = useState('1');

  const [resultString, setResultString] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentType = MEASUREMENT_TYPES.find((t) => t.id === selectedType);

  // Get available operations based on selected type and mode
  const getAvailableOperations = () => {
    if (selectedType === 'temperature') return TEMP_OPERATIONS;
    if (initialMode === 'operations') return MATH_OPERATIONS;
    return CONVERT_OPERATIONS;
  };

  const availableOperations = getAvailableOperations();

  // Call backend API — works WITHOUT login (no auth gating)
  const doOperation = useCallback(async () => {
    const numValue = parseFloat(fromValue);
    if (isNaN(numValue)) {
      setToValue('');
      setResultString('');
      return;
    }

    if (operation !== 'convert') {
      const numValue2 = parseFloat(inputValue2);
      if (isNaN(numValue2)) {
        setToValue('');
        setResultString('');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const backendType = currentType?.backendType || 'LENGTH';
      let data;

      switch(operation) {
        case 'convert':
          data = await quantityAPI.convert(fromValue, fromUnit, toUnit, backendType);
          break;
        case 'compare':
          data = await quantityAPI.compare(fromValue, fromUnit, inputValue2, toUnit, backendType);
          break;
        case 'add':
          data = await quantityAPI.add(fromValue, fromUnit, inputValue2, toUnit, backendType);
          break;
        case 'subtract':
          data = await quantityAPI.subtract(fromValue, fromUnit, inputValue2, toUnit, backendType);
          break;
        case 'multiply':
          data = await quantityAPI.multiply(fromValue, fromUnit, inputValue2, toUnit, backendType);
          break;
        case 'divide':
          data = await quantityAPI.divide(fromValue, fromUnit, inputValue2, toUnit, backendType);
          break;
        default:
          return;
      }

      const formatVal = (val) => Number.isInteger(val) ? val.toString() : parseFloat(val.toFixed(6)).toString();

      if (operation === 'compare') {
        const isEqual = data.resultString === 'true';
        setResultString(isEqual ? 'Quantities are Equal' : 'Quantities are Not Equal');
        setToValue(isEqual ? 'Equal' : 'Not Equal');
      } else if (operation === 'convert') {
        if (data.resultValue !== null && data.resultValue !== undefined) {
          setToValue(formatVal(data.resultValue));
        }
        if (data.resultString) setResultString(data.resultString);
      } else {
        if (data.resultValue !== null && data.resultValue !== undefined) {
          const formatted = formatVal(data.resultValue);
          setToValue(formatted);
          setResultString(`${fromValue} ${currentType?.units.find(u => u.value === fromUnit)?.label} ${getOpSymbol(operation)} ${inputValue2} ${currentType?.units.find(u => u.value === toUnit)?.label} = ${formatted} ${currentType?.units.find(u => u.value === fromUnit)?.label}`);
        }
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
      setToValue('');
      setResultString('');
    } finally {
      setLoading(false);
    }
  }, [operation, fromValue, inputValue2, fromUnit, toUnit, currentType]);

  // Debounce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      doOperation();
    }, 400);
    return () => clearTimeout(timer);
  }, [doOperation]);

  const handleTypeChange = (typeId) => {
    setSelectedType(typeId);
    const type = MEASUREMENT_TYPES.find((t) => t.id === typeId);
    setFromUnit(type.units[0].value);
    setToUnit(type.units[1] ? type.units[1].value : type.units[0].value);
    setFromValue('1');
    setInputValue2('1');
    setToValue('');
    setResultString('');
    setError('');

    // If switching to temperature, or switching modes, reset operation to a valid one
    const newAvailableOps = typeId === 'temperature' ? TEMP_OPERATIONS : (initialMode === 'operations' ? MATH_OPERATIONS : CONVERT_OPERATIONS);
    if (!newAvailableOps.find(op => op.id === operation)) {
      setOperation(newAvailableOps[0].id);
    }
  };

  // Sync operation default when route changes initialMode
  useEffect(() => {
    const newAvailableOps = selectedType === 'temperature' ? TEMP_OPERATIONS : (initialMode === 'operations' ? MATH_OPERATIONS : CONVERT_OPERATIONS);
    if (!newAvailableOps.find(op => op.id === operation)) {
      setOperation(newAvailableOps[0].id);
    }
  }, [initialMode, selectedType]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue || fromValue);
  };

  return (
    <div className="converter-page">
      {/* Main Content */}
      <div className="converter-container" id="converter-container">
        
        {/* Type Selection */}
        <div className="type-section">
          <h2 className="section-title">CHOOSE TYPE</h2>
          <div className="type-cards">
            {MEASUREMENT_TYPES.map((type) => (
              <button
                key={type.id}
                className={`type-card type-card--${type.color} ${selectedType === type.id ? 'type-card--active' : ''}`}
                onClick={() => handleTypeChange(type.id)}
                id={`type-card-${type.id}`}
              >
                <div className="type-card-icon">{type.icon}</div>
                <span className="type-card-label">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Operation Selection */}
        <div className="operations-section">
           <h2 className="section-title" style={{ marginTop: '20px' }}>OPERATION</h2>
           <div className="operations-flex">
             {availableOperations.map(op => (
               <button 
                 key={op.id}
                 className={`op-button ${operation === op.id ? 'active' : ''}`}
                 onClick={() => { setOperation(op.id); setToValue(''); }}
               >
                 {op.label}
               </button>
             ))}
           </div>
           {selectedType === 'temperature' && (
             <p className="temp-ops-hint">Temperature only supports Convert & Compare operations</p>
           )}
        </div>

        {/* Error */}
        {error && (
          <div className="converter-message" id="converter-error">
            <span>{error}</span>
          </div>
        )}

        {/* Conversion Area */}
        <div className="conversion-section">
          <div className="conversion-grid">
            {/* FROM */}
            <div className="conversion-box" id="from-box">
              <label className="conversion-label">{operation === 'convert' ? 'FROM' : 'VALUE 1'}</label>
              <div className="conversion-input-wrapper">
                <input
                  type="number"
                  className="conversion-value"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  placeholder="Enter value"
                  id="from-value-input"
                />
                <div className="select-wrapper">
                  <select
                    className="conversion-unit"
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    id="from-unit-select"
                  >
                    {currentType?.units.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Swap Button or Operator */}
            {operation === 'convert' ? (
              <button className="swap-button" onClick={handleSwap} id="swap-btn" title="Swap units">
                <FiRepeat />
              </button>
            ) : (
              <div className="operation-icon">
                {getOpSymbol(operation)}
              </div>
            )}

            {/* TO / Input 2 */}
            <div className="conversion-box" id="to-box">
              <label className="conversion-label">{operation === 'convert' ? 'TO' : 'VALUE 2'}</label>
              <div className="conversion-input-wrapper">
                {operation === 'convert' ? (
                  <input
                    type="text"
                    className={`conversion-value result-value ${loading ? 'result-loading' : ''}`}
                    value={loading ? '...' : toValue}
                    readOnly
                    placeholder="Result"
                    id="to-value-input"
                  />
                ) : (
                  <input
                    type="number"
                    className="conversion-value"
                    value={inputValue2}
                    onChange={(e) => setInputValue2(e.target.value)}
                    placeholder="Enter value 2"
                    id="input-2-value"
                  />
                )}
                
                <div className="select-wrapper">
                  <select
                    className="conversion-unit"
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    id="to-unit-select"
                  >
                    {currentType?.units.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Result Section for non-convert operations */}
          {operation !== 'convert' && (toValue || resultString) && !loading && !error && (
            <div className={`result-display-box`}>
               <h4>Result</h4>
               <div className={`result-text`}>
                  {toValue || '—'}
               </div>
            </div>
          )}

          {/* Conversion Summary */}
          {(resultString || (fromValue && toValue && !loading)) && (
            <div className={`conversion-summary conversion-summary--${currentType?.color}`}>
              <span className="summary-emoji">{currentType?.emoji}</span>
              <span className="summary-text">
                {operation === 'convert' ? 
                  (resultString || `${fromValue} ${currentType?.units.find(u => u.value === fromUnit)?.label} = ${toValue} ${currentType?.units.find(u => u.value === toUnit)?.label}`) 
                  : resultString}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Converter;
