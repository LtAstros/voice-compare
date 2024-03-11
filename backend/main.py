from fastapi import Body, FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from resemblyzer import preprocess_wav, VoiceEncoder
from scipy.io.wavfile import write
import numpy as np
import speech_recognition as sr
from difflib import SequenceMatcher
import librosa
import io
# import audiotools
HOUNDIFY_CLIENT_ID = "Bvzc-zTsXIHu1Umkg9Y4Tg=="  # Houndify client IDs are Base64-encoded strings
HOUNDIFY_CLIENT_KEY = "zEZ7Zw_CsNvCOkVlMaCpSk15CcUSL099_ep1z7naJzqWoe3smHn8tzu3UexwHm4k2AR0SC0QpQrX7qJAihjcgg=="

def houndifySpeechToText(audio_file_path, houndify_client_id, houndify_client_key):
    r = sr.Recognizer()
   # with sr.AudioFile(audio_file_path) as source:
        #audio = r.record(source)  # read the entire audio file
    try:
        return r.recognize_houndify(audio_file_path, client_id=HOUNDIFY_CLIENT_ID, client_key=HOUNDIFY_CLIENT_KEY)
    except sr.UnknownValueError:
        print("Houndify could not understand audio")
    except sr.RequestError as e:
        print("Could not request results from Houndify service; {0}".format(e))


def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

class Data(BaseModel):
    word: str

app = FastAPI()

encoder = VoiceEncoder()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def read_item(item_id):
    return {"item_id": item_id}

@app.post("/files/")
async def create_file(data: Data):
    return {
        "status": "success",
        "data": data
    }

@app.post("/audio/")
async def audio_process(file: UploadFile):
    audio_bytes = await file.read()    
    #test_file = open("temp.wav", "wb")
    #test_file.write(audio_bytes)
    #test_file.close()
    waveform, sample_rate = librosa.load(io.BytesIO(audio_bytes), sr=None, mono=True)
    audio = encoder.embed_utterance(preprocess_wav("test.wav"))
    compare_audio = encoder.embed_utterance(preprocess_wav(waveform))
    #submission_out = houndifySpeechToText(preprocess_wav(waveform), HOUNDIFY_CLIENT_ID, HOUNDIFY_CLIENT_KEY)
    #comparison_out = houndifySpeechToText(preprocess_wav("test.wav"), HOUNDIFY_CLIENT_ID, HOUNDIFY_CLIENT_KEY)
    #print(submission_out[0])
    #print(comparison_out[0])
    #print(similar(submission_out[0], comparison_out[0]))
    print(np.inner(audio, compare_audio))
    similarity_score = np.inner(audio, compare_audio)
    print(type(similarity_score))
    return {"name": file.filename,
            "type": file.content_type,
            "score": float(similarity_score)}