"use client";
import { faFacebook, faGoogle, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React,{ useState }  from 'react';
import { auth, googleProvider } from '../firebase';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const signin:React.FC = () => {

  const [user, loading, error] = useAuthState(auth);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword]= useState<string>("");
  const [errorMessage, setErrorMessage] =useState<string | null>(null);
  const router = useRouter();

  const signInWithGoogle = async () =>{
    try {
      const resultSignInGoogle = await signInWithPopup(auth, googleProvider);
      console.log("ログイン成功",resultSignInGoogle.user);
      router.push("/homes");
    } catch(error) {
      if(error instanceof Error) {
          console.error("Googleログインエラー:",error);
          setErrorMessage(error.message);
      }else{
          setErrorMessage("ログイン中に予期せぬエラーが発生しました。");
      }
  };
};

  const signInWithEmail = async () =>{
    try {
      const resultSignInLogin = await signInWithEmailAndPassword(auth, email, password);
      console.log("Emailログイン成功", resultSignInLogin.user);
      router.push("/homes");
    } catch(error) {
      if(error instanceof Error){
        console.error("Emailログインエラー", error);
        setErrorMessage(error.message);
      }else{
        setErrorMessage("ログイン中に予期せぬエラーが発生しました");
      }
    };
  };



  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 p-6'>
      <h1 className='font-bold text-5xl mb-8 text-gradient bg-gradient-to-r from-purple-600 via-pink-500 to-red-600 p-3 rounded-lg'>
        Umbrella Forecast
      </h1>

      <div className='w-full max-w-sm'>
        <button className='flex items-center justify-center bg-blue-600 text-white text-xl px-8 py-4 rounded-lg mb-4 w-full'>
          <FontAwesomeIcon icon={faFacebook} className='mr-3'/>Facebookでログイン
        </button>

        <button 
          className='flex items-center justify-center bg-red-500 text-white text-xl px-8 py-4 rounded-lg mb-4 w-full'
          onClick={signInWithGoogle}
          >
          <FontAwesomeIcon icon={faGoogle} className='mr-3'/>Googleでログイン
        </button>

        <button className='flex items-center justify-center bg-black text-white text-xl px-8 py-4 rounded-lg mb-4 w-full'>
          <FontAwesomeIcon icon={faXTwitter} className='mr-3 text-white'/>X( 旧Twitter )でログイン
        </button>

        <div className='flex flex-col space-y-4'>
          <input 
            id='email'
            className='p-4 border rounded-lg'
            type='email'
            placeholder='メールアドレス'
            value={email}
            onChange={e => setEmail(e.target.value)}
            />
          <input 
            id='password'
            className='p-4 border rounded-lg'
            type='password'
            placeholder='パスワード'
            value={password}
            onChange={e => setPassword(e.target.value)}
            />
          <button 
            className='bg-gradient-to-r from-green-400 to-green-600 text-white text-xl px-8 py-4 rounded-lg w-full'
            onClick={signInWithEmail}
            >
            メールでログイン
          </button>
        </div>
        <div className='mt-4'>
          <Link href="/signup" className='text-blue-600 hover:text-blue-800 underline'>登録がまだの方はこちらへ</Link>
        </div>
      </div>
    </div>

  );
};

export default signin;