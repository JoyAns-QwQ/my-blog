"use client";

import React, { useState, useCallback } from 'react';

const Calculator: React.FC = () => {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);

  // 处理数字输入
  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(prev => (prev === '0' ? digit : prev + digit));
    }
  }, [waitingForOperand]);

  // 处理小数点
  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
      return;
    }

    if (!displayValue.includes('.')) {
      setDisplayValue(prev => prev + '.');
    }
  }, [displayValue, waitingForOperand]);

  // 清除所有
  const clearAll = useCallback(() => {
    setDisplayValue('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  // 正负号切换
  const toggleSign = useCallback(() => {
    const newValue = parseFloat(displayValue) * -1;
    setDisplayValue(newValue.toString());
  }, [displayValue]);

  // 百分比
  const percent = useCallback(() => {
    const currentValue = parseFloat(displayValue);
    const percentValue = currentValue / 100;
    setDisplayValue(percentValue.toString());
    if (!waitingForOperand && previousValue !== null && operator) {
      // 如果正在等待操作数，不处理百分比后的运算
    }
  }, [displayValue, previousValue, operator, waitingForOperand]);

  // 执行计算
  const calculate = useCallback((first: number, second: number, op: string): number => {
    switch (op) {
      case '+':
        return first + second;
      case '-':
        return first - second;
      case '×':
        return first * second;
      case '÷':
        if (second === 0) {
          throw new Error('除数不能为零');
        }
        return first / second;
      default:
        return second;
    }
  }, []);

  // 处理运算符
  const handleOperator = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (previousValue !== null && operator && !waitingForOperand) {
      try {
        const result = calculate(previousValue, inputValue, operator);
        setDisplayValue(String(result));
        setPreviousValue(result);
      } catch (error) {
        setDisplayValue('错误');
        setPreviousValue(null);
        setOperator(null);
        setWaitingForOperand(true);
        return;
      }
    } else {
      setPreviousValue(inputValue);
    }

    setOperator(nextOperator);
    setWaitingForOperand(true);
  }, [displayValue, previousValue, operator, waitingForOperand, calculate]);

  // 处理等号
  const handleEquals = useCallback(() => {
    if (previousValue !== null && operator && !waitingForOperand) {
      const inputValue = parseFloat(displayValue);
      try {
        const result = calculate(previousValue, inputValue, operator);
        setDisplayValue(String(result));
        setPreviousValue(null);
        setOperator(null);
        setWaitingForOperand(true);
      } catch (error) {
        setDisplayValue('错误');
        setPreviousValue(null);
        setOperator(null);
        setWaitingForOperand(true);
      }
    }
  }, [displayValue, previousValue, operator, waitingForOperand, calculate]);

  // 处理键盘输入
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (/[0-9]/.test(key)) {
        inputDigit(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (key === '+' || key === '-') {
        handleOperator(key);
      } else if (key === '*') {
        handleOperator('×');
      } else if (key === '/') {
        handleOperator('÷');
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        handleEquals();
      } else if (key === 'Escape') {
        clearAll();
      } else if (key === '%') {
        percent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputDigit, inputDecimal, handleOperator, handleEquals, clearAll, percent]);

  return (
    <div className="calculator-container">
      <style>
        {`
          .calculator-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .calculator {
            background: #2d3436;
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            width: 320px;
          }
          .display {
            background: #1e272e;
            color: #fff;
            font-size: 2.5rem;
            text-align: right;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            word-wrap: break-word;
            word-break: break-all;
            min-height: 80px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
          }
          .buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }
          button {
            border: none;
            background: #636e72;
            color: white;
            font-size: 1.5rem;
            padding: 20px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-weight: bold;
          }
          button:hover {
            opacity: 0.8;
            transform: scale(0.98);
          }
          button:active {
            transform: scale(0.95);
          }
          .operator {
            background: #f39c12;
            color: #2c3e50;
          }
          .equals {
            background: #27ae60;
            grid-column: span 1;
          }
          .clear {
            background: #e74c3c;
          }
          .zero {
            grid-column: span 1;
          }
          .function {
            background: #3498db;
          }
          @media (max-width: 400px) {
            .calculator {
              width: 90%;
              margin: 20px;
            }
            button {
              padding: 15px;
              font-size: 1.2rem;
            }
            .display {
              font-size: 2rem;
              padding: 15px;
            }
          }
        `}
      </style>
      <div className="calculator">
        <div className="display">{displayValue}</div>
        <div className="buttons">
          <button className="clear" onClick={clearAll}>
            AC
          </button>
          <button className="function" onClick={toggleSign}>
            +/-
          </button>
          <button className="function" onClick={percent}>
            %
          </button>
          <button className="operator" onClick={() => handleOperator('÷')}>
            ÷
          </button>

          <button onClick={() => inputDigit('7')}>7</button>
          <button onClick={() => inputDigit('8')}>8</button>
          <button onClick={() => inputDigit('9')}>9</button>
          <button className="operator" onClick={() => handleOperator('×')}>
            ×
          </button>

          <button onClick={() => inputDigit('4')}>4</button>
          <button onClick={() => inputDigit('5')}>5</button>
          <button onClick={() => inputDigit('6')}>6</button>
          <button className="operator" onClick={() => handleOperator('-')}>
            -
          </button>

          <button onClick={() => inputDigit('1')}>1</button>
          <button onClick={() => inputDigit('2')}>2</button>
          <button onClick={() => inputDigit('3')}>3</button>
          <button className="operator" onClick={() => handleOperator('+')}>
            +
          </button>

          <button className="zero" onClick={() => inputDigit('0')}>
            0
          </button>
          <button onClick={inputDecimal}>.</button>
          <button className="equals" onClick={handleEquals}>
            =
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;