import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Card, 
  CardContent, 
  Switch, 
  TextField, 
  Button, 
  Slider, 
  Stack, 
  Grid, 
  Divider, 
  IconButton, 
  Tooltip, 
  Chip,
  FormControlLabel,
  InputAdornment,
  LinearProgress,
  Paper,
  Collapse
} from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';

const AutoPayOnScroll = () => {
  const [enabled, setEnabled] = useState(false);
  const [satsPerScroll, setSatsPerScroll] = useState(1);
  const [recipient, setRecipient] = useState('satoshi@getalby.com');
  const [scrollThreshold, setScrollThreshold] = useState(300); // pixels
  const [status, setStatus] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [cooldownPeriod, setCooldownPeriod] = useState(5); // seconds
  
  const scrollPositionRef = useRef(0);
  const scrollDistanceRef = useRef(0);
  
  // Handle scroll events
  useEffect(() => {
    const handleScroll = async () => {
      if (!enabled || isProcessing) return;
      
      const currentPosition = window.scrollY;
      const scrollDistance = Math.abs(currentPosition - scrollPositionRef.current);
      scrollDistanceRef.current += scrollDistance;
      scrollPositionRef.current = currentPosition;
      
      // Check if we've scrolled enough and if cooldown period has passed
      const now = Date.now();
      const timeSinceLastPayment = (now - lastScrollTime) / 1000; // convert to seconds
      
      if (scrollDistanceRef.current >= scrollThreshold && timeSinceLastPayment >= cooldownPeriod) {
        scrollDistanceRef.current = 0; // Reset scroll distance
        setLastScrollTime(now);
        await makePayment();
      }
    };
    
    const throttledScroll = throttle(handleScroll, 200); // Throttle to avoid too many calls
    
    if (enabled) {
      window.addEventListener('scroll', throttledScroll);
      setStatus({ type: 'info', message: 'Auto-payment on scroll is active. Scroll to trigger payments.' });
    }
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [enabled, isProcessing, scrollThreshold, cooldownPeriod, lastScrollTime, satsPerScroll, recipient]);
  
  // Throttle function to limit execution frequency
  const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };
  
  // Make the actual payment
  const makePayment = async () => {
    setIsProcessing(true);
    setStatus({ type: 'info', message: 'Processing payment...' });
    
    try {
      if (!window.webln) {
        setStatus({ type: 'error', message: 'WebLN not available. Please use Alby or another WebLN-enabled wallet.' });
        setIsProcessing(false);
        return;
      }
      
      await window.webln.enable();
      
      // Create an invoice for the recipient
      // For demo purposes, we're using a Lightning Address
      // In production, you'd want to generate a proper invoice
      const result = await window.webln.lnurl(recipient, { amount: satsPerScroll * 1000 }); // Convert to millisats
      
      // Record the payment in history
      const newPayment = {
        id: Date.now(),
        amount: satsPerScroll,
        recipient: recipient,
        timestamp: new Date().toISOString(),
        status: 'success'
      };
      
      setPaymentHistory(prev => [newPayment, ...prev.slice(0, 9)]); // Keep only last 10 payments
      setTotalPaid(prev => prev + satsPerScroll);
      setStatus({ type: 'success', message: `Payment of ${satsPerScroll} sats sent to ${recipient}!` });
    } catch (err) {
      console.error('Payment error:', err);
      setStatus({ 
        type: 'error', 
        message: err.message || 'Auto-payment failed. Please check your wallet connection.'
      });
      
      // Record failed payment
      const failedPayment = {
        id: Date.now(),
        amount: satsPerScroll,
        recipient: recipient,
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: err.message
      };
      
      setPaymentHistory(prev => [failedPayment, ...prev.slice(0, 9)]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleToggleEnabled = () => {
    if (!enabled) {
      // Reset scroll tracking when enabling
      scrollPositionRef.current = window.scrollY;
      scrollDistanceRef.current = 0;
      setLastScrollTime(0);
    } else {
      // Clear status when disabling
      setStatus(null);
    }
    setEnabled(!enabled);
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Box>
      <Box mb={3} display="flex" alignItems="center">
        <AutorenewIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
        <Typography variant="h5" fontWeight={600}>
          Auto-payment on Scroll
        </Typography>
        <Tooltip 
          title="Automatically send sats as you scroll the page" 
          placement="right"
        >
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center">
              <FormControlLabel
                control={
                  <Switch 
                    checked={enabled} 
                    onChange={handleToggleEnabled} 
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body1" fontWeight={500}>
                    {enabled ? 'Enabled' : 'Disabled'}
                  </Typography>
                }
              />
              {enabled && (
                <Chip 
                  label={`${satsPerScroll} sats per scroll`} 
                  color="primary" 
                  size="small" 
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
            
            <Box>
              <Tooltip title="Payment settings">
                <IconButton onClick={() => setShowSettings(!showSettings)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Payment history">
                <IconButton onClick={() => setShowHistory(!showHistory)}>
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {isProcessing && <LinearProgress sx={{ mb: 2 }} />}
          
          {status && (
            <Alert 
              severity={status.type} 
              sx={{ mb: 2, borderRadius: 2 }}
              onClose={() => setStatus(null)}
            >
              {status.message}
            </Alert>
          )}
          
          <Collapse in={showSettings}>
            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Payment Settings</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Lightning Address"
                    fullWidth
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    margin="normal"
                    helperText="Enter a Lightning Address or LNURL"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Sats per Scroll"
                    type="number"
                    fullWidth
                    value={satsPerScroll}
                    onChange={(e) => setSatsPerScroll(Math.max(1, parseInt(e.target.value) || 1))}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">sats</InputAdornment>,
                      inputProps: { min: 1 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box px={1}>
                    <Typography gutterBottom>Scroll Threshold</Typography>
                    <Slider
                      value={scrollThreshold}
                      onChange={(e, newValue) => setScrollThreshold(newValue)}
                      min={100}
                      max={1000}
                      step={50}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}px`}
                      marks={[
                        { value: 100, label: '100px' },
                        { value: 1000, label: '1000px' }
                      ]}
                    />
                    <Typography variant="caption" color="text.secondary">
                      How far you need to scroll to trigger a payment
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box px={1}>
                    <Typography gutterBottom>Cooldown Period</Typography>
                    <Slider
                      value={cooldownPeriod}
                      onChange={(e, newValue) => setCooldownPeriod(newValue)}
                      min={1}
                      max={30}
                      step={1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}s`}
                      marks={[
                        { value: 1, label: '1s' },
                        { value: 30, label: '30s' }
                      ]}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Minimum time between payments
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>
          
          <Collapse in={showHistory}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Payment History</Typography>
                <Chip 
                  label={`Total: ${totalPaid} sats`} 
                  color="primary"
                  variant="outlined"
                />
              </Box>
              
              {paymentHistory.length === 0 ? (
                <Typography color="text.secondary">No payments yet. Start scrolling!</Typography>
              ) : (
                <Stack spacing={1}>
                  {paymentHistory.map((payment) => (
                    <Box 
                      key={payment.id} 
                      sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: 'action.hover',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box>
                        <Typography variant="body2">
                          <PaymentIcon 
                            fontSize="small" 
                            color={payment.status === 'success' ? 'success' : 'error'} 
                            sx={{ mr: 0.5, verticalAlign: 'middle' }}
                          />
                          {payment.amount} sats to {payment.recipient}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(payment.timestamp)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Collapse>
          
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {enabled 
                ? 'Scroll the page to automatically send sats. Adjust settings as needed.'
                : 'Toggle the switch to enable auto-payments while scrolling.'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
      
      <Box sx={{ height: '500px', overflowY: 'auto', border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>Scroll Testing Area</Typography>
        <Typography paragraph>
          This is a scrollable area to test the auto-payment feature. Scroll up and down here to trigger payments when the feature is enabled.
        </Typography>
        
        {Array(20).fill(0).map((_, i) => (
          <Typography key={i} paragraph>
            Paragraph {i+1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. 
            Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. 
            Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor.
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default AutoPayOnScroll;
