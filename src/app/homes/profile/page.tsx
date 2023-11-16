"use client";
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { menuSidebar, ProfileModalProps, UserProfile } from '../../../../Types/types';
import { useRouter } from 'next/navigation';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { auth, db } from '@/app/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const ProfileModal:React.FC<ProfileModalProps> = ({
  isOpen, profile, onSave, onClose
}) =>{
  /* ユーザーがプロファイル情報（例えば、名前や自己紹介文）を編集する際に使用 */
  const [editProfile, setEditProfile] = useState<UserProfile>(profile);

  useEffect(() =>{
    setEditProfile(profile);
  }, [profile]);

  const handleSave = () =>{
    onSave({...editProfile})
    onClose();
  };

  return isOpen ?  (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center'>
      <div className='bg-white p-6 w-2/5 rounded-lg'>
        <div className='mb-4'>
          <label htmlFor='username' className='block text-sm font-medium text-gray-700'>ユーザー名</label>
          <input 
            type='text'
            className='border p-2 w-2/3 rounded focus:outline-none focus:ring-2 focus:ring-gray-200'
            value={editProfile.username}
            onChange={e =>setEditProfile({...editProfile, username:e.target.value})}
          />
        </div>
        <div className='mb-6'> 
          <label htmlFor='introduction' className='block text-sm font-medium text-gray-700'>自己紹介文</label>
          <textarea
            className='border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-200 mt-6'
            rows={6}
            value={editProfile.selfIntroduction}
            onChange={e => setEditProfile({...editProfile, selfIntroduction: e.target.value})}
          />
        </div>
        <div className='flex justify-end mt-6'>
          <button 
            className='bg-blue-500 text-white px-4 py-2 rounded mr-2'
            onClick={handleSave}
            >Save
          </button>
          <button 
            className='bg-red-500 text-white px-4 py-2 rounded'
            onClick={onClose}
            >Close
          </button>
        </div>
      </div>
    </div>
  ): null;
};

const ProfilePage: React.FC = () => {
  /* ユーザー認証の状態を監視し、それに応じてUIを更新 */
  const [user, loading, error] = useAuthState(auth);
  /* 複数のユーザープロファイルを管理するために使用 */
  const [profiles, setProfiles] =useState<UserProfile[]>([]);
  /* 現在アクティブまたは選択されている特定のユーザープロファイルの情報を表示または編集する */
  const [currentProfile, setCurrentProfile] =useState<UserProfile | null>(null);
  /* モーダルウィンドウの表示状態を制御するために使用 */
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() =>{
    const fetchProfiles = async () =>{
      const querySnapshot = await getDocs(collection(db, "users"));
      const profileData = querySnapshot.docs.map(doc => ({
        id:doc.id,
        ...doc.data(),
      }) as UserProfile);
      setProfiles(profileData);

      if(user && !loading){
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if(docSnap.exists()) {
          setCurrentProfile({id: docSnap.id, ...docSnap.data()} as UserProfile);
        }else {
          const newProfile = {
            username: "新しいユーザー",
            selfIntroduction: "自己紹介文をこちらに記入してください。",
            imageUrl: "/icons/85340511.png",
          };
          await setDoc(userDocRef, newProfile);
          setCurrentProfile({id: user.uid, ...newProfile});
        }
      }
    };
    fetchProfiles();
  },[user, loading]);

  const handleMenuItemClick = (url:string) =>{
    router.push(url);
  };

  const handleEditClick = () =>{
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleProfileSave = async (updatePrifilel:UserProfile) =>{
    setCurrentProfile(updatePrifilel);

    try {
      const docRef = doc(db, "users", updatePrifilel.id);
      await setDoc(docRef, updatePrifilel,{merge: true});
    } catch (error) {
      console.error("更新中にエラーが発生しました。", error);
    }
  };

  /* データがまだロードされていない場合に読み込み中の状態を表示 */
  if(!currentProfile){
    return <div>Loading...</div>
  }

  return (
    <div className='bg-gray-100 h-screen flex flex-col'>
       {/* サイト名 */}
      <header className='mt-4 bg-white'>
        <h1 className='font-bold text-4xl text-gradient bg-gradient-to-r from-purple-400 via-blue-400 to-red-400 p-4'>Umbrella Forecast</h1>
      </header>

      {/* メインコンテンツとサイドバーのコンテナ */}
      <div className='flex flex-1 overflow-hidden'>
        <aside className='bg-gradient-to-b from-red-500 to-blue-600 w-1/4 p-4 text-white'>
          <h2 className='font-bold mb-4 text-4xl'>メニュー</h2>
          <ul>
            {Object.entries(menuSidebar).map(([key, value]) =>(
              <li key={uuidv4()} className='mb-4 hover:text-blue-300 text-xl'>
                <span className='cursor-pointer' onClick={() => handleMenuItemClick(value)}>{key}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/*プロフィール*/}
        <div className='flex-1 flex flex-col items-center'>
          <div className='mt-10 w-full max-w-md'>
            <h2 className='font-semibold text-3xl mb-4 text-center'>プロフィール</h2>
            <div className='flex flex-col items-center mt-52 bg-white shadow-lg rounded-lg p-4 w-full max-w-lg'>
              <div className='w-full'>
                <h3 className='font-semibold text-lg'>ユーザー名</h3>
                <p className='mb-2 text-xl border-b border-gray-300 pb-2'>{currentProfile.username}</p>
              </div>
              <div className='w-full'>
                <h3  className='font-semibold text-lg'>自己紹介文</h3>
                <p className='mb-4 text-lg border-b border-gray-300 pb-2'>{currentProfile.selfIntroduction}</p>
              </div>
              <button className='bg-blue-500 text-white px-6 py-2 rounded text-lg'onClick={handleEditClick}>Edit</button>
            </div>
          </div>
          <div className='flex-grow flex items-center justify-center'>
            <ProfileModal 
              isOpen={isModalOpen}
              profile={currentProfile}
              onSave={handleProfileSave}
              onClose={handleModalClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;