import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const App: React.FC = () => {
  // const navigate = useNavigate();

  // useEffect(() => {
  //   const queryParams = new URLSearchParams(window.location.search);
  //   const accessToken = queryParams.get('accessToken');

  //   if (accessToken) {
  //     localStorage.setItem('googleAccessToken', accessToken);
  //   } else {
  //     navigate('/');
  //   }
  // }, [navigate]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const saveTokens = (accessToken: string, expiresIn: number, refreshToken: string | null) => {
    const expirationTime = Date.now() + expiresIn * 1000; // Expiration time in ms
    localStorage.setItem('googleAccessToken', accessToken);
    localStorage.setItem('tokenExpiration', expirationTime.toString());
    if (refreshToken) {
      localStorage.setItem('googleRefreshToken', refreshToken);
    }
  };

  useEffect(() => {
    // const params = new URLSearchParams(window.location.search);
    // const token = params.get('accessToken');
    // console.log('token', token);
    // if (token) {
    //   localStorage.setItem('googleAccessToken', token);
    // }
    // Check for tokens in the URL query parameters
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const expiresIn = params.get('expiresIn');
    const refreshToken = params.get('refreshToken');

    console.log('accessToken', accessToken);
    console.log('expiresIn', expiresIn);
    console.log('refreshToken', refreshToken);

    if (accessToken && expiresIn) {
      saveTokens(accessToken, parseInt(expiresIn), refreshToken);
      setIsLoggedIn(true);
      // Clear query parameters from the URL
      window.history.replaceState({}, document.title, '/');
    }

  }, []);

  // return (
  //   <button onClick={() => window.location.href = 'http://localhost:8080/auth/google'}>
  //     Connect with Google
  //   </button>
  // );

  return (
    <div>
      {isLoggedIn ? (
        <p>Logged in successfully! Access token saved.</p>
      ) : (
        <a href="/auth/google">Login with Google</a>
      )}
    </div>
  );
};

export default App;

/*
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('googleRefreshToken');

  if (!refreshToken) {
    console.log('No refresh token found. Redirecting to login...');
    window.location.href = '/auth/google';
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      saveTokens(data.accessToken, data.expiresIn, refreshToken);
      console.log('Access token refreshed!');
    } else {
      console.log('Failed to refresh token. Redirecting to login...');
      window.location.href = '/auth/google';
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    window.location.href = '/auth/google';
  }
};

const isTokenExpired = (): boolean => {
  const expiration = localStorage.getItem('tokenExpiration');
  if (!expiration) return true; // Treat as expired if not found
  return Date.now() > parseInt(expiration);
};

const getAccessToken = async () => {
  if (isTokenExpired()) {
    await refreshAccessToken();
  }
  return localStorage.getItem('googleAccessToken');
};
*/

/*
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import '../styles/TedTagger.css';
import { loadMediaItems, loadKeywordData, loadTakeouts, importFromTakeout, loadDeletedMediaItems, loadLocalStorageFolders, importFromLocalStorage, authenticate } from '../controllers';
import { TedTaggerDispatch, setAppInitialized } from '../models';
import { getKeywordRootNodeId, getPhotoLayout } from '../selectors';
import { Button } from '@mui/material';

import Keywords from './Keywords';
import SearchSpecDialog from './SearchSpecDialog';
import ImportFromTakeoutDialog from './ImportFromTakeoutDialog';
import LoupeViewController from './LoupeViewController';
import { PhotoLayout } from '../types';
import SurveyView from './SurveyView';
import TopToolbar from './TopToolbar';
import GridView from './GridView';
import ImportFromLocalStorageDialog from './ImportFromLocalStorageDialog';

export interface AppProps {
  photoLayout: PhotoLayout;
  onLoadKeywordData: () => any;
  onLoadMediaItems: () => any;
  onLoadDeletedMediaItems: () => any;
  onLoadTakeouts: () => any;
  onLoadLocalStorages: () => any;
  onSetAppInitialized: () => any;
  keywordRootNodeId: string;
  onImportFromTakeout: (id: string) => void;
  onImportFromLocalStorage: (folder: string) => void;
  onAuthenticate: () => any;
}

const App = (props: AppProps) => {

  const [showSearchSpecDialog, setShowSearchSpecDialog] = React.useState(false);
  const [showImportFromTakeoutDialog, setShowImportFromTakeoutDialog] = React.useState(false);
  const [showImportFromLocalStorageDialog, setShowImportFromLocalStorageDialog] = React.useState(false);

  const handleImportFromTakeout = (takeoutId: string) => {
    props.onImportFromTakeout(takeoutId);
  };

  const handleImportFromLocalStorage = (takeoutId: string) => {
    props.onImportFromLocalStorage(takeoutId);
  };

  const handleCloseSearchSpecDialog = () => {
    setShowSearchSpecDialog(false);
  };

  const handleCloseImportFromTakeoutDialog = () => {
    setShowImportFromTakeoutDialog(false);
  };

  const handleCloseImportFromLocalStorageDialog = () => {
    setShowImportFromLocalStorageDialog(false);
  };

  const handleAuthenticate = () => {
    props.onAuthenticate();
  };

  // React.useEffect(() => {
  //   props.onLoadKeywordData()
  //     .then(function () {
  //       return props.onLoadTakeouts();
  //     }).then(function () {
  //       return props.onLoadLocalStorages();
  //     }).then(function () {
  //       return props.onLoadMediaItems();
  //     }).then(function () {
  //       return props.onLoadDeletedMediaItems();
  //     }).then(function () {
  //       return props.onSetAppInitialized();
  //     });
  // }, []);

  const getLeftColumn = (): JSX.Element => {
    return (
      <div className='leftColumnStyle'>
        <Keywords />
        <Button onClick={() => setShowSearchSpecDialog(true)}>Set Search Spec</Button>
        <SearchSpecDialog
          open={showSearchSpecDialog}
          onClose={handleCloseSearchSpecDialog}
        />
        <Button onClick={() => setShowImportFromTakeoutDialog(true)}>Import from Takeout</Button>
        <ImportFromTakeoutDialog
          open={showImportFromTakeoutDialog}
          onImportFromTakeout={handleImportFromTakeout}
          onClose={handleCloseImportFromTakeoutDialog}
        />
        <Button onClick={() => setShowImportFromLocalStorageDialog(true)}>Import from Local Storage</Button>
        <ImportFromLocalStorageDialog
          open={showImportFromLocalStorageDialog}
          onImportFromLocalStorage={handleImportFromLocalStorage}
          onClose={handleCloseImportFromLocalStorageDialog}
        />
      </div>
    );
  };

  const getPhotoDisplay = (): JSX.Element => {
    if (props.photoLayout === PhotoLayout.Loupe) {
      return (
        <React.Fragment>
          <div id='centerColumn' className='centerColumnStyle'>
            <LoupeViewController />
          </div>
        </React.Fragment>
      );
    } else if (props.photoLayout === PhotoLayout.Survey) {
      return (
        <React.Fragment>
          <div id='centerColumn' className='centerColumnStyle'>
            <SurveyView />
          </div>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          {getLeftColumn()}
          <div id='centerColumn' className='centerColumnStyle'>
            <GridView />
          </div>
          <div className='rightColumnStyle'>Right Panel</div>
        </React.Fragment>
      );
    }
  };

  const photoDisplay: JSX.Element = getPhotoDisplay();

  // return (
  //   <div>
  //     <React.Fragment>
  //       <TopToolbar />
  //     </React.Fragment>
  //     <div className='appStyle'>
  //       {photoDisplay}
  //     </div>
  //   </div>

  // );
  return (
    <div>
      Pizza
      <Button onClick={handleAuthenticate}>Connect to Google</Button>

    </div>
  );
};

function mapStateToProps(state: any) {
  return {
    photoLayout: getPhotoLayout(state),
    keywordRootNodeId: getKeywordRootNodeId(state),
  };
}

const mapDispatchToProps = (dispatch: TedTaggerDispatch) => {
  return bindActionCreators({
    onLoadKeywordData: loadKeywordData,
    onLoadMediaItems: loadMediaItems,
    onLoadDeletedMediaItems: loadDeletedMediaItems,
    onSetAppInitialized: setAppInitialized,
    onLoadTakeouts: loadTakeouts,
    onLoadLocalStorages: loadLocalStorageFolders,
    onImportFromTakeout: importFromTakeout,
    onImportFromLocalStorage: importFromLocalStorage,
    onAuthenticate: authenticate
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(App);

*/

