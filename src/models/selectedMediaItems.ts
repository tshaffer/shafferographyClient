import { cloneDeep } from 'lodash';

import { SelectedMediaItemsState } from '../types';
import { TedTaggerModelBaseAction } from './baseAction';

// ------------------------------------
// Constants
// ------------------------------------
export const SELECT_MEDIA_ITEM = 'SELECT_MEDIA_ITEM';
export const DESELECT_MEDIA_ITEM = 'DESELECT_MEDIA_ITEM';
export const DESELECT_MEDIA_ITEM_SELECTION_ALL = 'DESELECT_MEDIA_ITEM_SELECTION_ALL';
export const SET_LAST_CLICKED_ID = 'SET_LAST_CLICKED_ID';

// ------------------------------------
// Actions
// ------------------------------------

interface SelectMediaItemPayload {
  googleMediaItemid: string;
}

export const selectMediaItem = (
  googleMediaItemid: string,
): any => {
  return {
    type: SELECT_MEDIA_ITEM,
    payload: {
      googleMediaItemid
    }
  };
};

interface DeselectMediaItemPayload {
  googleMediaItemid: string;
}

export const deselectMediaItem = (
  googleMediaItemid: string,
): any => {
  return {
    type: DESELECT_MEDIA_ITEM,
    payload: {
      googleMediaItemid
    }
  };
};

export const clearMediaItemSelection = (
): any => {
  return {
    type: DESELECT_MEDIA_ITEM_SELECTION_ALL,
  };
};

interface SetLastClickedIdPayload {
  googleMediaItemid: string | null;
}

export const setLastClickedId = (
  googleMediaItemid: string | null,
): any => {
  return {
    type: SET_LAST_CLICKED_ID,
    payload: {
      googleMediaItemid
    }
  };
};


// ------------------------------------
// Reducer
// ------------------------------------

const initialState: SelectedMediaItemsState =
{
  selectedMediaItemIds: [],
  lastClickedId: null,
};

export const selectedMediaItemsStateReducer = (
  state: SelectedMediaItemsState = initialState,
  action: TedTaggerModelBaseAction<
  SetLastClickedIdPayload & SelectMediaItemPayload & DeselectMediaItemPayload
  >
): SelectedMediaItemsState => {
  switch (action.type) {
    case DESELECT_MEDIA_ITEM_SELECTION_ALL: {
      const newState = cloneDeep(state) as SelectedMediaItemsState;
      newState.selectedMediaItemIds = [];
      return newState;
    }
    case SET_LAST_CLICKED_ID: {
      const newState = cloneDeep(state) as SelectedMediaItemsState;
      newState.lastClickedId = action.payload.googleMediaItemid;
      return newState;
    }
    case SELECT_MEDIA_ITEM: {
      const newState = cloneDeep(state) as SelectedMediaItemsState;
      newState.selectedMediaItemIds.push(action.payload.googleMediaItemid);
      return newState;
    }
    case DESELECT_MEDIA_ITEM: {
      const newState = cloneDeep(state) as SelectedMediaItemsState;
      newState.selectedMediaItemIds = newState.selectedMediaItemIds.filter((selectedId) => selectedId !== action.payload.googleMediaItemid);
      return newState;
    }
    default:
      return state;
  }
};

