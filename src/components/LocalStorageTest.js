import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Box } from '@mui/material';

function LocalStorageTest() {
  const [inputValue, setInputValue] = useState('');
  const [storedValue, setStoredValue] = useState('');

  useEffect(() => {
    const value = localStorage.getItem('testValue');
    if (value) {
      setStoredValue(value);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('testValue', inputValue);
    setStoredValue(inputValue);
  };

  const handleClear = () => {
    localStorage.removeItem('testValue');
    setStoredValue('');
    setInputValue('');
  };

  return (
    <Box sx={{ m: 2 }}>
      <Typography variant="h6">LocalStorage Test</Typography>
      <TextField 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)} 
        label="Enter a value"
        sx={{ mr: 1 }}
      />
      <Button onClick={handleSave} variant="contained" sx={{ mr: 1 }}>Save to LocalStorage</Button>
      <Button onClick={handleClear} variant="outlined">Clear LocalStorage</Button>
      <Typography sx={{ mt: 2 }}>
        Value in LocalStorage: {storedValue}
      </Typography>
    </Box>
  );
}

export default LocalStorageTest;
