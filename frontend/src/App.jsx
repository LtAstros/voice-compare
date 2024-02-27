import video from './assets/video-placeholder.png';
import { useEffect, useRef, useState } from 'react'
import './App.css'
// import RecordingButton from './components/RecordingButton';

function App() {
    const [isRecording, setIsRecording] = useState(false)
    const [permission, setPermission] = useState()
    const [audioURL, setAudioURL] = useState(null)
    let mediaStream = useRef(null)
    let audioRecord = useRef(null)

    useEffect(() => {
        async function getPermission() {
            let status = await navigator.permissions.query({name:'microphone'})
            status.onchange = () => {setPermission(status.state)}
        }
        getPermission()
    }, [])

    function dataCallback(e) {
        if (e.data.size === 0) return;
        const chunk = e.data
        const audioUrl = URL.createObjectURL(chunk);
        setAudioURL(audioUrl)
    }

    async function startRecording() {
        try {
            mediaStream.current = await navigator.mediaDevices.getUserMedia({video: false, audio:true})
            audioRecord.current = new MediaRecorder(mediaStream.current)
            audioRecord.current.start()
            audioRecord.current.ondataavailable = dataCallback
            setIsRecording(true)
        } catch (err) {
            console.error(`you got an error: ${err}`)
        }
    }

    function stopRecording(){
        audioRecord.current.stop()
        mediaStream.current.getTracks().forEach(track => {
            track.stop()
        })
        setIsRecording(false)
    }

    function RecordingButton({isRecording}){
        if (isRecording) {
            return <button onClick={stopRecording} className='rounded-lg bg-blue-700 hover:bg-blue-950 p-2 text-slate-200 text-xl'>Stop</button>
        }
        return <button onClick={startRecording} className='rounded-lg bg-blue-700 hover:bg-blue-950 p-2 text-slate-200 text-xl'>Start</button>
    }

    return (
        <div className="flex flex-col justify-center items-center bg-stone-800 min-h-screen overflow-hidden font-sans">
        <h1 className="text-5xl font-bold text-slate-200">Voice Compare</h1>
        <img src={video} alt="video-player" className="size-2/5 max-w-2xl"/>
        <audio src={audioURL} className="w-2/5 max-w-2xl mx-auto" controls={audioURL === null ? false : true}></audio>
        <div className='grid grid-cols-2 gap-4 mt-4 size-2/5 max-w-2xl'>
            <RecordingButton isRecording={isRecording}></RecordingButton>
            <button onClick={startRecording} className='rounded-lg bg-blue-700 hover:bg-blue-950 p-2 text-slate-200 text-xl'>Test Permissions</button>
        </div>
        </div>
    );
}

export default App
