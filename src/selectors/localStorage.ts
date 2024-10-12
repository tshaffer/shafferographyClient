import {
  TedTaggerState
} from '../types';

export const getLocalStorageFolders = (state: TedTaggerState): string[] => {
  return state.localStorageState.folders;
};
