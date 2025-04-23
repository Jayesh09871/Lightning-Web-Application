import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Alert, 
  Card, 
  CardContent, 
  Grid, 
  InputAdornment,
  IconButton,
  Tooltip,
  Skeleton,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

const FiatSatsConverter = () => {
  const [btcPrice, setBtcPrice] = useState(null);
  const [fiat, setFiat] = useState('');
  const [sats, setSats] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrice = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const data = await res.json();
      setBtcPrice(Number(data.bitcoin.usd));
      setError(null);
    } catch (e) {
      setError('Failed to fetch BTC price.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrice();
  }, []);

  const handleFiatChange = (e) => {
    const value = e.target.value;
    setFiat(value);
    if (btcPrice && value !== '') {
      setSats(Math.round((parseFloat(value) / btcPrice) * 1e8).toString());
    } else {
      setSats('');
    }
  };

  const handleSatsChange = (e) => {
    const value = e.target.value;
    setSats(value);
    if (btcPrice && value !== '') {
      setFiat(((parseInt(value) / 1e8) * btcPrice).toFixed(2));
    } else {
      setFiat('');
    }
  };

  const handleSwap = () => {
    // Create temporary variables to hold current values
    const tempFiat = fiat;
    const tempSats = sats;
    
    // Clear both fields
    setFiat('');
    setSats('');
    
    // Set the values in swapped order with a slight delay
    setTimeout(() => {
      if (tempSats) setFiat(tempSats);
      if (tempFiat) setSats(tempFiat);
    }, 50);
  };

  return (
    <Box>
      <Box mb={3} display="flex" alignItems="center">
        <CurrencyExchangeIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
        <Typography variant="h5" fontWeight={600}>
          Fiat ↔ Sats Converter
        </Typography>
        <Tooltip title="Convert between USD and satoshis (sats)" placement="right">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                label="USD"
                type="number"
                value={fiat}
                onChange={handleFiatChange}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                placeholder="0.00"
                sx={{ mb: { xs: 1, md: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <IconButton 
                onClick={handleSwap} 
                sx={{ 
                  backgroundColor: 'action.hover',
                  '&:hover': { backgroundColor: 'action.selected' },
                  height: 40,
                  width: 40
                }}
              >
                <SwapVertIcon />
              </IconButton>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <TextField
                label="Satoshis"
                type="number"
                value={sats}
                onChange={handleSatsChange}
                fullWidth
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">sats</InputAdornment>,
                }}
                placeholder="0"
              />
            </Grid>
          </Grid>
          
          <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              {loading ? (
                <Skeleton width={180} height={24} />
              ) : btcPrice ? (
                <Box display="flex" alignItems="center">
                  <Chip 
                    label={`1 BTC = $${btcPrice.toLocaleString()} USD`} 
                    color="primary" 
                    variant="outlined"
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    1 sat = ${(btcPrice / 1e8).toFixed(8)} USD
                  </Typography>
                </Box>
              ) : null}
            </Box>
            
            <Tooltip title="Refresh BTC price">
              <IconButton onClick={fetchPrice} disabled={refreshing} size="small">
                {refreshing ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default FiatSatsConverter;
