import { serverUrl, apiUrlFragment } from '../types';

export const uploadRawMedia = async (formData: FormData): Promise<any> => {

  const uploadUrl = serverUrl + apiUrlFragment + 'uploadRawMedia';

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    return Promise.resolve(response);
  } catch (err) {
    return Promise.reject(err);
  }
};

