'use client';
import React, { useState, useEffect } from 'react';
import { MenuMapping, ForecastItem, menuSidebar } from '../../../../Types/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faUmbrella, faCloud, faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'; 
import { auth, db, storage } from '@/app/firebase';
import { addDoc, arrayUnion, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import Modal from '@/Components/Posting_Modal';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';

type WeatherData  ={
  name:string;
  weather:[{main:string}];
  main:{temp:number};
  cod:number;
  cityName:string
};

type Post ={
  id:string;
  content:string;
  imageUrl:string;
  timestamp:string;
  username: string;
  userId:string;
};

interface UserProfile {
  username:string;
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
  /* 編集中の投稿ID */
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  /* 内容保持する */
  const [editingContent, setEditingContent] = useState<string>("");
  const [displayedCity, setDisplayedCity] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const [user] = useAuthState(auth);

  const fetchWeather = async () =>{
    if(!city) {
      setWeather(null);
      setError("");
      return;
    } 

    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

    try {
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if(geoData.length ===0 || geoData[0].country !=="JP") {
        setError('日本の都市のみ検索可能です。');
        return;
      }

      const {lat, lon} =geoData[0];
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`

      /* 天気予報を取得 */
      const response = await fetch(url);
      const data = await response.json();
      if(data.cod === 200) {
        setWeather({
          ...data,
          cityName: city // 都市名を追加
        });
        setDisplayedCity(city);
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
          const postData = docSnap.data().posts;
          const sortedPosts = postData.sort((a:Post, b:Post) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setPosts(sortedPosts || []);
        }else {
          setPosts([]);
        }
      } catch (error) {
        setError('投稿の読み込み中にエラーが発生しました。')
      }
    };

    const handleSearch = async (e:React.FocusEvent<HTMLFormElement>) =>{
      e.preventDefault();
      await fetchWeather();
      await loadPosts();
      setCity("");
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

    const handlePostFromModal = async (content: string, imageFile: File | null, city: string) => {
      const newPostId = uuidv4();

      /* 画像がある場合はアップロードしてURL取得 */
      let imageUrl = "";
      if(imageFile){
        const imageRef = ref(storage, `images/${newPostId}/${imageFile.name}`);
        try {
          const uploadResult = await uploadBytes(imageRef, imageFile);
          imageUrl = await getDownloadURL(uploadResult.ref);
        } catch (error) {
            console.error('画像のアップロード中にエラーが発生しました',error);
            return;
        };
      };

      /* 新しい投稿データを作成 */
      const newPostData = {
        id:newPostId,
        content,
        imageUrl,
        timestamp:new Date().toISOString(),
        username: userProfile?.username || "匿名" ,
        userId:user?.uid || "",
      };

      /* Firestoreに保存 */
      try {
       const postRef = doc(collection(db, 'posts'), city);
       const docSnap = await getDoc(postRef);

       if(docSnap.exists()) {
        await updateDoc(postRef, {
          posts:arrayUnion(newPostData)
        });
       }else {
        await setDoc(postRef, {
          posts:[newPostData]
        });
       }
        console.log("City:", city);
        setPosts(prevPosts =>[newPostData, ...prevPosts]);
      } catch (error) {
          console.error('投稿の保存中にエラーが発生しました',error);
          return;
      };
    };
    /* 投稿を削除する関数 */
    const handleDeletePost = async (postId:string) =>{
      try {
        const postRef = doc(db,"posts",city);
        const docSnap = await getDoc(postRef);

        if (docSnap.exists()) {
          const updatedPosts = docSnap.data().posts.filter((post: Post) => post.id !== postId);
          await updateDoc(postRef, { posts: updatedPosts });
    
          // 更新された投稿リストを時間順に並び替えて設定
          setPosts(updatedPosts.sort((a: Post, b: Post) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ));
        }
      } catch (error) {
          console.error('投稿削除中にエラーが発生しました',error);
      }
    };

    /* 編集を保存する関数 */
    const handleEdit = (post:Post) =>{
      setEditingPostId(post.id);
      setEditingContent(post.content);
    };

    /* 編集を保存 */
    const handleEditSave = async (postId: string) => {
      if (!editingContent) return;
    
      try {
        const postRef = doc(db, 'posts', city);
        const docSnap = await getDoc(postRef);
    
        if(docSnap.exists() && editingPostId) {
          const updatedPosts = docSnap.data().posts.map((post: Post) => {
            if (post.id === editingPostId) {
              return { 
                ...post, 
                content: editingContent, 
                timestamp: new Date().toISOString() 
              };
            }
            return post;
          });
    
          await updateDoc(postRef, {posts: updatedPosts});

          setPosts(prevPosts => [
            updatedPosts.find((p: Post) => p.id === editingPostId),
            ...prevPosts.filter((p: Post) => p.id !== editingPostId)
          ]);
          setEditingPostId(null);
          setEditingContent("");
        }
      } catch (error) {
        console.error('投稿の編集中にエラーが発生しました。', error);
      }
    };

    useEffect(() => {
      const fetchUserProfile = async () => {
        if (user) {
          try {
            const userRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
            } else {
              // ユーザープロフィールが存在しない場合の処理（必要に応じて）
              console.log("ユーザープロフィールが存在しません。");
            }
          } catch (error) {
            console.error("ユーザープロフィールの取得中にエラーが発生しました。", error);
          }
        }
      };
    
      fetchUserProfile();
    }, [user]);
    
    

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
          {/* 天気情報表示 */}
          {weather && (
            <div className='border border-gray-300 bg-white p-4 rounded-lg shadow-md mx-auto text-center w-2/5'>
              <p>{displayedCity}の天気: {weather.weather[0].main}</p>
              <p>気温: {weather.main.temp.toFixed(0)}°C</p>
              <p>天気アイコン:{weatherIcons[weather.weather[0].main]}</p>
            </div>
          )}
            {/* 投稿ボタンとモーダルウィンドウ */}
            <div className='flex justify-center mt-4'>
              <button 
                className={`bg-purple-500 text-white px-4 py-2 rounded w-1/5 ${!weather ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={openModal}
                disabled={!weather}
                >
                  投稿
              </button>
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} onPost={handlePostFromModal} city={city}/>

            {error && (
              <div className='
                bg-red-100 border border-red-400 
                text-red-700 
                px-4 py-3 rounded relative
                '>
                  {error}
              </div>
            )}

          {/* 投稿リスト表示 */}
          <div className='mt-4'>
          {posts.map(post => (
            <div key={post.id} className='border border-gray-300 bg-white p-4 rounded-lg shadow-md mx-auto text-center mb-4'>
              {editingPostId === post.id ? (
                // 編集モード
                <div>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className='w-full p-2 border border-gray-300 rounded'
                  />
                  <button onClick={() => handleEditSave(post.id)} className='bg-green-500 text-white px-4 py-2 rounded mr-2'>Save</button>
                  <button onClick={() => setEditingPostId(null)} className='bg-gray-500 text-white px-4 py-2 rounded'>Cancel</button>
                </div>
              ) : (
                // 通常表示モード
                <div>
                  <p>投稿者: {post.username}</p>
                  <p>{post.content}</p>
                  {post.imageUrl && <img src={post.imageUrl} alt='Post' className='max-w-xs mx-auto'/>}
                  <p className='text-gray-500 text-sm'>
                    {new Date(post.timestamp).toLocaleDateString('ja-JP')} {new Date(post.timestamp).toLocaleTimeString('ja-JP', {hour:'2-digit', minute:'2-digit'})}
                  </p>
                  {user?.uid === post.userId && (
                    <div>
                      <button onClick={() => handleEdit(post)} className='bg-blue-500 text-white px-4 py-2 rounded mr-2'>Edit</button>
                      <button onClick={() => handleDeletePost(post.id)} className='bg-red-500 text-white px-4 py-2 rounded'>Delete</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default posting;
