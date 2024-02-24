import video from './assets/video-placeholder.png';
import { useState } from 'react'
import './App.css'
import RecordingButton from './components/RecordingButton';

function App() {
  const [record, setRecord] = useState("start")

  return (
    <div className="flex flex-col justify-center items-center bg-stone-800 min-h-screen overflow-hidden font-sans">
      <h1 className="text-5xl font-bold text-slate-200">Voice Compare</h1>
      <img src={video} alt="video-player" className="size-2/5 max-w-2xl"/>
      <audio id="song" className="w-2/5 max-w-2xl mx-auto" controls>
        <source type="audio/mpeg"/>
      </audio>
      <div className='grid grid-cols-2 gap-4 mt-4 size-2/5 max-w-2xl'>
        <RecordingButton></RecordingButton>
        <button className='rounded-lg bg-blue-700 hover:bg-blue-950 p-2 text-slate-200 text-xl'>World</button>
      </div>
    </div>
  );
}

export default App
