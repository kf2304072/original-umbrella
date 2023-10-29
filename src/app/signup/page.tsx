"use client";
import React,{ useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons/faGoogle';
import Link from 'next/link';
import { auth, googleProvider } from '../firebase';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';


const signup:React.FC = () => {

  const [email, setEmail]= useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMesssage, setErrorMessage] = useState<string>("");
  const router = useRouter();

  const signUpWithGoogle = async () =>{
    try {
      const resultSignUpGoogle = await signInWithPopup(auth, googleProvider);
      console.log("新規登録成功", resultSignUpGoogle.user);
      router.push("/homes");
    } catch(error) {
        if(error instanceof Error){
          console.error("Google新登録エラー", error);
          setErrorMessage(error.message);
        }else{
          setErrorMessage("新規登録中に予期せぬエラーが発生しました。");
        };
    };
  };

  const handleSignup = async () =>{
    if(password !== confirmPassword){
      setErrorMessage("パスワードが一致しません。");
      return;
    };
    
    try {
      const registerUser = await createUserWithEmailAndPassword(auth, email, password);
      console.log("新規登録成功", registerUser.user);
      router.push("/homes");
    } catch(error){
        if(error instanceof Error){
          console.error("新規登録エラー", error);
          setErrorMessage(error.message);
        };
    };
  };



  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 p-6'>
      <h1 className='font-bold text-5xl mb-8 text-gradient bg-gradient-to-r from-purple-600 via-pink-500 to-red-600 p-3 rounded-lg'>
        Umbrella Forecast
      </h1>

      <div className='w-full max-w-sm'>
        <button className='flex items-center justify-center bg-blue-600 text-white text-xl px-8 py-4 rounded-lg mb-4 w-full'>
          <FontAwesomeIcon icon={faFacebook} className='mr-3'/>Facebookで新規登録
        </button>

        <button 
          className='flex items-center justify-center bg-red-500 text-white text-xl px-8 py-4 rounded-lg mb-4 w-full'
          onClick={signUpWithGoogle}
          >
          <FontAwesomeIcon icon={faGoogle} className='mr-3'/>Googleで新規登録
        </button>

        <button className='flex items-center justify-center bg-black text-white text-xl px-8 py-4 rounded-lg mb-4 w-full'>
          <FontAwesomeIcon  icon={faXTwitter} className='mr-3 text-white'/>X( 旧Twitter )で新規登録
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
          <input 
            id='confirmPassword'
            className='p-4 border rounded-lg'
            type='password'
            placeholder='パスワード確認'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            />
          <button 
            className='bg-gradient-to-r from-green-400 to-green-600 text-white text-xl px-8 py-4 rounded-lg w-full'
            onClick={handleSignup}
            >
            メールで新規登録
          </button>
        </div>
        <div className='mt-4'>
          <Link href="/signin" className='text-red-600 hover:text-red-800 underline'>登録済みの方はこちらへ</Link>
        </div>
      </div>
    </div>
  );
};

export default signup;