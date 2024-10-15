import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import '../styles/TedTagger.css';
import { loadMediaItems, loadKeywordData, loadTakeouts, importFromTakeout, loadDeletedMediaItems, loadLocalStorageFolders, importFromLocalStorage } from '../controllers';
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
}


const App = (props: AppProps) => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSearchSpecDialog, setShowSearchSpecDialog] = React.useState(false);
  const [showImportFromTakeoutDialog, setShowImportFromTakeoutDialog] = React.useState(false);
  const [showImportFromLocalStorageDialog, setShowImportFromLocalStorageDialog] = React.useState(false);

  // Save the access token, expiration, and Google ID in localStorage
  const saveTokens = (accessToken: string, expiresIn: number, googleId: string) => {
    const expirationTime = Date.now() + expiresIn * 1000; // Convert to ms
    localStorage.setItem('googleAccessToken', accessToken);
    localStorage.setItem('tokenExpiration', expirationTime.toString());
    localStorage.setItem('googleId', googleId); // Store Google ID
  };

  // Check if the access token is expired
  const isTokenExpired = (): boolean => {
    const accessToken = localStorage.getItem('googleAccessToken');
    const expiration = localStorage.getItem('tokenExpiration');
    return !accessToken || !expiration || Date.now() > parseInt(expiration);
  };

  // Refresh the access token using the Google ID
  const refreshAccessToken = async () => {
    const googleId = localStorage.getItem('googleId'); // Retrieve Google ID

    if (!googleId) {
      console.error('No Google ID found. Redirecting to login...');
      window.location.href = '/auth/google';
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleId }),
      });

      if (response.ok) {
        const { accessToken, expiresIn } = await response.json();
        saveTokens(accessToken, expiresIn, googleId); // Save the new access token
        setIsLoggedIn(true); // Update the state
      } else {
        console.error('Failed to refresh access token. Redirecting to login...');
        window.location.href = '/auth/google'; // Re-authenticate if refresh fails
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
      window.location.href = '/auth/google';
    }
  };

  const logout = () => {
    localStorage.removeItem('googleAccessToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('googleId');
    setIsLoggedIn(false); // Reset the login state
    window.location.href = '/'; // Redirect to home or login page
  };

  // Main useEffect to handle authentication and token refreshing
  useEffect(() => {
    debugger;
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const expiresIn = params.get('expiresIn');
    const googleId = params.get('googleId');
    const lastGoogleId = localStorage.getItem('googleId'); // Previous user ID
  
    // Detect user switch and clear storage if different user logs in
    if (googleId && googleId !== lastGoogleId) {
      console.log('Detected user switch. Clearing localStorage.');
      localStorage.clear();
    }
  
    if (accessToken && expiresIn && googleId) {
      saveTokens(accessToken, parseInt(expiresIn), googleId);
      setIsLoggedIn(true);
      window.history.replaceState({}, document.title, '/'); // Clear query params
    } else if (isTokenExpired()) {
      console.warn('Token expired or missing. Logging out...');
      logout();
    } else {
      setIsLoggedIn(true);
    }
  }, []);

  React.useEffect(() => {
    props.onLoadKeywordData()
      .then(function () {
        return props.onLoadTakeouts();
      }).then(function () {
        return props.onLoadLocalStorages();
      }).then(function () {
        return props.onLoadMediaItems();
      }).then(function () {
        return props.onLoadDeletedMediaItems();
      }).then(function () {
        return props.onSetAppInitialized();
      });
  }, []);

  if (!isLoggedIn) {
    return (
      <a href="/auth/google">Login with Google</a>
    );
  } else {
    return (
      <div>pizza</div>
    );
  }

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

  return (
    <div>
      <React.Fragment>
        <TopToolbar />
      </React.Fragment>
      <div className='appStyle'>
        {photoDisplay}
      </div>
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
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(App);

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

