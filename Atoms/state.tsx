import { atom } from 'recoil';
import { ForecastItem } from '../Types/types';

export const cityState = atom<string>({
  key: 'cityState',
  default: ''
});

export const inputCityState = atom<string>({
  key:'inputCityState',
  default:''
});

export const errorState = atom<string>({
  key:'errorState',
  default: ''
});


export const hourlyForecastState = atom<ForecastItem[]>({
  key: 'hourlyForecastState',
  default: []
});

export const dailyForecastState = atom<ForecastItem[]>({
  key: 'dailyForecastState',
  default: []
});
