"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { v4 as uuidv4 } from 'uuid';
import { MenuMapping, ForecastItem, menuSidebar } from '../../../../Types/types';
import { cityState, errorState, inputCityState } from '../../../../Atoms/state';
import { useRecoilState } from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faUmbrella, faCloud, faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { hourlyForecastState } from '../../../../Atoms/state';


/* typescriptの定義、及びrecoil設定完了済み */

const weatherIcons: { [key: string]: JSX.Element } = {
  Clear: <FontAwesomeIcon icon={faSun} className='text-yellow-500' />,
  Rain: <FontAwesomeIcon icon={faUmbrella} className='text-blue-700' />,
  Clouds: <FontAwesomeIcon icon={faCloud} className='text-gray-400' />,
  Snow: <FontAwesomeIcon icon={faSnowflake} className='text-blue-300' />
};

const hourlyForecast: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [hourlyForecast, setHourlyForecast] = useState<ForecastItem[]>([]);
  const [inputCity, setInputCity] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleMenuItemClick = (url: string) => {
    router.push(url);
  };

  const fetchWeather = async (cityName: string) => {
    setError(''); // 前回のエラーメッセージをクリア
    setHourlyForecast([]); // 前回の天気予報をクリア
    setCity(''); // 前回の都市名をクリア
    try {
      const geocodingApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`;
      const geoResponse = await fetch(geocodingApiUrl);
      const geoData = await geoResponse.json();
  
      if (!geoData || geoData.length === 0 || geoData[0].country !== 'JP') {
        setError('日本の都市のみ検索可能です。');
        return;
      }
  
      const { lat, lon } = geoData[0];
      const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`;
      const weatherResponse = await fetch(weatherApiUrl);
      const weatherData = await weatherResponse.json();
  
      if (!weatherData || weatherData.cod !== '200') {
        setError('気象データの取得中にエラーが発生しました');
        return;
      }
  
      setHourlyForecast(weatherData.list.slice(0, 16)); // Set the forecast for the next 2 days
      setCity(cityName); // 正常に天気データを取得したら都市名をセット
    } catch (error) {
      setError('気象データの取得中にエラーが発生しました');
    }
  };

  const handleSearch = async () => {
    if (!inputCity) return; // 入力された都市名がない場合は何もしません
    await fetchWeather(inputCity); // 入力された都市名で天気をフェッチ
    setCity(inputCity); // 検索が完了したら都市名を設定
    setInputCity("");//表示したらinputクリア
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearch();
  };

  // 日付が変わるたびに段落を分けるために使用するヘルパー関数
  const isNewDay = (index: number) => {
    if (index === 0) return true; // Always start a new day for the first item
    const currentDate = new Date(hourlyForecast[index].dt * 1000).toDateString();
    const prevDate = new Date(hourlyForecast[index - 1].dt * 1000).toDateString();
    return currentDate !== prevDate; // If the date has changed, return true
  };

  return (
    <div className='bg-gray-100 h-screen flex flex-col'>
      {/* サイト名 */}
      <header className='bg-white mt-4'>
        <h1 className='font-bold text-4xl text-gradient bg-gradient-to-r from-purple-400 via-blue-400 to-red-400 p-4'>Umbrella Forecast</h1>
      </header>
  
      <div className='flex flex-1 overflow-hidden'>
        {/* サイドバー */}
        <aside className='bg-gradient-to-b from-red-500 to-blue-600 w-1/4 p-4 text-white'>
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
          <h2 className="text-2xl font-bold text-center my-4">3時間毎の天気</h2>
          <form onSubmit={handleSubmit} className="mb-4 flex">
            <input
              type="text"
              value={inputCity}
              onChange={(event) => setInputCity(event.target.value)}
              placeholder="都市名を入力 (例)横浜市、福岡市..."
              className="p-2 border border-gray-300 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <button type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded">
              検索
            </button>
          </form>
  
          {/* エラーメッセージを表示 */}
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}


          {/* 検索された都市名があれば予報を表示 */}
          {city && hourlyForecast.length > 0 && (
            
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              <h3 className="text-xl font-semibold my-4 ml-2">{city}</h3>
              {hourlyForecast.map((item, index) => {
                const date = new Date(item.dt * 1000);
                const timeString = date.toLocaleTimeString('ja-JP', {hour: "2-digit", minute: "2-digit"})
                const iconKey = item.weather[0].main;
                const icon = weatherIcons[iconKey] || null;
  
                return (
                  <React.Fragment key={uuidv4()}>
                    {isNewDay(index) && <div className="col-span-full border-t-2 my-4"></div>}
                    <div className="bg-white border border-gray-200 rounded shadow p-4">
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{date.toLocaleDateString()} {timeString}</span>
                        <div className="flex flex-row items-center mt-2">
                          {icon}
                          <span className="ml-2">{item.weather[0].main}</span>
                        </div>
                        <span className="text-sm mt-2">{item.main.temp.toFixed(0)}°C</span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default hourlyForecast;