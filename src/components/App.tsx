import React, { useEffect } from 'react';
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

  return (
    <button onClick={() => window.location.href = 'http://localhost:8080/auth/google'}>
      Connect with Google
    </button>
  );
};

export default App;
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
