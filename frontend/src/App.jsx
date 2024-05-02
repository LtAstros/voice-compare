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
    const [topScores, setTopScores] = useState([])
    const [showInfo, setShowInfor] = useState(false)
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

    function updateTopScores(score){
            let new_item = {url:audioURL,score:score}
            let scores = [...topScores]
            scores.push(new_item)
            scores.sort((a,b) => a.score < b.score ? 1 : -1)
            console.log(scores)
            setTopScores(scores.slice(0,5))
    }

    async function placeholderAPICall(){
        let formData = new FormData();
        formData.append("file", audioBlob, 'audio.wav');
        try {
            setSimilarityScore("loading")
            const response = await fetch('http://127.0.0.1:8000/audio/', {method: "POST", body: formData})
            const data = await response.json();
            setSimilarityScore(data.score);
            updateTopScores(data.score)
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
        if (audioURL) {
            return <button onClick={placeholderAPICall} className="rounded bg-blue-700 hover:bg-blue-950 p-2 text-slate-200 text-xl">Compare</button>
        }
        return <button className="rounded bg-blue-300 p-2 text-slate-200 text-xl">Compare</button>
    }

    function InfoBox({showInfo}){
        if (showInfo) {
            return <div className=''>
                Hello
            </div>
        }
    }

    return (
        <div className="flex flex-col items-center h-full w-full font-sans relative">
            <div className="flex flex-col items-center w-full max-w-lg font-sans">
                <div className='flex relative w-full items-center justify-center border-b-2 border-slate-400'>
                    <h1 className="text-5xl font-bold text-slate-200 p-5">Voice Compare</h1>
                    <button className='absolute right-0'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                    </button>
                </div>

                <div className='w-full items-center justify-center border-b-2 border-slate-400 pb-2'>
                    <h2 className="text-center text-3xl font-bold text-slate-200 p-2">Imitatee of the Day: Vedan Desai</h2>
                    <audio className="w-full" controls>
                        <source src={audio} type="audio/wav"/>
                    </audio>
                    <p className='italic text-slate-200'>“'There's iron, they say, in all our blood, And a grain or two perhaps is good; But his, he makes me harshly feel, Has got a little too much of steel.' ANON.”</p>
                </div>
                
                {audioURL !== null && <h2 className="text-3xl font-bold text-slate-200 p-2">Your Recent Recording:</h2>}
                <audio src={audioURL} className="w-full" controls={audioURL === null ? false : true}></audio>
                {similarityScore !== null && <h2 className="text-3xl font-bold text-slate-200 p-2">{similarityScore === "loading" ? "Loading..." : `Your score is: ${similarityScore.toFixed(2)}`}</h2>}
                <div className='grid grid-cols-2 gap-4 mt-2 w-full'>
                    <RecordingButton isRecording={isRecording}></RecordingButton>
                    <SubmitButton audioURL={audioURL}></SubmitButton>
                </div>
                {/* <div className='grid grid-cols-4 gap-4 mt-4 w-full items-center justify-center'>
                    <audio className="col-span-3 w-full" controls>
                        <source src={audio} type="audio/wav"/>
                    </audio>
                    <h1 className="col-span-1 text-3xl font-bold text-slate-200 w-full text-center">Score</h1>
                </div> */}
                {topScores.length > 0 && <h2 className="text-3xl font-bold text-slate-200 p-2">Top 5 Recordings:</h2>}
                <ScoreList scores={topScores}/>
            </div>
        </div>
    );
}

export default App
