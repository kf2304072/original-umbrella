'use client';
import React, { useState, useEffect } from 'react';
import { MenuMapping, ForecastItem, menuSidebar } from '../../../../Types/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faUmbrella, faCloud, faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'; 
import { db } from '@/app/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import Modal from '@/Components/Posting_Modal';

interface WeatherData {
  name:string;
  weather:[{main:string}];
  main:{temp:number};
  cod:number;
};

interface Post {
  id:string;
  content:string;
  imageUrl:string;
  timestamp:string;
};

const weatherIcons: { [key: string]: JSX.Element } = {
  Clear: <FontAwesomeIcon icon={faSun} className='text-yellow-500' />,
  Rain: <FontAwesomeIcon icon={faUmbrella} className='text-blue-700' />,
  Clouds: <FontAwesomeIcon icon={faCloud} className='text-gray-400' />,
  Snow: <FontAwesomeIcon icon={faSnowflake} className='text-blue-300' />
};

const posting:React.FC = () => {

  const [city, setCity] = useState<string>("");
  /* 現在の天気情報を保持する状態 */
  const [weather, setWeather] = useState<WeatherData | null>(null);
  /* 特定の都市に関連する投稿のリストを保持 */
  const [posts, setPosts] =useState<Post[]>([]);
  /* ユーザーがフォームに入力する新しい投稿の内容を保持 */
  const [newPost, setNewPost] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const fetchWeather = async () =>{
    if(!city) {
      setWeather(null);
      setError("");
      return;
    } 

    const geoApiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${geoApiKey}`;

    try {
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if(geoData.length ===0 || geoData[0].country !=="JP") {
        setError('日本の都市のみ検索可能です。');
        return;
      }

      const {lat, lon} =geoData[0];
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`

      /* 天気予報を取得 */
      const response = await fetch(url);
      const data = await response.json();
      if(data.cod === 200) {
        setWeather(data);
        setError("");
      }else{
        setError('天気情報の取得に失敗しました。');
      }
    } catch (error) {
      setError('天気情報の取得中にエラーが発生しました。');
    }
  };

    const loadPosts = async () => {
      if(!city) return;
      try {
        const postRef = doc(collection(db, 'posts'), city);
        const docSnap = await getDoc(postRef);
        if(docSnap.exists()) {
          setPosts(docSnap.data().posts || []);
        }
      } catch (error) {
        setError('投稿の読み込み中にエラーが発生しました。')
      }
    };

    const handleSearch = async (e:React.FocusEvent<HTMLFormElement>) =>{
      e.preventDefault();
      await fetchWeather();
      await loadPosts();
    };

  const handleMenuItemClick = (url:string) => {
    router.push(url);
  };

  const openModal = () =>{
    setIsModalOpen(true);
  };

  const closeModal = () =>{
    setIsModalOpen(false);
    setNewPost("");
    setImage(null);
  };

  return (
    <div className='bg-gray-100 h-screen flex flex-col'>
      {/* サイト名 */}
      <header className='bg-white mt-4'>
        <h1 className='
          font-bold text-4xl 
          text-gradient bg-gradient-to-r from-purple-400 via-blue-400 to-red-400 
          p-4
          '>
            Umbrella Forecast
        </h1>
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

        {/* メインコンテンツエリア */}
        <main className='flex-grow container mx-auto p-4 overflow-y-auto'>
          <h2 className='font-bold text-2xl text-center my-4'>現在の天気・投稿</h2>
          <form className='mb-4 flex' onSubmit={handleSearch}>
            <input 
              type='text'
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder='都市名を入力 (例)横浜市、福岡市...'
              className='
                p-2 border border-gray-300 rounded
                flex-grow focus:outline-none focus:ring-2 focus:ring-gray-200'
            />
            <button type='submit' className='ml-2 p-2 bg-orange-500 text-white rounded'>検索</button>
          </form>

          {weather && (
            <div className='border border-gray-300 bg-white p-4 rounded-lg shadow-md mx-auto text-center w-2/5'>
              <p>{city}の天気:{weather.weather[0].main}</p>
              <p>気温: {weather.main.temp.toFixed(0)}°C</p>
              <p>天気アイコン:{weatherIcons[weather.weather[0].main]}</p>
            </div>
          )}

          {error && (
            <div className='
              bg-red-100 border border-red-400 
              text-red-700 
              px-4 py-3 rounded relative
              '>
                {error}
            </div>
          )}
          {/* 投稿ボタンとモーダルウィンドウ */}
          <button>投稿</button>
          <Modal isOpen={isModalOpen} onClose={closeModal}>

          </Modal>
        </main>
      </div>
    </div>
  );
};

export default posting;
