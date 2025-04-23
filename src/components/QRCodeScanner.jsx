import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import { BrowserMultiFormatReader } from '@zxing/browser';

const QRCodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState('');
  const [status, setStatus] = useState(null);
  const videoRef = useRef();
  let codeReader = null;

  const startScan = async () => {
    setStatus(null);
    setResult('');
    setScanning(true);
    codeReader = new BrowserMultiFormatReader();
    try {
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices[0]?.deviceId;
      codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (res, err) => {
        if (res) {
          setResult(res.getText());
          setScanning(false);
          codeReader.reset();
        }
      });
    } catch (err) {
      setStatus({ type: 'error', message: 'Camera error: ' + err.message });
      setScanning(false);
    }
  };

  const stopScan = () => {
    setScanning(false);
    if (codeReader) codeReader.reset();
  };

  const handlePay = async () => {
    setStatus(null);
    try {
      if (!window.webln) {
        setStatus({ type: 'error', message: 'WebLN not available. Please use Alby or another WebLN-enabled wallet.' });
        return;
      }
      await window.webln.enable();
      const payResult = await window.webln.sendPayment(result);
      setStatus({ type: 'success', message: `Payment sent! Preimage: ${payResult.preimage}` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Payment failed.' });
    }
  };

  return (
    <Box mb={2}>
      <Typography variant="h6">QR Code Scanner</Typography>
      <Button variant="contained" color="primary" onClick={startScan} disabled={scanning} sx={{ mr: 2 }}>
        {scanning ? 'Scanning...' : 'Start Scan'}
      </Button>
      {scanning && (
        <Button variant="outlined" color="secondary" onClick={stopScan} sx={{ ml: 2 }}>
          Stop
        </Button>
      )}
      <Box mt={2}>
        <video ref={videoRef} style={{ width: '100%', maxWidth: 320, display: scanning ? 'block' : 'none' }} />
      </Box>
      {result && (
        <Box mt={2}>
          <Typography variant="body2">Scanned Invoice:</Typography>
          <TextField value={result} fullWidth margin="dense" InputProps={{ readOnly: true }} />
          <Button variant="contained" color="success" onClick={handlePay} sx={{ mt: 1 }}>
            Pay Invoice
          </Button>
        </Box>
      )}
      {status && (
        <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>
      )}
    </Box>
  );
};

export default QRCodeScanner;
