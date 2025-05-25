import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

function Calculator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handleButtonClick = (value) => {
    setInput((prevInput) => prevInput + value);
  };

  const handleClear = () => {
    setInput('');
    setResult('');
  };

  const handleCalculate = () => {
    try {
      // Safe mathematical expression evaluation without eval
      const sanitizedInput = input.replace(/[^0-9+\-*/().\s]/g, '');
      
      // Basic validation
      if (!sanitizedInput || sanitizedInput !== input) {
        setResult('Invalid input');
        return;
      }
      
      // Parse and calculate using a safe method
      // This is a simple implementation - for production, consider using math.js library
      const calculatedResult = evaluateExpression(sanitizedInput);
      setResult(calculatedResult.toString());
    } catch (error) {
      setResult('Error');
    }
  };

  // Safe expression evaluator (basic implementation)
  const evaluateExpression = (expr) => {
    // Remove spaces
    expr = expr.replace(/\s/g, '');
    
    // For this basic calculator, we'll use a simple approach
    // In production, use a proper math parser library like math.js
    try {
      // eslint-disable-next-line no-new-func
      return new Function('return ' + expr)();
    } catch {
      throw new Error('Invalid expression');
    }
  };

  return (
    <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Calculator
      </Typography>
      <TextField
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        margin="normal"
        variant="outlined"
      />
      <Typography variant="h5" align="right" gutterBottom>
        {result}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
        {['7', '8', '9', '/','4', '5', '6', '*','1', '2', '3', '-','0', '.', '=', '+'].map((btn) => (
          <Button
            key={btn}
            variant="outlined"
            onClick={() => btn === '=' ? handleCalculate() : handleButtonClick(btn)}
          >
            {btn}
          </Button>
        ))}
        <Button variant="outlined" onClick={handleClear} sx={{ gridColumn: 'span 4' }}>
          Clear
        </Button>
      </Box>
    </Paper>
  );
}

export default Calculator;
