"use client";
import { useRouter } from 'next/navigation';

const Page = () =>{

  const router = useRouter();

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-200 to-gray-300 p-4'>
      <h1 className='mb-8 text-4xl font-bold text-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-3 rounded'>
        Umbrella Forecast
      </h1>
      <button 
        className='bg-gradient-to-r from-blue-500 to-blue-300 text-xl text-white px-8 py-4 rounded-lg mb-4 hover:scale-105 transform transition-transform duration-200'
        onClick={() => router.push("/signin")}
        >
        ログイン
      </button>
      <button
        className='bg-gradient-to-r from-green-500 to-green-300 text-xl text-white px-8 py-4 rounded-lg hover:scale-105 transform transition-transform duration-200'
        onClick={() =>router.push("/signup")}
        >
        新規登録
      </button>
  </div>
  );
};


export default Page;
