"use client";
import React, { useState } from 'react';
import { menuSidebar, Weather} from '../../../../Types/types';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud, faSnowflake, faSun, faUmbrella } from '@fortawesome/free-solid-svg-icons';
import Modal from '@/Components/Posting_Modal';
import { collection, doc, getDoc } from 'firebase/firestore';
import { auth, db, storage } from '@/app/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';


type WeatherData = {
  name:string;
  weather: [{main: string}];
  main: {temp:number};
  cod:number;
  cityName:string
};

type Post = {
  id:number;
  content:string;
  imageUrl:string;
  timestamp:string;
  username:string;
  userId:string;
};

type UserProfile = {
  username:string
};

const weatherIcons:{[ key: string]: JSX.Element} ={
  Clear:<FontAwesomeIcon icon={faSun} className='text-yellow-500' />,
  Rain:<FontAwesomeIcon icon={faUmbrella} className='text-blue-700' />,
  Cloud:<FontAwesomeIcon icon={faCloud} className='text-gray-400' />,
  Snow:<FontAwesomeIcon icon={faSnowflake} className='text-blue-300'/>
};

const posting:React.FC = () => {
  const [city, setCity] =useState<string>("");
    /* 現在の天気情報を保持する状態 */
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] =useState<string>("");
  const [displayCity, setDisplayCity] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  /* 特定の都市に関連する投稿のリストを保持 */
  const [posts, setPosts] = useState<Post[]>([]);
   /* フォームに入力する新しい投稿の内容を保持 */
  const [newPost, setNewPost] =useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile |null>(null);
  const router = useRouter();
  const [user] = useAuthState(auth);

  const fetchWeather = async() =>{
    /* city が空の場合、 何も行わずに関数を終了します*/
    if(!city){
      setWeather(null);
      setError("");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

    try {
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if(geoData.length === 0 || geoData[0].country !== "JP"){
        setError("日本の都市のみ検索可能です");
        return;
      }

      const {lat, lon} =geoData[0];
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

      /* 天気情報を取得 */
      const response = await fetch(url);
      const data = await response.json();
      if(data.cod === 200) {
        setWeather({
          ...data,
          cityName:city,
        });
        setDisplayCity(city);
        setError("");
      }else{
        setError("天気情報の取得に失敗しました。")
      }
    }catch(error) {
      setError("天気情報の取得中にエラーが発生しました。");
    }
  };

  const loadPosts = async() =>{
    if(!city) return;
    try{
      const postRef = doc(collection(db,"posts"),city);
      const docSnap = await getDoc(postRef);
      if(docSnap.exists()){
        const postData = docSnap.data().posts;
        /* 新しい日付を持つ投稿がリストの前に来ます。 */
        const sortedPosts = postData.sort((a:Post, b:Post) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setPosts(sortedPosts || []);
      }else{
        setPosts([]);
      }
    }catch(error) {
      setError("投稿の読み込み中にエラーが発生しました。");
    }
  };

  const handleSearch = async(e:React.FocusEvent<HTMLFormElement>) =>{
    e.preventDefault();
    await fetchWeather();
    await loadPosts();
    setCity("");
  };

  const handleMenuItemClick = (url:string) =>{
    router.push(url);
  };

  const openModal =() =>{
    setIsModalOpen(true);
  };

  const closeModal = () =>{
    setIsModalOpen(false);
    setNewPost("");
    setImage(null);
  };

  const handlePostFromModal = async(content: string, imageFile: File | null) =>{
    const newPostId = uuidv4();
    let imageUrl = "";
    if(imageFile){
      const imageRef = ref(storage, `images/${newPostId}/${imageFile.name}`);
      try {
        const uploadResult = await uploadBytes(imageRef, imageFile);
        imageUrl= await getDownloadURL(uploadResult.ref);
      }catch(error) {
        console.error("画像のアップロード中にエラーが発生しました。",error);
        return;
      }
    }
    /* 新しい投稿データを作成 */
    const newPostData = {
      id:newPostId,
      content,
      imageFile,
      timestamp: new Date().toISOString,
      username: userProfile?.username || "匿名" ,
      userId:user?.uid || "",
    };

    /* Firestoreに保存 */
  };


  return (
    <div className='bg-gray-100 h-screen flex flex-col'>
      {/* サイト名 */}
      <header className='bg-white mt-4'>
        <h1 className='
          font-bold text-4xl text-gradient
          bg-gradient-to-r from-purple-400 via-blue-400 to-red-400 p-4
        '>Umbrella Forecast
        </h1>
      </header>

      {/* メインコンテンツとサイドバーのコンテナ */}
      <div className='flex flex-1 overflow-hidden'>
        {/* サイドバー */}
        <aside className='bg-gradient-to-b from-red-500 to-blue-600 w-1/4 p-4 text-white'>
          <h2 className='font-bold text-4xl mb-4'>メニュー</h2>
          <ul>
            {Object.entries(menuSidebar).map(([key, value]) =>(
              <li key={uuidv4()} className='mb-4 hover:text-blue-300 text-xl'>
                <span className='cursor-pointer'onClick={() =>handleMenuItemClick(value)}>{key}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* メインコンテンツ */}
        <main className='flex-grow container mx-auto p-4 overflow-y-auto'>
          <h2 className='font-bold text-2xl text-center my-4'>現在の天気・SNS</h2>
          <form className='mb-4 flex' onSubmit={handleSearch}>
            <input 
              type='text'
              className='
                p-2 border border-r-gray-300 rounded
                flex-grow focus:outline-none focus:ring-2 focus:ring-gray-200'
              placeholder='都市名を入力 (例)横浜市、福岡市...'
              value={city}
              onChange={e => setCity(e.target.value)}
              />
            <button type='submit' className='ml-2 p-2 bg-orange-500 text-white rounded'>検索</button>
          </form>

          {/* 天気情報 */}
          {weather && (
            <div className='border border-gray-300 bg-white p-4 rounded-lg shadow-md mx-auto text-center w-2/5'>
              <p>{displayCity}の天気:{weather.weather[0].main}</p>
              <p>気温:{weather.main.temp.toFixed()}℃</p>
              <p>アイコン:{weatherIcons[weather.weather[0].main]}</p>
            </div>
           )} 
          {/* 投稿ボタンとモーダルウィンドウ */}
          <div className='flex justify-center mt-4'>
            <button 
              className={`bg-purple-500 text-white px-4 py-2 rounded w-1/5 ${!weather ? 'opacity-50 cursor-not-allowed' : ""}`}
              onClick={openModal}
              disabled={!weather}
              >
              投稿
            </button>
          </div>
          <Modal isOpen={isModalOpen} onClose={closeModal}/>

          {/* エラー表示 */}
          {error && (
            <div className='
              bg-red-100 border border-red-400
              text-red-700
              px-4 py-3 round relative
            '>
              {error}
            </div>
          )}

          {/* 投稿リスト表示 */}

        </main>
      </div>
    </div>
  );
};

export default posting;
