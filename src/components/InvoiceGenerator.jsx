import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Grid, 
  Paper, 
  Divider, 
  InputAdornment,
  IconButton,
  Tooltip,
  Fade,
  Snackbar,
  Card,
  CardContent
} from '@mui/material';
import QRCode from 'react-qr-code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const InvoiceGenerator = () => {
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [invoice, setInvoice] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMakeInvoice = async () => {
    setError(null);
    setInvoice('');
    setLoading(true);
    
    try {
      if (!window.webln) {
        setError('WebLN not available. Please use Alby or another WebLN-enabled wallet.');
        setLoading(false);
        return;
      }
      
      await window.webln.enable();
      const result = await window.webln.makeInvoice({ amount: Number(amount), memo });
      setInvoice(result.paymentRequest);
    } catch (err) {
      setError(err.message || 'Could not create invoice.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvoice = () => {
    if (invoice) {
      navigator.clipboard.writeText(invoice);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateInvoice = (inv) => {
    if (!inv) return '';
    return inv.length > 30 ? `${inv.substring(0, 15)}...${inv.substring(inv.length - 15)}` : inv;
  };

  return (
    <Box>
      <Box mb={3} display="flex" alignItems="center">
        <ElectricBoltIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
        <Typography variant="h5" fontWeight={600}>
          Invoice Generator
        </Typography>
        <Tooltip 
          title="Generate Lightning Network invoices using WebLN" 
          placement="right"
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
        >
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="text.secondary" fontWeight={500}>
                Create Invoice
              </Typography>
              
              <TextField
                label="Amount"
                type="number"
                fullWidth
                margin="normal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">sats</InputAdornment>,
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Memo / Description"
                fullWidth
                margin="normal"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="What's this invoice for?"
                sx={{ mb: 3 }}
              />
              
              <Button
                variant="contained"
                color="primary"
                disabled={!amount || loading}
                onClick={handleMakeInvoice}
                fullWidth
                size="large"
                sx={{ 
                  py: 1.5,
                  boxShadow: '0 4px 10px rgba(255, 152, 0, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 15px rgba(255, 152, 0, 0.4)'
                  }
                }}
              >
                {loading ? 'Generating...' : 'Generate Lightning Invoice'}
              </Button>
              
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mt: 3, borderRadius: 2 }}
                  variant="filled"
                >
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card 
            variant="outlined" 
            sx={{ 
              height: '100%', 
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: invoice ? 'space-between' : 'center',
              alignItems: 'center',
              p: 3,
              backgroundColor: invoice ? 'background.paper' : 'background.default'
            }}
          >
            {invoice ? (
              <>
                <Box textAlign="center" mb={2}>
                  <Typography variant="h6" gutterBottom color="text.secondary" fontWeight={500}>
                    Lightning Invoice
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Scan this QR code with any Lightning wallet
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    p: 3, 
                    backgroundColor: 'white', 
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    mb: 3
                  }}
                >
                  <QRCode 
                    value={invoice} 
                    size={200} 
                    level="H"
                    style={{ display: 'block' }} 
                  />
                </Box>
                
                <Box width="100%">
                  <TextField
                    value={truncateInvoice(invoice)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{ 
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Copy invoice">
                            <IconButton edge="end" onClick={handleCopyInvoice}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Amount: {amount} sats {memo && `• ${memo}`}
                  </Typography>
                </Box>
              </>
            ) : (
              <Box textAlign="center" p={3}>
                <Typography variant="body1" color="text.secondary">
                  Your Lightning invoice will appear here
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        message="Invoice copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default InvoiceGenerator;
