import axios from 'axios';
import { TedTaggerAnyPromiseThunkAction, TedTaggerDispatch, addMediaItems, addTakeouts } from '../models';
import { serverUrl, apiUrlFragment, Takeout, AddedTakeoutData, KeywordData, MediaItem } from '../types';
import { mergeKeywordData } from './keywords';
import { isNil } from 'lodash';

export const loadTakeouts = (): TedTaggerAnyPromiseThunkAction => {
  return (dispatch: TedTaggerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'takeouts';

    return axios.get(path)
      .then((response: any) => {
        const takeouts: Takeout[] = response.data;
        dispatch(addTakeouts(takeouts));
        return Promise.resolve();
      }).catch((error) => {
        console.log('error');
        console.log(error);
        return '';
      });
  };
};

export const importFromTakeout = (takeoutId: string): TedTaggerAnyPromiseThunkAction => {
  return (dispatch: TedTaggerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'importFromTakeout';

    const importFromTakeoutBody = { id: takeoutId };

    return axios.post(
      path,
      importFromTakeoutBody
    ).then((response) => {
      console.log('importFromTakeoutBody response', response);
      const addedTakeoutData: AddedTakeoutData = response.data;

      const addedMediaItems: MediaItem[] = addedTakeoutData.addedMediaItems;
      console.log('addedMediaItems', addedMediaItems);
      dispatch(addMediaItems(addedMediaItems));

      const addedKeywordData: KeywordData | null = addedTakeoutData.addedKeywordData;
      if (!isNil(addedKeywordData)) {
        console.log('mergeKeywordData');
        dispatch(mergeKeywordData(addedKeywordData));
      }
      console.log(getState());
    }).catch((error) => {
      console.log('error');
      console.log(error);
      debugger;
      return '';
    });
  };
};
