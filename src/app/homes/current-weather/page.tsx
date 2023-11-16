"use client";
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {useState }from 'react';
import { useRouter } from 'next/navigation';

type MenuMapping = {
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

const menuSidebar: MenuMapping = {
  'TOP': '/homes',
  '現在地の天気': '/homes/current-weather',
  '3時間毎の天気': '/homes/hourly-forecast',
  '5日間天気予報': '/homes/5-day-forecast',
  '気象アドバイス':'/homes/weather-advice',
  '投稿':'/homes/posting',
  'お気に入りの地域': '/homes/favorite-locations',
  'プロフィール':'/homes/profile',
  'ログアウト': '/homes/logout'
};

type WeatherData = {
  date:string;
  city:string;
  iconUrl:string;
  description:string;
  tempMax:string;
  tempMin:string
};

const currentWeather:React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const router = useRouter();

  const handleMenuItemClick = (url:string) =>{
    router.push(url);
  };

  useEffect(() =>{
    const fetchCurrentWeather = () =>{
      if(!navigator.geolocation){
        console.error('お使いのブラウザでは位置情報がサポートされいません。');
        return;
      };

      navigator.geolocation.getCurrentPosition(async (position) =>{
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

        try {
          const response = await fetch(url);
          const data = await response.json();

          const iconCode = data.weather[0].icon;
          const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

          setWeather({
            date: new Date().toLocaleDateString(),
            city:data.name,
            iconUrl,
            description: data.weather[0].description,
            tempMax:Math.round(data.main.temp_max).toString(),
            tempMin: Math.round(data.main.temp_min).toString(),
          });

        }catch (error) {
          console.error('気象データを取得できません。', error);
        }
      });
    };

    fetchCurrentWeather();
  },[]);

  return (
    <div className='bg-gray-100 h-screen flex flex-col'>
      {/* サイト名 */}
      <header className='bg-white mt-4'>
        <h1 className='font-bold text-4xl text-gradient bg-gradient-to-r from-purple-400 via-blue-400 to-red-400 p-4'>Umbrella Forecast</h1>
      </header>

      <div className='flex flex-1 overflow-y-hidden'>
        {/* サイドバー */}
        <aside className='bg-gradient-to-b from-red-500 to-blue-500 w-1/4 p-4 text-white'>
          <h2 className='font-bold text-4xl mb-4'>メニュー</h2>
          <ul>
            {Object.entries(menuSidebar).map(([key, value]) =>(
              <li key={uuidv4()} className='mb-4 hover:text-blue-300 text-xl'>
                <span className='cursor-pointer' onClick={() =>handleMenuItemClick(value)}>{key}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* 現在の天気 */}
        <main className='flex-grow container mx-auto p-4'>
          <div className='bg-white shadow-lg rounded-lg p-6 my-4 text-center'>
            <h2 className='font-bold text-3xl mb-4'>現在地の天気予報</h2>
            {weather ? (
              <>
              <p className='mb-2 text-xl'>{weather.date}</p>
              <div className='flex justify-center'>
                <img src={weather.iconUrl} alt='Weather icon' className='w-20 h-20'/>
              </div>
              <h3 className='mb-2 text-2xl'>{weather.description}</h3>
              <p className='text-2xl'>最高気温：{weather.tempMax}℃</p>
              <p className='text-2xl'>最低気温：{weather.tempMin}℃</p>
              <p className='mt-4 text-xl'>{weather.city}</p>
              </>
            ):(
              <p>Loading...</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default currentWeather;
