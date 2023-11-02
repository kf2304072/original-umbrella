"use client";
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faUmbrella, faCloud } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


type MenuMapping = {
  '現在地の天気': string,
  '3時間毎の傘予報': string,
  '5日間天気予報': string,
  '気象アドバイス': string,
  'お気に入りの地域': string,
  'プロフィール': string,
  'ログアウト': string
};

const menuMapping: MenuMapping = {
  '現在地の天気': '/current-weather',
  '3時間毎の傘予報': '/hourly-forecast',
  '5日間天気予報': '/5-day-forecast',
  '気象アドバイス': '/weather-advice',
  'お気に入りの地域': '/favorite-locations',
  'プロフィール': '/profile',
  'ログアウト': '/logout'
};


function WeatherPage() {

  const router = useRouter();

  const handleMenuItemClick = (url: string) => {
    router.push(url);
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
    {/* サイト名 */}
    <header className="bg-white p-4 shadow-md ">
        <h1 className="font-bold text-3xl text-gradient bg-gradient-to-r from-purple-300 via-blue-300 to-red-300 ">Umbrella Forecast</h1>
    </header>

    <div className="flex flex-1 overflow-y-hidden">
        {/* サイドバーコンポーネント */}
        <aside className="bg-gradient-to-b from-red-500 to-blue-600 w-1/4 p-4 text-white">
        <h2 className="font-bold text-4xl mb-4">メニュー</h2>
        <ul>
        {Object.entries(menuMapping).map(([key, value], index) => (
        <li key={index} className="mb-4 hover:text-blue-300 text-xl">
          <span onClick={() => handleMenuItemClick(value)}>{key}</span>
        </li>
         ))}
         </ul>
        </aside>

        {/* メインコンテンツコンポーネント */}
        <main className="flex-1 p-4 overflow-y-auto">
            <section className="bg-white p-4 rounded-md mb-5">
                <h2 className="font-bold text-xl mb-2 text-center bg-gradient-to-r from-red-500 to-blue-600 text-white p-2 rounded">傘の種類別アドバイス</h2>
                <p>今日の天気に合わせた傘のアドバイスがこちらに表示されます。</p>
            </section>

            <section className="bg-white p-4 rounded-md mb-5">
                <h2 className="font-bold text-xl mb-2">お気に入りの地域</h2>
                <div className="bg-gradient-to-r from-blue-300 to-blue-600 p-6 text-white flex flex-col items-center">
              {/* 今日と明日の天気 */}
            <div className="grid grid-cols-2 gap-4 mb-4 w-1/2 text-center">
        <div>
          <h2 className="text-2xl mb-2">今日</h2>
          <div>晴れ <FontAwesomeIcon icon={faSun} className="text-yellow-400" /></div>
          <div>最高: 25°C</div>
          <div>最低: 15°C</div>
        </div>
        <div>
          <h2 className="text-2xl mb-2">明日</h2>
          <div>雨 <FontAwesomeIcon icon={faUmbrella} className="text-blue-400" /></div>
          <div>最高: 23°C</div>
          <div>最低: 16°C</div>
        </div>
      </div>

      {/* 3時間毎の天気 */}
      <h2 className="text-2xl mb-2">3時間毎の天気</h2>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-white divide-y divide-white divide-x">
          <thead>
            <tr>
              <th className="px-4 py-2 border-r">時間</th>
              <th className="px-4 py-2 border-r">0時</th>
              <th className="px-4 py-2 border-r">3時</th>
              <th className="px-4 py-2 border-r">6時</th>
              <th className="px-4 py-2 border-r">9時</th>
              <th className="px-4 py-2 border-r">12時</th>
              <th className="px-4 py-2 border-r">15時</th>
              <th className="px-4 py-2 border-r">18時</th>
              <th className="px-4 py-2 border-r">21時</th>
              <th className="px-4 py-2 border-r">24時</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white">
            <tr>
              <td className="px-4 py-2 border-r">天気</td>
              <td className="px-4 py-2 border-r">晴れ <FontAwesomeIcon icon={faSun} className="text-yellow-400" /></td>
              <td className="px-4 py-2 border-r">雨 <FontAwesomeIcon icon={faUmbrella} className="text-blue-400" /></td>
              <td className="px-4 py-2 border-r">曇り <FontAwesomeIcon icon={faCloud} /></td>
              <td className="px-4 py-2 border-r">晴れ <FontAwesomeIcon icon={faSun} className="text-yellow-400" /></td>
              <td className="px-4 py-2 border-r">晴れ <FontAwesomeIcon icon={faSun} className="text-yellow-400" /></td>
              <td className="px-4 py-2 border-r">曇り <FontAwesomeIcon icon={faCloud} /></td>
              <td className="px-4 py-2 border-r">雨 <FontAwesomeIcon icon={faUmbrella} className="text-blue-400" /></td>
              <td className="px-4 py-2 border-r">晴れ <FontAwesomeIcon icon={faSun} className="text-yellow-400" /></td>
              <td className="px-4 py-2 border-r">曇り <FontAwesomeIcon icon={faCloud} /></td>
            </tr>
            <tr>
              <td className="px-4 py-2 border-r">気温</td>
              <td className="px-4 py-2 border-r">20°C</td>
              <td className="px-4 py-2 border-r">18°C</td>
              <td className="px-4 py-2 border-r">19°C</td>
              <td className="px-4 py-2 border-r">21°C</td>
              <td className="px-4 py-2 border-r">25°C</td>
              <td className="px-4 py-2 border-r">24°C</td>
              <td className="px-4 py-2 border-r">23°C</td>
              <td className="px-4 py-2 border-r">22°C</td>
              <td className="px-4 py-2 border-r">20°C</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border-r">降水量</td>
              <td className="px-4 py-2 border-r">0mm</td>
              <td className="px-4 py-2 border-r">1mm</td>
              <td className="px-4 py-2 border-r">0mm</td>
              <td className="px-4 py-2 border-r">0mm</td>
              <td className="px-4 py-2 border-r">2mm</td>
              <td className="px-4 py-2 border-r">3mm</td>
              <td className="px-4 py-2 border-r">1mm</td>
              <td className="px-4 py-2 border-r">0mm</td>
              <td className="px-4 py-2 border-r">2mm</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border-r">風速</td>
              <td className="px-4 py-2 border-r">5km/h</td>
              <td className="px-4 py-2 border-r">6km/h</td>
              <td className="px-4 py-2 border-r">5km/h</td>
              <td className="px-4 py-2 border-r">7km/h</td>
              <td className="px-4 py-2 border-r">6km/h</td>
              <td className="px-4 py-2 border-r">5km/h</td>
              <td className="px-4 py-2 border-r">8km/h</td>
              <td className="px-4 py-2 border-r">6km/h</td>
              <td className="px-4 py-2 border-r">7km/h</td>
            </tr>
          </tbody>
        </table>
      </div>


      {/* 週間天気 */}
      <h2 className="text-2xl mb-2">週間天気</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-white divide-y divide-white divide-x">

          <thead>
            <tr>
              <th className="px-4 py-2 border-r">日付</th>
              <th className="px-4 py-2 border-r">10/10</th>
              <th className="px-4 py-2 border-r">10/11</th>
              <th className="px-4 py-2 border-r">10/12</th>
              <th className="px-4 py-2 border-r">10/13</th>
              <th className="px-4 py-2 border-r">10/14</th>
              {/* ... 他の日付も同様に追加 */}
            </tr>
          </thead>
          <tbody className="divide-y divide-white">
            <tr>
              <td className="px-4 py-2 border-r">天気</td>
              <td className="px-4 py-2 border-r">晴れ <FontAwesomeIcon icon={faSun} className="text-yellow-400" /></td>
              <td className="px-4 py-2 border-r">晴れ <FontAwesomeIcon icon={faSun} className="text-yellow-400" /></td>
              <td className="px-4 py-2 border-r">晴れ <FontAwesomeIcon icon={faSun} className="text-yellow-400" /></td>
              <td className="px-4 py-2 border-r">晴れ <FontAwesomeIcon icon={faSun} className="text-yellow-400" /></td>
              <td className="px-4 py-2 border-r">晴れ <FontAwesomeIcon icon={faSun} className="text-yellow-400" /></td>
              
              {/* ... 他の日付の天気も同様に追加 */}
            </tr>
            <tr> 
              <td className="px-4 py-2 border-r">最高気温</td>
              <td className="px-4 py-2 border-r">25°C</td>
              <td className="px-4 py-2 border-r">24°C</td>
              <td className="px-4 py-2 border-r">24°C</td>
              <td className="px-4 py-2 border-r">24°C</td>
              <td className="px-4 py-2 border-r">24°C</td>
            </tr>
            <tr> 
              <td className="px-4 py-2 border-r">最低気温</td>
              <td className="px-4 py-2 border-r">10°C</td>
              <td className="px-4 py-2 border-r">12°C</td>
              <td className="px-4 py-2 border-r">11°C</td>
              <td className="px-4 py-2 border-r">15°C</td>
              <td className="px-4 py-2 border-r">16°C</td>
            </tr>
            <tr> 
              <td className="px-4 py-2 border-r">降水確率</td>
              <td className="px-4 py-2 border-r">20%</td>
              <td className="px-4 py-2 border-r">20%</td>
              <td className="px-4 py-2 border-r">80%</td>
              <td className="px-4 py-2 border-r">40%</td>
              <td className="px-4 py-2 border-r">80%</td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
            </section>

            <section className="bg-white p-4 rounded-md">
                <h2 className="font-bold text-xl mb-2">全国の天気</h2>
                    <div className="container mx-auto p-4">
      <table className="w-full border-collapse border border-gray-300">
        <tbody>
          <tr>
            <td className="border p-2"></td>
            <td className="border p-2">札幌</td>
            <td className="border p-2">仙台</td>
            <td className="border p-2">新潟</td>
            <td className="border p-2">東京</td>
            <td className="border p-2">名古屋</td>
            <td className="border p-2">金沢</td>
            <td className="border p-2">大阪</td>
            <td className="border p-2">広島</td>
            <td className="border p-2">高知</td>
            <td className="border p-2">福岡</td>
            <td className="border p-2">沖縄</td>
          </tr>
          <tr>
            <td className="border p-2">天気</td>
            <td className="border p-2">14</td>
            <td className="border p-2">15</td>
            <td className="border p-2">16</td>
            <td className="border p-2">17</td>
            <td className="border p-2">18</td>
            <td className="border p-2">19</td>
            <td className="border p-2">20</td>
            <td className="border p-2">21</td>
            <td className="border p-2">22</td>
            <td className="border p-2">23</td>
            <td className="border p-2">24</td>
          </tr>
          <tr>
            <td className="border p-2">最高気温</td>
            <td className="border p-2">26</td>
            <td className="border p-2">27</td>
            <td className="border p-2">28</td>
            <td className="border p-2">29</td>
            <td className="border p-2">30</td>
            <td className="border p-2">31</td>
            <td className="border p-2">32</td>
            <td className="border p-2">33</td>
            <td className="border p-2">34</td>
            <td className="border p-2">35</td>
            <td className="border p-2">36</td>
          </tr>
          <tr>
            <td className="border p-2">最低気温</td>
            <td className="border p-2">26</td>
            <td className="border p-2">27</td>
            <td className="border p-2">28</td>
            <td className="border p-2">29</td>
            <td className="border p-2">30</td>
            <td className="border p-2">31</td>
            <td className="border p-2">32</td>
            <td className="border p-2">33</td>
            <td className="border p-2">34</td>
            <td className="border p-2">35</td>
            <td className="border p-2">36</td>
          </tr>
          <tr>
            <td className="border p-2">降水量</td>
            <td className="border p-2">26</td>
            <td className="border p-2">27</td>
            <td className="border p-2">28</td>
            <td className="border p-2">29</td>
            <td className="border p-2">30</td>
            <td className="border p-2">31</td>
            <td className="border p-2">32</td>
            <td className="border p-2">33</td>
            <td className="border p-2">34</td>
            <td className="border p-2">35</td>
            <td className="border p-2">36</td>
          </tr>
        </tbody>
      </table>
    </div>


            </section>

        </main>
    </div>
</div>
);
};
  

export default WeatherPage;


