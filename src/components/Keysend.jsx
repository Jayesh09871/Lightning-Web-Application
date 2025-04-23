import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

const Keysend = () => {
  const [pubkey, setPubkey] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleKeysend = async () => {
    setStatus(null);
    setLoading(true);
    try {
      if (!window.webln) {
        setStatus({ type: 'error', message: 'WebLN not available. Please use Alby or another WebLN-enabled wallet.' });
        setLoading(false);
        return;
      }
      await window.webln.enable();
      const result = await window.webln.keysend({ destination: pubkey, amount: Number(amount) });
      setStatus({ type: 'success', message: `Keysend sent! Preimage: ${result.preimage}` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Keysend failed.' });
    }
    setLoading(false);
  };

  return (
    <Box mb={2}>
      <Typography variant="h6">Keysend Payment</Typography>
      <TextField
        label="Destination Pubkey"
        fullWidth
        margin="normal"
        value={pubkey}
        onChange={e => setPubkey(e.target.value)}
      />
      <TextField
        label="Amount (sats)"
        type="number"
        fullWidth
        margin="normal"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        disabled={loading || !pubkey || !amount}
        onClick={handleKeysend}
      >
        Send Keysend
      </Button>
      {status && (
        <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>
      )}
    </Box>
  );
};

export default Keysend;
