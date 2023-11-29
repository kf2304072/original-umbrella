"use client";
import React, { useState, useEffect } from 'react';
import { MenuMapping, ForecastItem, menuSidebar, WeatherData } from "../../../../Types/types";
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faUmbrella, faCloud, faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

const weatherIcons: { [key: string]: JSX.Element } = {
  Clear: <FontAwesomeIcon icon={faSun} className='text-yellow-500' />,
  Rain: <FontAwesomeIcon icon={faUmbrella} className='text-blue-700' />,
  Clouds: <FontAwesomeIcon icon={faCloud} className='text-gray-400' />,
  Snow: <FontAwesomeIcon icon={faSnowflake} className='text-blue-300' />
};

const FavoriteLocations: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [dailyForecast, setDailyForecast] = useState<ForecastItem[]>([]);
  const [searchCity, setSearchCity] = useState<string>("");
  const [error, setError] = useState<string>('');
  const [hourlyForecast, setHourlyForecast] = useState<ForecastItem[]>([]);
  const [isSearchTriggered, setIsSearchTriggered] = useState<boolean>(false);
  const [favoriteCities, setFavoriteCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const router = useRouter();

  const handleMenuItemClick = (url: string) => {
    router.push(url);
  };

  const filterDailyForecast = (list: ForecastItem[]) => {
    const filteredForecast: ForecastItem[] = [];
    const dates: string[] = [];

    for (const item of list) {
      const date = new Date(item.dt * 1000);
      const dateString = `${date.getMonth() + 1}/${date.getDate()}`;

      if (!dates.includes(dateString)) {
        dates.push(dateString);
        filteredForecast.push(item);
      }

      if (filteredForecast.length >= 5) {
        break;
      }
    }

    return filteredForecast;
  };

  const handleSearch = async () => {
    setIsSearchTriggered(true);
    if (!searchCity) {
      return;
    }
    setError("");
    setDailyForecast([]);
  
    const geocodingApiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    const geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${searchCity}&limit=1&appid=${geocodingApiKey}`;
  
    try {
      const geocodingResponse = await fetch(geocodingUrl);
      const geocodingData = await geocodingResponse.json();
  
      if (geocodingData.length === 0 || geocodingData[0].country !== 'JP') {
        setError('日本の都市名を入力してください。');
        return;
      }
  
      const { lat, lon } = geocodingData[0];
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${geocodingApiKey}&units=metric&lang=ja`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${geocodingApiKey}&units=metric&lang=ja`;
  
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();
      const iconCode = weatherData.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
  
      setWeather({
        date: new Date().toLocaleDateString(),
        city: weatherData.name,
        iconUrl,
        description: weatherData.weather[0].description,
        tempMax: Math.round(weatherData.main.temp_max).toString(),
        tempMin: Math.round(weatherData.main.temp_min).toString(),
      });
  
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();
  
      setDailyForecast(filterDailyForecast(forecastData.list));
      setHourlyForecast(forecastData.list.slice(0, 16));
      setCity(searchCity); 
    } catch (error) {
      console.error('エラーが発生しました。', error);
    }
    setSearchCity("");
  };
  

  useEffect(() => {

    
    const fetchCurrentWeather = async () => {
      if (!navigator.geolocation) {
        console.error('お使いのブラウザでは位置情報がサポートされていません。');
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=ja`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          const iconCode = data.weather[0].icon;
          const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

          setWeather({
            date: new Date().toLocaleDateString(),
            city: data.name,
            iconUrl,
            description: data.weather[0].description,
            tempMax: Math.round(data.main.temp_max).toString(),
            tempMin: Math.round(data.main.temp_min).toString(),
          });
          setCity(data.name);
        } catch (error) {
          console.error('気象データを取得できませんでした。', error);
        }
      });
    };

    fetchCurrentWeather();
  }, []);

  const addCityToFavorites = () => {
    if (favoriteCities.length >= 3) {
      setError("お気に入りには最大3つまでの都市を登録できます。");
    } else if (city && !favoriteCities.includes(city)) {
      setFavoriteCities(prevCities => [...prevCities, city]);
    }
  };

  useEffect(() => {
    // お気に入り都市が選択された時に、その都市の天気予報を取得する
    const fetchWeatherForSelectedCity = async () => {
      if (!selectedCity) return;
  
      const geocodingApiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      const geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${selectedCity}&limit=1&appid=${geocodingApiKey}`;
  
      try {
        const geocodingResponse = await fetch(geocodingUrl);
        const geocodingData = await geocodingResponse.json();
        if (geocodingData.length === 0) return;
  
        const { lat, lon } = geocodingData[0];
        const apiUrlBase = `https://api.openweathermap.org/data/2.5/`;
        const weatherUrl = `${apiUrlBase}weather?lat=${lat}&lon=${lon}&appid=${geocodingApiKey}&units=metric&lang=ja`;
        const forecastUrl = `${apiUrlBase}forecast?lat=${lat}&lon=${lon}&appid=${geocodingApiKey}&units=metric&lang=ja`;
  
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
  
        setWeather({
          date: new Date().toLocaleDateString(),
          city: weatherData.name,
          iconUrl: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`,
          description: weatherData.weather[0].description,
          tempMax: Math.round(weatherData.main.temp_max).toString(),
          tempMin: Math.round(weatherData.main.temp_min).toString(),
        });
        setCity(selectedCity);
  
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
  
        setDailyForecast(filterDailyForecast(forecastData.list));
        setHourlyForecast(forecastData.list.slice(0, 16));
      } catch (error) {
        console.error('エラーが発生しました。', error);
      }
    };
  
    fetchWeatherForSelectedCity();
  }, [selectedCity]);
  
  



  // 日付が変わるたびに新しい段落を開始するか判断するヘルパー関数
  const isNewDay = (index: number) => {
    if (index === 0) return true; // 最初のアイテムでは必ず新しい日を開始
    const currentDate = new Date(hourlyForecast[index].dt * 1000).toDateString();
    const prevDate = new Date(hourlyForecast[index - 1].dt * 1000).toDateString();
    return currentDate !== prevDate; // 日付が変わったらtrueを返す
  };

  return (
    <div className='bg-gray-100 h-screen flex flex-col'>
      <header className='bg-white mt-4'>
        <h1 className='font-bold text-4xl text-gradient bg-gradient-to-r from-purple-400 via-blue-400 to-red-400 p-4'>Umbrella Forecast</h1>
      </header>
  
      <div className='flex flex-1 overflow-y-hidden'>
        <aside className='bg-gradient-to-b from-red-500 to-blue-500 w-1/4 p-4 text-white'>
          <h2 className='font-bold text-4xl mb-4'>メニュー</h2>
          <ul>
            {Object.entries(menuSidebar).map(([key, value]) => (
              <li key={uuidv4()} className='mb-4 hover:text-blue-300 text-xl'>
                <span className='cursor-pointer' onClick={() => handleMenuItemClick(value)}>{key}</span>
              </li>
            ))}
          </ul>
        </aside>
  
        <main className='flex-grow container mx-auto p-4 overflow-y-auto'>
          <div className='bg-white shadow-lg rounded-lg p-6 my-4 text-center'>
            <h2 className='font-bold text-3xl mb-4'>お気に入りの地域</h2>
  
            <form className='mb-4 flex' onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <input
                type='text'
                placeholder='日本の都市名を入力 (例)東京、大阪...'
                className='p-2 border border-gray-300 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-gray-200'
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
              <button type='submit' className='ml-2 p-2 bg-emerald-500 text-white rounded'>検索</button>
            </form>

                    {/* お気に入りの地域選択 */}
            <button onClick={addCityToFavorites} className='p-2 bg-blue-500 text-white rounded'>お気に入りに追加</button>

                    {/* プルダウンメニュー */}
            <select className='ml-5' value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
              <option value="">都市を選択</option>
              {favoriteCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
  
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-start" role="alert">{error}</div>}
  
            {isSearchTriggered && (
              <>
                {weather && (
                  <div className='text-center'>
                    <p className='mb-2 text-xl'>{weather.date}</p>
                    <img src={weather.iconUrl} alt='Weather icon' className='w-20 h-20 mx-auto' />
                    <h3 className='mb-2 text-2xl'>{weather.description}</h3>
                    <p className='text-2xl'>最高気温：{weather.tempMax}℃</p>
                    <p className='text-2xl'>最低気温：{weather.tempMin}℃</p>
                    <p className='mt-4 text-xl'>{city}</p>
                  </div>
                )}
  
                {dailyForecast.length > 0 && (
                  <div className="my-4">
                    <h2 className="text-xl font-bold">5日間の天気予報</h2>

                    {dailyForecast.map((forecast) => {
                      const date = new Date(forecast.dt * 1000);
                      const iconKey = forecast.weather[0].main;
                      const icon = weatherIcons[iconKey] || <FontAwesomeIcon icon={faCloud} className='text-gray-400' />;
  
                      return (
                        <div key={uuidv4()} className='bg-white border border-gray-200 rounded shadow p-4 my-2'>
                          <span className='font-bold'>{date.toLocaleDateString('ja-JP')}</span>
                          <div className='flex items-center justify-center'>
                            {icon}
                            <span className='ml-2'>{forecast.weather[0].main}</span>
                          </div>
                          <span>{forecast.main.temp.toFixed(0)}℃</span>
                        </div>
                      );
                    })}
                  </div>
                )}
  
               {hourlyForecast.length > 0 && (
                <div className="my-4">
                  <h2 className="text-xl font-bold">3時間毎の天気予報</h2>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {hourlyForecast.map((forecast, index) => {
                      const date = new Date(forecast.dt * 1000);
                      const fullDateTimeString = date.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                      const iconKey = forecast.weather[0].main;
                      const icon = weatherIcons[iconKey] || <FontAwesomeIcon icon={faCloud} className='text-gray-400' />;
                      const isDayChanged = isNewDay(index);

                      return (
                        <React.Fragment key={uuidv4()}>
                          {isDayChanged && <div className="col-span-full border-t-2 my-4"></div>}
                          <div className="bg-white border border-gray-200 rounded shadow p-4">
                            <div className="flex flex-col items-center">
                              <span className="font-bold">{fullDateTimeString}</span>
                              <div className="flex items-center justify-center mt-2">
                                {icon}
                                <span className="ml-2">{forecast.weather[0].main}</span>
                              </div>
                              <span className="text-sm">{forecast.main.temp.toFixed(0)}℃</span>
                            </div>
                          </div>
                        </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
  
};

export default FavoriteLocations;


