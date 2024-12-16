import { serverUrl, apiUrlFragment } from '../types';

// export const uploadRawMedia = async (formData: FormData, albumName: string): Promise<any> => {
export const uploadRawMedia = async (formData: FormData): Promise<any> => {

  const albumName = 'testAlbum';
  
  const uploadUrl = serverUrl + apiUrlFragment + 'uploadRawMedia';

  try {
    // Append additional information
    formData.append('albumName', albumName);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    return Promise.resolve(response);
  } catch (err) {
    return Promise.reject(err);
  }
};
