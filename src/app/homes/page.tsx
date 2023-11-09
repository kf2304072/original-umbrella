"use client";
import { faCloud, faSnowflake, faSun, faUmbrella } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import React, { FC } from 'react';
import { v4 as uuidv4 } from 'uuid';

type MenuMapping = {
  'TOP':string,
  '現在地の天気': string,
  '3時間毎の天気': string,
  '5日間天気予報': string,
  '気象アドバイス': string,
  '投稿':string,
  'お気に入りの地域': string,
  'プロフィール': string,
  'ログアウト': string
};

const menuSidebar: MenuMapping = {
  "TOP": 'homes/',
  "現在地の天気": '/homes/current-weather',
  '3時間毎の天気': '/homes/hourly-forecast',
  '5日間天気予報': '/homes/5-day-forecast',
  '気象アドバイス': '/homes/weather-advice',
  '投稿':'/homes/post',
  'お気に入りの地域': '/homes/favorite-locations',
  'プロフィール': '/homes/profile',
  'ログアウト': '/homes/logout'
};

type WeatherIconType = {
  [key: string]: JSX.Element;
};

const weatherIcons: WeatherIconType = {
  晴:<FontAwesomeIcon icon={faSun} className='text-yellow-400'/>,
  雨:<FontAwesomeIcon icon={faUmbrella} className='text-blue-400'/>,
  曇:<FontAwesomeIcon icon={faCloud} className='text-gray-400'/>,
  雪:<FontAwesomeIcon icon={faSnowflake} className='text-white'/>
};

type HourlyDateType = {
  天気:string[];
  気温:string[];
  降水量:string[];
  風速:string[];
};

const hourlyDate: HourlyDateType ={
  天気: ['晴', '雨', '曇', '晴', '晴', '雪', '雨', '晴'],
  気温:['20°C', '18°C', '19°C', '21°C', '25°C', '24°C', '23°C', '22°C'],
  降水量:['0mm', '1mm', '0mm', '0mm', '2mm', '3mm', '1mm', '0mm'],
  風速:['5km/h', '6km/h', '5km/h', '7km/h', '6km/h', '5km/h', '8km/h', '6km/h']
};

const weeklyWeather = {
  日付: ['10/10', '10/11', '10/12', '10/13', '10/14'],
  天気: ['晴', '雪', '曇', '晴', '雨'],
  最高気温: ['25°C', '24°C', '24°C', '24°C', '24°C'],
  最低気温: ['10°C', '12°C', '11°C', '15°C', '16°C'],
  降水量: ['0mm', '1mm', '0mm', '0mm', '2mm']
};

const tableData = {
  categories:['', '札幌', '仙台', '東京', '名古屋', '金沢', '大阪', '広島', '福岡', '沖縄'],
  天気:['天気', '晴', '雪', '曇', '晴', '雨', '晴', '雪', '曇', '晴'],
  最高気温:['最高気温','25°C', '24°C', '24°C', '24°C', '24°C','25°C', '24°C', '24°C', '24°C'],
  最低気温:['最低気温','10°C', '12°C', '11°C', '15°C', '16°C','10°C', '12°C', '11°C', '15°C'],
  降水量:['降水量','0mm', '1mm', '0mm', '0mm', '2mm', '3mm', '1mm', '0mm','0mm']
};


const homes:React.FC = () => {

  const router = useRouter();

  const handleMenuItemClick = (url:string) =>{
    router.push(url);
  };

  const generateHours = ():string[] =>{
    const hours: string[] = [];
    for(let i =0; i <24; i +=3){
      hours.push(`${i}時`);
    }
    return hours;
  };

  const hoursArray:string[] = generateHours();

  return (
    
    <div className='bg-gray-100 h-screen flex flex-col'>
      {/* サイト名 */}
      <header className='bg-white mt-4'>
        <h1 className='font-bold text-4xl text-gradient bg-gradient-to-r from-purple-400 via-blue-400 to-red-400 p-4 text-center'>Umbrella Forecast</h1>
      </header>

      <div className='flex flex-1 overflow-y-hidden'>
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

        {/* メインコンテンツ */}
        <main className='flex-1 p-4 overflow-auto'>
          <section className='bg-white p-4 rounded-md mb-5'>
            <h2 className='font-bold text-2xl mb-2 text-center bg-blue-400 text-white p-2 rounded'>傘の種類別アドバイス</h2>
            <p>今日の天気に合わせた傘のアドバイスがこちらに表示</p>
          </section>

          <section className='bg-white p-4 rounded-md mb-5'>
            <div className='flex justify-between w-full mb-4'>
              <h2 className='font-bold text-xl mb-2'>お気に入りの地域</h2>
              <button className=' text-white rounded-2xl p-2 bg-blue-400 hover:bg-orange-400'>切り替え</button>
            </div>
            <div className='bg-gradient-to-r from-green-600 to-pink-400 p-6 text-white flex flex-col items-center'>
              {/* 今日と明日の天気 */}
              <div className='grid grid-cols-2 gap-4 mb-4 w-1/2 text-center'>
                <div>
                  <h2 className='mb-2 text-2xl'>今日</h2>
                  <div>晴れ<FontAwesomeIcon icon={faSun} className='text-yellow-400'/></div>
                  <div>最高気温:23℃</div>
                  <div>最低気温:16℃</div>
                </div>
                <div>
                  <h2 className='mb-2 text-2xl'>明日</h2>
                  <div>雨 <FontAwesomeIcon icon={faUmbrella} className='text-blue-400'/></div>
                  <div>最高気温:26℃</div>
                  <div>最低気温:17℃</div>
                </div>
              </div>

              {/* 3時間毎の天気 */}
              <h2 className='mb-2 text-2xl'>3時間毎の天気</h2>
              <div className='overflow-x-auto mb-4'>
                <table className='min-w-full border border-white divide-y divide-white divide-x'>
                  <thead>
                    <tr>
                      <th className='px-4 py-2 border-r'>時間</th>
                      {hoursArray.map(hour => (
                        <th key={uuidv4()} className='px-4 py-2 border-r '>{hour}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(hourlyDate).map(([category, data]) => (
                      <tr key={uuidv4()} className='border-b'>
                        <td className='px-4 py-2 border-r'>{category}</td>
                        {data.map((value) =>(
                          <td key={uuidv4()} className='px-4 py-2 border-r border-t'>
                            {category === "天気" ? <>{value} {weatherIcons[value]}</>: value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* 5日間天気 */}
              <h2 className='mb-2 text-2xl'>5日間天気</h2>
              <div className='mb-4 overflow-x-auto'>
                <table className='min-w-full border border-white divide-white divide-y divide-x'>
                  <thead>
                    <tr>
                      <th className='px-4 py-2 border-r'>日付</th>
                      {weeklyWeather.日付.map(date =>(
                        <th key={uuidv4()} className='px-4 py-2 border-r'>{date}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='divede-y divide-white'>
                    {Object.entries(weeklyWeather).filter(([category]) => category !== "日付").map(([category, data]) =>(
                      <tr key={uuidv4()} className='border-b'>
                        <td className='px-4 py-2 border-r'>{category}</td>
                        {data.map(value =>(
                          <td key={uuidv4()} className='px-4 py-2 border-r'>
                            {category === "天気" ? <>{value} {weatherIcons[value]}</>:value }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          <section className='bg-white p-4 rouded-md'>
            <h2 className='font-bold text-xl mb-2'>全国の天気</h2>
            <div className='container mx-auto p-4 bg-gradient-to-r from-blue-600 to-orange-400 text-white flex flex-col items-center'>
              <table className='w-3/4 border-collapse border border-gray-300 table-fixed'>
                <tbody>
                  {Object.entries(tableData).map(([category, values]) =>(
                    <tr key={uuidv4()}>
                      {values.map((value, index) =>(
                        <td key={uuidv4()} className='border p-2 w-1/10 text-center'>
                          {category === "天気" && index !==0 ? <>{value} {weatherIcons[value]}</>:value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default homes;
