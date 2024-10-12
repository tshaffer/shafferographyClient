import { cloneDeep } from 'lodash';

import { Takeout, LocalStorageState } from '../types';
import { TedTaggerModelBaseAction } from './baseAction';

// ------------------------------------
// Constants
// ------------------------------------
export const ADD_LOCAL_STORAGES = 'ADD_LOCAL_STORAGES';

// ------------------------------------
// Actions
// ------------------------------------

interface AddLocalStoragesPayload {
  folders: string[];
}

export const addLocalStorages = (
  folders: string[],
): any => {
  return {
    type: ADD_LOCAL_STORAGES,
    payload: {
      folders
    }
  };
};

// ------------------------------------
// Reducer
// ------------------------------------

const initialState: LocalStorageState =
{
  folders: [],
};

export const localStorageStateReducer = (
  state: LocalStorageState = initialState,
  action: TedTaggerModelBaseAction<AddLocalStoragesPayload>
): LocalStorageState => {
  switch (action.type) {
    case ADD_LOCAL_STORAGES: {
      return {
        folders: action.payload.folders
      };
    }
    default:
      return state;
  }
};
