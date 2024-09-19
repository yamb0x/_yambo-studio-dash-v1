import React, { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, CircularProgress, Select, MenuItem } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const CurrencyExchange = () => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('ILS');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  const fetchExchangeRate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      const data = await response.json();
      setExchangeRate(data.rates[toCurrency]);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
    setLoading(false);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const convertedAmount = amount && exchangeRate ? (amount * exchangeRate).toFixed(2) : '';

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>Currency Exchange</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          size="small"
          sx={{ width: '100px', mr: 2 }}
        />
        <Select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
          size="small"
          sx={{ width: '100px', mr: 2 }}
        >
          <MenuItem value="USD">USD</MenuItem>
          <MenuItem value="ILS">ILS</MenuItem>
        </Select>
        <IconButton onClick={handleSwap} size="small" sx={{ mr: 2 }}>
          <SwapHorizIcon />
        </IconButton>
        <Select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
          size="small"
          sx={{ width: '100px' }}
        >
          <MenuItem value="USD">USD</MenuItem>
          <MenuItem value="ILS">ILS</MenuItem>
        </Select>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={20} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body1">
            {amount} {fromCurrency} = {convertedAmount} {toCurrency}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CurrencyExchange;
