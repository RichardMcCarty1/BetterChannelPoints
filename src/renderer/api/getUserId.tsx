import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';
import { clientId } from '../../Constants';

export const getUserId = (token: string): AxiosPromise => {
  return axios.get('https://api.twitch.tv/helix/users', {
    headers: { Authorization: `Bearer ${token}`, 'Client-ID': clientId },
  });
};

export const getChannelRedemptions = (token: string, user: string): AxiosPromise => {
  return axios.get(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${user}`, {
    headers: { Authorization: `Bearer ${token}`, 'Client-Id': clientId, }
  })
}

export const axiosWrapper = (url: string, method: string, data?: any | undefined, config?: AxiosRequestConfig<any> | undefined) => {
  let axiosFunc;
  let isDataMethod;
  switch (method) {
    case 'POST': {
      axiosFunc = axios.post;
      isDataMethod = data;
      break;
    }
    case 'GET': {
      axiosFunc = axios.get;
      break;
    }
    case 'PUT': {
      axiosFunc = axios.put;
      isDataMethod = data;
      break;
    }
    case 'PATCH': {
      axiosFunc = axios.patch;
      isDataMethod = data;
      break;
    }
    default:
      axiosFunc = axios.delete;
      break;
  }
  return isDataMethod ? axiosFunc(url, isDataMethod, config) : axiosFunc(url, config);
}
