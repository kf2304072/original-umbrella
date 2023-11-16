export type MenuMapping = {
  'TOP': string,
  '現在地の天気': string,
  '3時間毎の天気': string,
  '5日間天気予報': string,
  '気象アドバイス': string,
  '投稿': string,
  'お気に入りの地域': string,
  'プロフィール': string,
  'ログアウト': string
};

export const menuSidebar: MenuMapping = {
  "TOP": '/homes',
  "現在地の天気": '/homes/current-weather',
  '3時間毎の天気': '/homes/hourly-forecast',
  '5日間天気予報': '/homes/5-day-forecast',
  '気象アドバイス': '/homes/weather-advice',
  '投稿': '/homes/posting',
  'お気に入りの地域': '/homes/favorite-locations',
  'プロフィール': '/homes/profile',
  'ログアウト': '/homes/logout'
};

export interface Weather {
  main:string;
  icon:string
};

export interface ForecastItem {
  dt:number;
    temp: {
      day:number
    };
    main:{
      temp:number
    };
    weather:Weather[]
};

export interface UserProfile {
  id:string;
  username: string;
  imageUrl: string;
  selfIntroduction: string;
};


export type ProfileModalProps = {
  isOpen:boolean;
  profile:UserProfile;
  onSave:(profile: UserProfile) =>void;
  onClose:() =>void;
};