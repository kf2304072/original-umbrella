"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { MenuMapping, ForecastItem, menuSidebar } from '../../../../Types/types';
import { cityState, errorState, inputCityState } from '../../../../Atoms/state';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faUmbrella, faCloud, faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { dailyForecastState } from '../../../../Atoms/state'; 

const weatherIcons: { [key: string]: JSX.Element } = {
  Clear: <FontAwesomeIcon icon={faSun} className='text-yellow-500' />,
  Rain: <FontAwesomeIcon icon={faUmbrella} className='text-blue-700' />,
  Clouds: <FontAwesomeIcon icon={faCloud} className='text-gray-400' />,
  Snow: <FontAwesomeIcon icon={faSnowflake} className='text-blue-300' />
};

const FiveDayForecast: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [dailyForecast, setDailyForecast] = useState<ForecastItem[]>([]);
  const [inputCity, setInputCity] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleMenuItemClick = (url: string) =>{
    router.push(url);
  };

  const filterDailyForecaset = (list: ForecastItem[]) => {
    const dailyForecast: ForecastItem[] = [];
    const dates: string[] = [];
  
    for (const item of list) {
      const date = new Date(item.dt * 1000);
      const dateString = `${date.getMonth() + 1}/${date.getDate()}`;
  
      if (!dates.includes(dateString)) {
        dates.push(dateString);
        dailyForecast.push(item);
      }
  
      if (dailyForecast.length >= 5) {
        break;
      }
    }
  
    return dailyForecast;
  };

  const fetchWeather = async (cityName:string) =>{
    setError("");
    setDailyForecast([]);
    setCity("");

    try {
      const geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`;
      const geoResponse = await fetch(geocodingUrl);
      const geoData = await geoResponse.json();

      if(!geoData || geoData.length === 0 || geoData[0].country !== "JP"){
        setError('日本の都市のみ検索可能です。');
        return;
      };

      const {lat, lon} = geoData[0];
      const weatherUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();

      if(weatherData && weatherData.cod === "200"){
        const dailyForecast= filterDailyForecaset(weatherData.list);
        setDailyForecast(dailyForecast);
        setCity(cityName);
      }else{
        setError('気象データの取得中にエラーが発生しました');
      }
    }catch (error){
      setError('気象データの取得中にエラーが発生しました');
    };
  };

  const handleSearch = async () =>{
    if(!inputCity) return;
    await fetchWeather(inputCity);
    setInputCity("");
  };

  const handleSubmit = (event:React.FormEvent<HTMLFormElement>) =>{
    event.preventDefault();
    handleSearch();
  };

  return (
    <div className='bg-gray-100 h-screen flex flex-col'>
      {/* サイト名 */}
      <header className='bg-white mt-4'>
        <h1 className='font-bold text-4xl text-gradient bg-gradient-to-r from-purple-400 via-blue-400 to-red-400 p-4'>Umbrella Forecast</h1>
      </header>
      {/* メインコンテンツとサイドバーのコンテナ */}

      <div className='flex flex-1 overflow-hidden'>
        {/* サイドバー */}
        <aside className='bg-gradient-to-b from-red-500 to-blue-600 w-1/4 p-4 text-white'>
          <h2 className='font-bold mb-4 text-4xl'>メニュー</h2>
          <ul>
            {Object.entries(menuSidebar).map(([key, value]) =>(
              <li key={uuidv4()} className='mb-4 hover:text-blue-300 text-xl'>
                <span className='cursor-pointer' onClick={() =>handleMenuItemClick(value)}>{key}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/*メインコンテンツエリア  */}
        <main className='flex-grow container mx-auto p-4 overflow-y-auto'>
          <h2 className='font-bold text-2xl text-center my-4'>5日間の天気予報</h2>
          <form onSubmit={handleSubmit} className='mb-4 flex'>
            <input 
              value={inputCity}
              onChange={e => setInputCity(e.target.value)}
              type='text'
              placeholder='都市名を入力 (例)横浜市、福岡市...'
              className='p-2 border border-gray-300 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-gray-200'
            />
            <button type='submit' className='ml-2 p-2 bg-emerald-500 text-white rounded'>検索</button>
          </form>

          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'>{error}</div>
          )}

          {/* 検索された都市と5日間の予報を表示 */}
          {city && dailyForecast.length > 0 && (
            <div className='flex flex-col items-center'>
              <h3 className='my-4 font-semibold text-xl'>{city}</h3>
              {dailyForecast.map((item, index) => {
                const date = new Date(item.dt * 1000);
                const iconKey = item.weather[0].main;
                const icon = weatherIcons[iconKey] || <FontAwesomeIcon icon={faCloud} className='text-gray-400' />;

                return(
                  <div key={uuidv4()} className='bg-white border border-gray-200 rounded shadow p-4 my-2 w-full max-w-md mx-auto'>
                    <div className='flex flex-col items-center'>
                      <span className='font-bold text-lg'>{date.toLocaleDateString('ja-JP')}</span>
                      <div className='flex items-center mt-2'>
                        {icon}
                        <span className='ml-2 text-lg'>{item.weather[0].main}</span>
                      </div>
                      <span className='text-sm mt-2'>{item.main.temp.toFixed(0)}℃</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FiveDayForecast;

