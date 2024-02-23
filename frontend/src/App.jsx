import video from './assets/video-placeholder.png';
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col justify-center items-center bg-stone-800 min-h-screen overflow-hidden font-sans">
      <h1 className="text-5xl font-bold text-slate-200">Voice Compare</h1>
      <img src={video} alt="video-player" className="size-2/5 max-w-2xl"/>
      <audio id="song" class="w-2/5 max-w-2xl mx-auto" controls>
        <source src="https://open.spotify.com/track/7DE0I3buHcns00C0YEsYsY?si=5e0442c12f514f04" type="audio/mpeg"/>
      </audio>
      <div className='grid grid-cols-2 gap-4 mt-4 size-2/5 max-w-2xl'>
        <button className='rounded-lg bg-blue-950 p-2 text-slate-200 text-xl'>Hello</button>
        <button className='rounded-lg bg-blue-950 p-2 text-slate-200 text-xl'>World</button>
      </div>
    </div>
  );
}

export default App
