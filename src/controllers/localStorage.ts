import axios from 'axios';
import { addLocalStorages, TedTaggerAnyPromiseThunkAction, TedTaggerDispatch } from '../models';
import { serverUrl, apiUrlFragment } from '../types';

export const loadLocalStorageFolders = (): TedTaggerAnyPromiseThunkAction => {

  return (dispatch: TedTaggerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'localDriveImportFolders';

    return axios.get(path)
      .then((response: any) => {
        const folders: string[] = response.data;
        dispatch(addLocalStorages(folders));
        return Promise.resolve();
      }).catch((error) => {
        console.log('error');
        console.log(error);
        return '';
      });
  };
};

export const importFromLocalStorage = (folder: string): TedTaggerAnyPromiseThunkAction => {
  return (dispatch: TedTaggerDispatch, getState: any) => {

    console.log('importFromLocalStorage', folder);

    const path = serverUrl + apiUrlFragment + 'importFromLocalStorage';

    const importFromLocalStorageBody = { folder };

    return axios.post(
      path,
      importFromLocalStorageBody
    ).then((response) => {
      console.log('importFromLocalStorage response', response);
      // const addedTakeoutData: AddedTakeoutData = response.data;

      // const addedMediaItems: MediaItem[] = addedTakeoutData.addedMediaItems;
      // console.log('addedMediaItems', addedMediaItems);
      // dispatch(addMediaItems(addedMediaItems));

      // const addedKeywordData: KeywordData | null = addedTakeoutData.addedKeywordData;
      // if (!isNil(addedKeywordData)) {
      //   console.log('mergeKeywordData');
      //   dispatch(mergeKeywordData(addedKeywordData));
      // }
      // console.log(getState());
      return Promise.resolve();
    }).catch((error) => {
      console.log('error');
      console.log(error);
      debugger;
      return '';
    });
  };
};
//   const path = serverUrl + apiUrlFragment + 'importFromLocalStorage';

//   const importFromTakeoutBody = { id: folder };

//   return axios.post(
//     path,
//     importFromTakeoutBody
//   ).then((response) => {
//     console.log('importFromTakeoutBody response', response);
//     const addedTakeoutData: AddedTakeoutData = response.data;

//     const addedMediaItems: MediaItem[] = addedTakeoutData.addedMediaItems;
//     console.log('addedMediaItems', addedMediaItems);
//     dispatch(addMediaItems(addedMediaItems));

//     const addedKeywordData: KeywordData | null = addedTakeoutData.addedKeywordData;
//     if (!isNil(addedKeywordData)) {
//       console.log('mergeKeywordData');
//       dispatch(mergeKeywordData(addedKeywordData));
//     }
//     console.log(getState());
//   }).catch((error) => {
//     console.log('error');
//     console.log(error);
//     debugger;
//     return '';
//   });
// };
// };
