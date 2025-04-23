import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  AppBar, 
  Box, 
  Container, 
  Drawer, 
  Divider, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  useMediaQuery, 
  Paper, 
  Fab
} from '@mui/material';

// Icons
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PaymentIcon from '@mui/icons-material/Payment';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SendIcon from '@mui/icons-material/Send';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

// Components
import SendPayment from './components/SendPayment';
import Keysend from './components/Keysend';
import AutoPayOnScroll from './components/AutoPayOnScroll';
import WalletInfo from './components/WalletInfo';
import InvoiceGenerator from './components/InvoiceGenerator';
import PayViaWebLN from './components/PayViaWebLN';
import QRCodeScanner from './components/QRCodeScanner';
import FiatSatsConverter from './components/FiatSatsConverter';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('wallet');
  const isMobile = useMediaQuery('(max-width:900px)');
  const drawerWidth = 280;

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#ff9800' },
      secondary: { main: '#3f51b5' },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff'
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700
      },
      h6: {
        fontWeight: 600
      }
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: darkMode ? 
              '0 4px 20px rgba(0, 0, 0, 0.3)' : 
              '0 4px 20px rgba(0, 0, 0, 0.08)'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8
            }
          }
        }
      }
    }
  });

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const navigationItems = [
    { id: 'wallet', text: 'Wallet Info', icon: <AccountBalanceWalletIcon /> },
    { id: 'converter', text: 'Fiat/Sats Converter', icon: <CurrencyExchangeIcon /> },
    { id: 'send', text: 'Send Payment', icon: <SendIcon /> },
    { id: 'keysend', text: 'Keysend', icon: <PaymentIcon /> },
    { id: 'invoice', text: 'Invoice Generator', icon: <ReceiptIcon /> },
    { id: 'webln', text: 'Pay via WebLN', icon: <PaymentIcon /> },
    { id: 'autopay', text: 'Auto Pay on Scroll', icon: <AutorenewIcon /> },
    { id: 'qrscanner', text: 'QR Code Scanner', icon: <QrCodeScannerIcon /> }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'wallet':
        return <WalletInfo />;
      case 'converter':
        return <FiatSatsConverter />;
      case 'send':
        return <SendPayment />;
      case 'keysend':
        return <Keysend />;
      case 'invoice':
        return <InvoiceGenerator />;
      case 'webln':
        return <PayViaWebLN />;
      case 'autopay':
        return <AutoPayOnScroll />;
      case 'qrscanner':
        return <QRCodeScanner />;
      default:
        return <WalletInfo />;
    }
  };

  const drawer = (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Lightning App
        </Typography>
        {isMobile && (
          <IconButton onClick={toggleDrawer}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List sx={{ p: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              onClick={() => handleSectionChange(item.id)}
              selected={activeSection === item.id}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
          Powered by Alby WebLN
        </Typography>
      </Box>
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Permanent drawer for desktop */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                border: 'none',
                boxShadow: darkMode ? '4px 0 10px rgba(0, 0, 0, 0.2)' : '4px 0 10px rgba(0, 0, 0, 0.05)'
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        {/* Temporary drawer for mobile */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={toggleDrawer}
            sx={{
              '& .MuiDrawer-paper': { 
                width: drawerWidth, 
                boxSizing: 'border-box',
                border: 'none'
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        {/* Main content */}
        <Box component="main" sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <AppBar 
            position="static" 
            color="transparent" 
            elevation={0}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              backdropFilter: 'blur(8px)',
              backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <Toolbar>
              {isMobile && (
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleDrawer}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {navigationItems.find(item => item.id === activeSection)?.text || 'Lightning WebLN'}
              </Typography>
              <IconButton onClick={() => setDarkMode((d) => !d)} color="inherit">
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
              {renderContent()}
            </Paper>
          </Container>
        </Box>

        {/* Mobile fab for quick access */}
        {isMobile && !drawerOpen && (
          <Fab 
            color="primary" 
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ 
              position: 'fixed', 
              bottom: 16, 
              right: 16,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            <MenuIcon />
          </Fab>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
