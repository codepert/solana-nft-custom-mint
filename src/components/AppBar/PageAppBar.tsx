import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';

import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';

interface Props {
  drawerWidth: number;
  handleDrawerToggle: () => void;
  handlerSearchAddress: (address: string) => void;
}

const PageAppBar = (props: Props) => {
  const [searchaddress, setSerachAddress] = React.useState('');
  const handleChange = (value: string) => {
    setSerachAddress(value)
  }
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${props.drawerWidth}px)` },
        ml: { sm: `${props.drawerWidth}px` },
      }}
    >
      <Toolbar >
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={props.handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{ width: '55%', maxWidth: '60%', maxHeight: '56px', margin: 'auto 0' }}
          >

          </div>
          {/* <TextField id="searchText" size="small" variant="outlined" placeholder="Search address, token" style={{ width: '100%' }} /> */}

          <div className="multi-wrapper">
            <span className="button-wrapper">
              <WalletModalProvider>
                <WalletMultiButton />
              </WalletModalProvider>
            </span>
          </div>
        </div>
      </Toolbar>
    </AppBar >
  )
}

export default PageAppBar;