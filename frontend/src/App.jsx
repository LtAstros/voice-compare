import video from './assets/video-placeholder.png';
import audio from './assets/test.wav'
import { useEffect, useRef, useState } from 'react'
import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';
import './App.css'

function App() {
    const [isRecording, setIsRecording] = useState(false)
    // Permission will be used to modify page content
    const [permission, setPermission] = useState()
    const [audioURL, setAudioURL] = useState(null)
    const [audioBlob, setAudioBlob] = useState(null)
    const [similarityScore, setSimilarityScore] = useState(null)
    const mediaStream = useRef(null)
    const audioRecorder = useRef(null)

    useEffect(() => {
        async function setUpConnection(){
            await register(await connect());
        }

        async function getPermission() {
            let status = await navigator.permissions.query({name:'microphone'})
            status.onchange = () => {setPermission(status.state)}
        }
        setUpConnection()
        getPermission()
    }, [])

    function dataCallback(e) {
        if (e.data.size === 0) return;
        const chunk = new Blob([e.data], {type: "audio/wav" })
        const audioUrl = URL.createObjectURL(chunk);
        setAudioBlob(chunk)
        setAudioURL(audioUrl)
    }

    async function startRecording() {
        try {
            mediaStream.current = await navigator.mediaDevices.getUserMedia({video: false, audio:true})
            audioRecorder.current = new MediaRecorder(mediaStream.current, { mimeType: 'audio/wav' })
            audioRecorder.current.start()
            audioRecorder.current.ondataavailable = dataCallback
            setIsRecording(true)
        } catch (err) {
            alert(`You got an error: ${err}`)
        }
    }

    function stopRecording(){
        audioRecorder.current.stop()
        mediaStream.current.getTracks().forEach(track => {
            track.stop()
        })
        setIsRecording(false)
    }

    async function placeholderAPICall(){
        let formData = new FormData();
        // formData = {word:"hi"}
        formData.append("file", audioBlob, 'audio.wav');
        try {
            setSimilarityScore("loading")
            const response = await fetch('http://127.0.0.1:8000/audio/', {method: "POST", body: formData})
            const data = await response.json();
            setSimilarityScore(data.score)
            console.log(data);
        } catch (error) {
            alert(error)
            console.error(error);
        }
    }

    function RecordingButton({isRecording}){
        if (isRecording) {
            return <button onClick={stopRecording} className='rounded-lg bg-red-700 hover:bg-red-950 p-2 text-slate-200 text-xl'>Stop</button>
        }
        return <button onClick={startRecording} className='rounded-lg bg-blue-700 hover:bg-blue-950 p-2 text-slate-200 text-xl'>Start</button>
    }

    function SubmitButton({audioURL}){
        if (audioURL) {
            return <button onClick={placeholderAPICall} className={`rounded-lg bg-blue-700 hover:bg-blue-950 p-2 text-slate-200 text-xl`}>Compare Audio</button>
        }
        return <button className={`rounded-lg bg-blue-300 p-2 text-slate-200 text-xl`}>Compare Audio</button>
    }

    return (
        <div className="flex flex-col justify-center items-center bg-stone-800 min-h-screen overflow-hidden font-sans">
        <h1 className="text-5xl font-bold text-slate-200">Voice Compare</h1>
        <img src={video} alt="video-player" className="size-2/5 max-w-2xl"/>
        <h2 className="text-3xl font-bold text-slate-200">Try to copy this audio!</h2>
        <audio className="w-2/5 max-w-xl mx-auto" controls>
            <source src={audio} type="audio/wav"/>
        </audio>
        {audioURL !== null && <h2 className="text-3xl font-bold text-slate-200">Your Recording:</h2>}
        <audio src={audioURL} className="w-2/5 max-w-xl mx-auto" controls={audioURL === null ? false : true}></audio>
        {similarityScore !== null && <h2 className="text-3xl font-bold text-slate-200">{similarityScore === "loading" ? "Loading..." : `Your score is: ${similarityScore.toFixed(2)}`}</h2>}
        <div className='grid grid-cols-2 gap-4 mt-4 size-2/5 max-w-2xl'>
            <RecordingButton isRecording={isRecording}></RecordingButton>
            <SubmitButton audioURL={audioURL}></SubmitButton>
        </div>
        </div>
    );
}

export default App
