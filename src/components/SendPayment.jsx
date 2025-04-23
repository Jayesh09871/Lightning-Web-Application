import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

const SendPayment = () => {
  const [paymentRequest, setPaymentRequest] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendPayment = async () => {
    setStatus(null);
    setLoading(true);
    try {
      if (!window.webln) {
        setStatus({ type: 'error', message: 'WebLN not available. Please use Alby or another WebLN-enabled wallet.' });
        setLoading(false);
        return;
      }
      await window.webln.enable();
      const result = await window.webln.sendPayment(paymentRequest);
      if (result && result.preimage) {
        setStatus({ type: 'success', message: `Payment sent! Preimage: ${result.preimage}` });
      } else {
        setStatus({ type: 'success', message: 'Payment sent! (No preimage returned)' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Payment failed.' });
    }
    setLoading(false);
  };

  return (
    <Box mb={2}>
      <Typography variant="h6">Send Payment (WebLN)</Typography>
      <TextField
        label="Payment Request (Invoice)"
        fullWidth
        margin="normal"
        value={paymentRequest}
        onChange={e => setPaymentRequest(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        disabled={loading || !paymentRequest}
        onClick={handleSendPayment}
      >
        Send Payment
      </Button>
      {status && (
        <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>
      )}
    </Box>
  );
};

export default SendPayment;
