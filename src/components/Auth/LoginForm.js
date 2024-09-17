import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Container } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await login(email, password);
      onLoginSuccess();
    } catch (error) {
      setError('Failed to log in: ' + error.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          width: '100%',
          border: '1px solid',
          borderColor: 'divider',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Typography variant="h6" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
          YAMBO STUDIO
        </Typography>
        <Typography variant="subtitle3" sx={{ mb: 3, letterSpacing: 1, textTransform: 'uppercase' }}>
          team access   
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 0 },
              '& .MuiInputLabel-root': { fontSize: '0.9rem' },
              '& .MuiInputBase-input': { fontSize: '0.9rem', padding: '12px 14px' },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'black',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'black',
              },
              '& .MuiInputLabel-root': {
                color: 'gray',
                fontSize: '0.8rem',
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'gray',
                fontSize: '0.8rem',
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 0 },
              '& .MuiInputLabel-root': { fontSize: '0.9rem' },
              '& .MuiInputBase-input': { fontSize: '0.9rem', padding: '12px 14px' },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'black',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'black',
              },
              '& .MuiInputLabel-root': {
                color: 'gray',
                fontSize: '0.8rem',
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'gray',
                fontSize: '0.8rem',
              },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              borderRadius: 0,
              py: 1.5,
              bgcolor: 'text.primary',
              color: 'background.paper',
              '&:hover': {
                bgcolor: 'text.secondary',
              },
            }}
          >
            Log In
          </Button>
          {error && <Typography color="error" sx={{ fontSize: '0.9rem' }}>{error}</Typography>}
        </Box>
      </Box>
    </Container>
  );
}

export default LoginForm;
