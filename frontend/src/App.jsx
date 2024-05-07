import audio from './assets/test.wav'
import ScoreList from './components/ScoreList';
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
    const [recentScores, setRecentScores] = useState([])
    const [showInfo, setShowInfo] = useState(false)
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
        setSimilarityScore(null)
        try {
            mediaStream.current = await navigator.mediaDevices.getUserMedia({video: false, audio:true})
            audioRecorder.current = new MediaRecorder(mediaStream.current, { mimeType: 'audio/wav' })
            audioRecorder.current.start()
            audioRecorder.current.ondataavailable = dataCallback
            setIsRecording(true)
        } catch (err) {
            alert(`You got an error: ${err}`)
            return
        }
    }

    function stopRecording(){
        audioRecorder.current.stop()
        mediaStream.current.getTracks().forEach(track => {
            track.stop()
        })
        setIsRecording(false)
    }

    function updateRecentScores(score){
            let new_item = {url:audioURL,score:score}
            let scores = [...recentScores]
            scores.push(new_item)
            if (scores.length > 5 ){
                scores.shift()
            }
            setRecentScores(scores)
    }

    async function placeholderAPICall(){
        let formData = new FormData();
        formData.append("file", audioBlob, 'audio.wav');
        try {
            setSimilarityScore("loading")
            const response = await fetch('http://127.0.0.1:8000/audio/', {method: "POST", body: formData})
            const data = await response.json();
            setSimilarityScore(data.score);
            updateRecentScores(data.score)
            clearRecording()
        } catch (error) {
            alert(error)
            setSimilarityScore(null)
            console.error(error);
        }
    }

    function RecordingButton({isRecording}){
        if (isRecording) {
            return <button onClick={stopRecording} className='rounded bg-red-700 hover:bg-red-950 p-2 text-slate-200 text-xl'>Stop</button>
        }
        return <button onClick={startRecording} className='rounded bg-blue-700 hover:bg-blue-950 p-2 text-slate-200 text-xl'>Record</button>
    }

    function SubmitButton({audioURL}){
        return <button onClick={placeholderAPICall} className="rounded bg-blue-700 hover:bg-blue-950 p-2 text-slate-200 text-xl">Compare</button>
    }

    function clearRecording(){
        setAudioURL(null)
        setAudioBlob(null)
    }

    return (
        <div className="flex flex-col items-center h-full w-full font-sans relative">
            <div className="flex flex-col items-center w-full max-w-lg font-sans">
                <div className='flex relative w-full items-center justify-center border-b-2 border-slate-400'>
                    <h1 className="text-5xl font-bold text-slate-200 p-5">Voice Compare</h1>
                    <button onClick={() => setShowInfo(!showInfo)} className='absolute right-0'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                    </button>
                </div>

                {(showInfo === true) && <div className='w-full border-b-2 border-slate-400 pb-2'>
                    <p className='text-slate-200'>
                        Voice Compare is a daily challenge game in the spirit of games like Wordle (though mainly taking inspiration from games like Semantle and Timeguessr).
                    </p>
                </div> }



                <div className='w-full border-b-2 border-slate-400 pb-2'>
                    <h2 className="text-center text-3xl font-bold text-slate-200 p-2">Imitatee of the Day: Vedan Desai</h2>
                    <audio className="w-full" controls>
                        <source src={audio} type="audio/wav"/>
                    </audio>
                    <p className='italic text-slate-200'>“'There's iron, they say, in all our blood, And a grain or two perhaps is good; But his, he makes me harshly feel, Has got a little too much of steel.' ANON.”</p>
                </div>
                
                {audioURL !== null && <h2 className="text-3xl font-bold text-slate-200 p-2">Your Recent Recording:</h2>}
                <audio src={audioURL} className="w-full" controls={audioURL === null ? false : true}></audio>
                {similarityScore !== null && <h2 className="text-3xl font-bold text-slate-200 p-2">{similarityScore === "loading" ? "Loading..." : `Your score is: ${similarityScore.toFixed(2)}`}</h2>}

                {(audioURL === null && isRecording == false) && <div onClick={startRecording} className='flex items-center justify-center mt-2 w-full'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="fill-slate-200 hover:fill-slate-400 w-10 h-10">
                        <path d="M8 1a2 2 0 0 0-2 2v4a2 2 0 1 0 4 0V3a2 2 0 0 0-2-2Z" />
                        <path d="M4.5 7A.75.75 0 0 0 3 7a5.001 5.001 0 0 0 4.25 4.944V13.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.556A5.001 5.001 0 0 0 13 7a.75.75 0 0 0-1.5 0 3.5 3.5 0 1 1-7 0Z" />
                    </svg>
                </div>}

                {(isRecording == true) && <div onClick={stopRecording} className='flex items-center justify-center mt-2 w-full'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="fill-slate-200 hover:fill-slate-400 w-10 h-10" viewBox="0 0 48 48">
                        <path xmlns="http://www.w3.org/2000/svg" d="M24,2A22,22,0,1,0,46,24,21.9,21.9,0,0,0,24,2Zm0,40A18,18,0,1,1,42,24,18.1,18.1,0,0,1,24,42Z"/>
                        <rect xmlns="http://www.w3.org/2000/svg" x="16" y="16" width="16" height="16" rx="1" ry="1"/>
                    </svg>
                    <h1 className='text-slate-200 pl-2'>00:00</h1>
                </div>}

                {(audioURL !== null && isRecording == false) &&
                <div className='grid grid-cols-2 gap-4 mt-2 w-full'>
                <button onClick={clearRecording} className="rounded bg-blue-700 hover:bg-blue-950 p-2 text-slate-200 text-xl">Re-record</button>
                    <SubmitButton audioURL={audioURL}></SubmitButton>
                </div>}

                {recentScores.length > 0 && <h2 className="text-3xl font-bold text-slate-200 p-2">Recent Recordings:</h2>}
                <ScoreList scores={recentScores}/>
            </div>
        </div>
    );
}

export default App
