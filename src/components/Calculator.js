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
      // Using Function constructor to safely evaluate the mathematical expression
      const calculatedResult = new Function('return ' + input)();
      setResult(calculatedResult.toString());
    } catch (error) {
      setResult('Error');
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
