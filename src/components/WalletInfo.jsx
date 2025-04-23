import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Card, 
  CardContent, 
  Grid, 
  Skeleton, 
  Chip, 
  Divider, 
  Button, 
  IconButton, 
  Tooltip, 
  Paper,
  Avatar
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const WalletInfo = () => {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchInfo = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      if (!window.webln) {
        setError('WebLN not available. Please use Alby or another WebLN-enabled wallet.');
        return;
      }
      
      await window.webln.enable();
      const result = await window.webln.getInfo();
      setInfo(result);
    } catch (err) {
      setError(err.message || 'Could not fetch wallet info.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const handleCopyPubkey = () => {
    if (info?.node?.pubkey) {
      navigator.clipboard.writeText(info.node.pubkey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatePubkey = (pubkey) => {
    if (!pubkey) return 'N/A';
    return `${pubkey.substring(0, 8)}...${pubkey.substring(pubkey.length - 8)}`;
  };

  return (
    <Box>
      <Box mb={3} display="flex" alignItems="center">
        <AccountBalanceWalletIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
        <Typography variant="h5" fontWeight={600}>
          Wallet Information
        </Typography>
        <Tooltip title="Your Lightning wallet details" placement="right">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {error ? (
        <Alert 
          severity="error" 
          sx={{ borderRadius: 2, mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchInfo}>
              Try Again
            </Button>
          }
        >
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="h6" color="text.secondary" fontWeight={500}>
                    Node Information
                  </Typography>
                  <Tooltip title="Refresh wallet info">
                    <IconButton 
                      size="small" 
                      onClick={fetchInfo} 
                      disabled={refreshing}
                      sx={{ ml: 'auto' }}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {loading ? (
                  <Box>
                    <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="90%" height={30} sx={{ mb: 1 }} />
                  </Box>
                ) : info ? (
                  <>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Node Alias
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {info.node?.alias || 'Not available'}
                      </Typography>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Node Pubkey
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body1" sx={{ mr: 1 }}>
                          {truncatePubkey(info.node?.pubkey)}
                        </Typography>
                        {info.node?.pubkey && (
                          <Tooltip title={copied ? "Copied!" : "Copy pubkey"}>
                            <IconButton size="small" onClick={handleCopyPubkey}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" fontWeight={500} gutterBottom>
                  Wallet Balance
                </Typography>
                
                {loading ? (
                  <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                ) : info ? (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 3,
                      backgroundColor: 'action.hover',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="h3" fontWeight={700} color="primary.main">
                      {info.balance || '0'}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      satoshis
                    </Typography>
                    
                    {info.balance && (
                      <Chip 
                        label={`≈ $${((info.balance / 1e8) * 40000).toFixed(2)} USD`} 
                        size="small" 
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default WalletInfo;
