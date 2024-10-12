import { AppState, MainDisplayMode } from '../types';
import { TedTaggerModelBaseAction } from './baseAction';

// ------------------------------------
// Constants
// ------------------------------------
export const SET_APP_INITIALIZED = 'SET_APP_INITIALIZED';
export const SET_MAIN_DISPLAY_MODE = 'SET_MAIN_DISPLAY_MODE';
export const SET_FULL_SCREEN_MEDIA_ITEM_ID = 'SET_FULL_SCREEN_MEDIA_ITEM_ID';

// ------------------------------------
// Actions
// ------------------------------------

export const setAppInitialized = (): any => {
  return {
    type: SET_APP_INITIALIZED,
  };
};

export const setMainDisplayMode = (mainDisplayMode: MainDisplayMode): any => {
  return {
    type: SET_MAIN_DISPLAY_MODE,
    payload: mainDisplayMode,
  };
};

export const setFullScreenMediaItemId = (mediaItemId: string): any => {
  return {
    type: SET_FULL_SCREEN_MEDIA_ITEM_ID,
    payload: mediaItemId,
  };
};


// ------------------------------------
// Reducer
// ------------------------------------

const initialState: AppState = {
  appInitialized: false,
  mainDisplayMode: MainDisplayMode.Grid,
  fullScreenMediaItemId: '',
};

export const appStateReducer = (
  state: AppState = initialState,
  action: TedTaggerModelBaseAction<any>
): AppState => {
  switch (action.type) {
    case SET_APP_INITIALIZED: {
      return { ...state, appInitialized: true };
    }
    case SET_MAIN_DISPLAY_MODE: {
      return { ...state, mainDisplayMode: action.payload };
    }
    case SET_FULL_SCREEN_MEDIA_ITEM_ID: {
      return {
        ...state,
        mainDisplayMode: MainDisplayMode.FullScreen,
        fullScreenMediaItemId: action.payload
      };
    }
    default:
      return state;
  }
};
