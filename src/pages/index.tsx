import type { NextPage } from "next";
import React from 'react';
import Head from "next/head";
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import PageAppBar from '../components/AppBar/PageAppBar';
import SideBar from '../components/AppBar/SideBar';
import MainPanel from '../components/MainPanel';
import { Dashboard } from '../components/Dashboard'
const drawerWidth = 0;

const Home: NextPage = (props) => {
  const [searchAddress, setSearchAddress] = React.useState('');
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handlerSearchAddress = (address: string) => {
    setSearchAddress(address);
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <PageAppBar
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        handlerSearchAddress={(e) => handlerSearchAddress(e)}
      />
      <MainPanel
        drawerWidth={drawerWidth}
      >
        <Dashboard
          searchAddress={searchAddress}
        />
      </MainPanel>
    </Box >
  );
};

export default Home;
