import axios from 'axios';
import { serverUrl, apiUrlFragment } from '../types';
import { isNil, isEmpty, isString } from 'lodash';

export const uploadToGoogle = async (albumName: string, mediaItemIds: string[]): Promise<any> => {

  const googleAccessToken: string = localStorage.getItem('googleAccessToken') as string;
  if (isNil(googleAccessToken) || !isString(googleAccessToken) || isEmpty(googleAccessToken)) {
    throw new Error('googleAccessToken is invalid');
  }

  const uploadUrl = serverUrl + apiUrlFragment + 'uploadToGoogle';

  const uploadToGoogleBody = {
    googleAccessToken,
    albumName,
    mediaItemIds,
  };

  return axios.post(
    uploadUrl,
    uploadToGoogleBody
  ).then((response) => {
    return Promise.resolve(response);
  }).catch((error) => {
    console.log('error');
    console.log(error);
    return '';
  });
};