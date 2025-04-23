import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

const PayViaWebLN = () => {
  const [amount, setAmount] = useState('');
  const [lnAddress, setLnAddress] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setStatus(null);
    setLoading(true);
    try {
      if (!window.webln) {
        setStatus({ type: 'error', message: 'WebLN not available. Please use Alby or another WebLN-enabled wallet.' });
        setLoading(false);
        return;
      }
      await window.webln.enable();
      // In practice, you would resolve the LN address to an invoice (LNURL-pay or similar)
      // For demo, treat lnAddress as invoice/paymentRequest
      const result = await window.webln.sendPayment(lnAddress);
      setStatus({ type: 'success', message: `Payment sent! Preimage: ${result.preimage}` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Payment failed.' });
    }
    setLoading(false);
  };

  return (
    <Box mb={2}>
      <Typography variant="h6">Pay via WebLN (LN Address)</Typography>
      <TextField
        label="Amount (sats)"
        type="number"
        fullWidth
        margin="normal"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <TextField
        label="LN Address / Invoice"
        fullWidth
        margin="normal"
        value={lnAddress}
        onChange={e => setLnAddress(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        disabled={loading || !amount || !lnAddress}
        onClick={handlePay}
      >
        Pay
      </Button>
      {status && (
        <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>
      )}
    </Box>
  );
};

export default PayViaWebLN;
