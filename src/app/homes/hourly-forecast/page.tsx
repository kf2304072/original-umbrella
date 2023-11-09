"use client";
import { faCloud, faSnowflake, faSun, faUmbrella } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

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
  '投稿':'/homes/post',
  'お気に入りの地域': '/homes/favorite-locations',
  'プロフィール':'/homes/profile',
  'ログアウト': '/homes/logout'
};

const weatherIcons: {[key:string] : JSX.Element} = {
  Clear:<FontAwesomeIcon icon={faSun} className='text-yellow-400'/>,
  Rain:<FontAwesomeIcon icon={faUmbrella} className='text-blue-700'/>,
  Clouds:<FontAwesomeIcon icon={faCloud} className='text-gray-400'/>,
  Snow:<FontAwesomeIcon icon={faSnowflake} className='text-blue-300'/>
};

interface weather {
  main:string;
  icon:string
};

interface ForecastItem {
  dt:number;
  main:{
    temp:number;
  };
  weather:weather[]
};

const hourlyForecast:React.FC = () => {
  const [city, setCity] =useState<string>("");//取得した都市の名前保存
  const [forecast, setForecast] =useState<string>("");//天気予報のデータ保存
  const [inputCity, setInputCity] =useState<string>("");//検索バーに入力すると保存
  const [error, setError] =useState<string>("");//エラーを保存

  const router = useRouter();

  const handleMenuItemClick = (url:string) =>{
    router.push(url);
  };

  const fetchWeather = async(cityName:string) => {
    setError("");
    setForecast("");
    setCity("");
    try{
      const geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`;
      const geoResponse = await fetch(geocodingUrl);
      const geoData = await geoResponse.json();

      if(!geoData || geoData.length === 0 || geoData[0].country !== 'JP'){
        setError('日本の都市のみ検索可能です。');
        return;
      };

      const {lat, lon} = geoData[0];
      const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();

      if(!weatherData || weatherData.cod !== '200'){
        setError('気象データの取得中にエラーが発生しました。');
        return;
      };

    } catch(error) {

    };
  };

  return (
    <div className='bg-gray-100 h-screen flex flex-col'>
      {/* サイト名 */}
      <header  className='mt-4 ba-white'>
        <h1 className='font-bold text-4xl text-gradient bg-gradient-to-r from-purple-400 via-blue-400 to-red-400 p-4'>Umbrella Forecast</h1>
      </header>

      <div className='flex flex-1 overflow-hidden'>
        {/* サイドバー */}
        <aside className='bg-gradient-to-b from-red-500 to-blue-600 text-white w-1/4 p-4'>
          <h2 className='font-bold text-4xl mb-4'>メニュー</h2>
          <ul>
            {Object.entries(menuSidebar).map(([key, value]) =>(
              <li key={uuidv4()} className='mb-4 hover:text-blue-300 text-xl'>
                <span className='cursor-pointer' onClick={() =>handleMenuItemClick(value)}>{key}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* メインコンテンツエリア */}
        <div className='flex-grow container mx-auto p-4 overflow-y-auto'> 
          <form className='mb-4 flex'>
            <input 
              type='text'
              placeholder='都市名を入力してください。 (例)横浜市、新宿区 ...'
              className='p-2 border border-gray-300 rounded flex-grow'
            />
            <button type='submit' className='bg-blue-400 text-white p-2 ml-2 rounded'>検索</button>
          </form>

          {/* 検索されて都市名があれば予報を表示 */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div className='bg-white border border-gray-200 rounded shadow p-4'>
              <div className='flex flex-col items-center'>
                <span className='font-bold'>2023/11/30</span>
                <div className='flex flex-row items-center mt-2'>ここにicon表示
                  <span className='ml-2'>快晴</span>
                </div>
                <span className='mt-2 text-sm'>22℃</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default hourlyForecast;
