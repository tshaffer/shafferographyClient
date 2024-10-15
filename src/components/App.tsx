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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showSearchSpecDialog, setShowSearchSpecDialog] = React.useState(false);
  const [showImportFromTakeoutDialog, setShowImportFromTakeoutDialog] = React.useState(false);
  const [showImportFromLocalStorageDialog, setShowImportFromLocalStorageDialog] = React.useState(false);

  // Save the access token, expiration, and Google ID in localStorage
  const saveTokens = (token: string, expiresIn: number, googleId: string) => {
    const expirationTime = Date.now() + expiresIn * 1000; // Convert to milliseconds
    localStorage.setItem('googleAccessToken', token);
    localStorage.setItem('tokenExpiration', expirationTime.toString());
    localStorage.setItem('googleId', googleId);
    console.log('Tokens saved successfully.');
  };

  // Check if the access token is expired
  const isTokenExpired = (): boolean => {
    const accessToken = localStorage.getItem('googleAccessToken');
    const expiration = localStorage.getItem('tokenExpiration');

    // Return true if the access token or expiration is missing, or if the token has expired
    return !accessToken || !expiration || Date.now() > parseInt(expiration);
  };

  // Fetch the access token from the cookie
  const fetchAccessToken = async () => {
    try {
      const response = await fetch('http://localHost:8080/auth/token', {
        method: 'GET',
        credentials: 'include', // Include HTTP-only cookies
      });

      if (response.ok) {
        const data = await response.json();
        const { accessToken } = data;
        console.log('Access token fetched:', accessToken);
        setAccessToken(accessToken);
        setIsLoggedIn(true);
      } else {
        console.warn('No valid access token found. Attempting to refresh...');
        refreshAccessToken(); // Try to refresh if the access token is missing
      }
    } catch (error) {
      console.error('Error fetching access token:', error);
      logout(); // Logout if token fetching fails
    }
  };
  
  // Refresh the access token using the refresh token endpoint
  const refreshAccessToken = async () => {
    const googleId = localStorage.getItem('googleId');

    if (!googleId) {
      console.error('No Google ID found. Unable to refresh token.');
      setIsLoggedIn(false); // Set user as logged out without triggering a redirect loop
      return; // Prevent further execution
    }

    try {
      const response = await fetch('http://localhost:8080/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleId }),
      });

      if (response.ok) {
        const { accessToken, expiresIn } = await response.json();
        console.log('Token refreshed successfully:', accessToken);
        saveTokens(accessToken, expiresIn, googleId);
        setAccessToken(accessToken);
        setIsLoggedIn(true);
      } else {
        console.warn('Failed to refresh access token. Logging out...');
        logout();
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
      logout();
    }
  };
  
  // Logout function to clear localStorage and reload the app
  const logout = () => {
    console.log('Logging out...');
    localStorage.clear(); // Clear all localStorage data
    setIsLoggedIn(false); // Set state to logged out
    window.location.href = '/'; // Redirect to the home or login page
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const expiresIn = params.get('expiresIn');
    const googleId = params.get('googleId');
    const lastGoogleId = localStorage.getItem('googleId');
    const loggedOut = localStorage.getItem('loggedOut'); // Check if user is logged out
  
    console.log('useEffect triggered.');
    console.log('accessToken:', accessToken);
    console.log('expiresIn:', expiresIn);
    console.log('googleId:', googleId);
    console.log('lastGoogleId:', lastGoogleId);
    console.log('loggedOut:', loggedOut);
  
    // Clear loggedOut flag if present
    if (loggedOut === 'true') {
      console.log('User already logged out.');
      localStorage.removeItem('loggedOut');
      setIsLoggedIn(false);
      return; // Prevent further execution
    }
  
    // Handle user switch by clearing localStorage if a new Google ID is detected
    if (googleId && googleId !== lastGoogleId) {
      console.log('Detected user switch. Clearing localStorage.');
      localStorage.clear();
    }
  
    // Save tokens if they exist in the query parameters
    if (accessToken && expiresIn && googleId) {
      saveTokens(accessToken, parseInt(expiresIn), googleId);
      setIsLoggedIn(true);
      window.history.replaceState({}, document.title, '/'); // Clear query params from the URL
    } 
    // If the token is expired or missing, attempt to refresh it
    else if (isTokenExpired()) {
      const savedGoogleId = localStorage.getItem('googleId');
      if (savedGoogleId) {
        console.warn('Token expired or missing. Attempting to refresh...');
        refreshAccessToken();
      } else {
        console.warn('No valid session found. Displaying login prompt.');
        setIsLoggedIn(false); // Set state to logged out without looping
      }
    } else {
      console.log('Tokens are valid. User is logged in.');
      setIsLoggedIn(true);
    }
  }, []);

  // useEffect to manage authentication on page load
  /*
  useEffect(() => {
    if (isTokenExpired()) {
      console.warn('Token expired or missing. Attempting to refresh...');
      refreshAccessToken();
    } else {
      fetchAccessToken(); // Fetch access token if not expired
    }
  }, []);


  return (
    <div>
      {isLoggedIn ? (
        <p>Logged in! Access Token: {accessToken}</p>
      ) : (
        <a href="/auth/google">Login with Google</a>
      )}
    </div>
  );
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
  */

  // Main useEffect to handle authentication and token refreshing
  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const accessToken = params.get('accessToken');
  //   const expiresIn = params.get('expiresIn');
  //   const googleId = params.get('googleId');
  //   const lastGoogleId = localStorage.getItem('googleId'); // Previous user ID
  //   const loggedOut = localStorage.getItem('loggedOut'); // Check if user is logged out

  //   console.log('useEffect triggered.');
  //   console.log('accessToken:', accessToken);
  //   console.log('expiresIn:', expiresIn);
  //   console.log('googleId:', googleId);
  //   console.log('lastGoogleId:', lastGoogleId);
  //   console.log('loggedOut:', loggedOut);

  //   // Clear loggedOut flag once the page reloads
  //   if (loggedOut === 'true') {
  //     console.log('User already logged out.');
  //     localStorage.removeItem('loggedOut');
  //     return; // Prevent further execution
  //   }

  //   if (googleId && googleId !== lastGoogleId) {
  //     console.log('Detected user switch. Clearing localStorage.');
  //     localStorage.clear();
  //   }

  //   if (accessToken && expiresIn && googleId) {
  //     saveTokens(accessToken, parseInt(expiresIn), googleId);
  //     setIsLoggedIn(true);
  //     window.history.replaceState({}, document.title, '/'); // Clear query params
  //   } else if (isTokenExpired()) {
  //     console.warn('Token expired or missing. Logging out...');
  //     logout();
  //   } else {
  //     setIsLoggedIn(true); // Tokens are valid, set user as logged in
  //   }
  // }, []);

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

