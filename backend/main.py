from fastapi import Body, FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from resemblyzer import preprocess_wav, VoiceEncoder
import numpy as np
import librosa

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
    wav, source_sr = librosa.load(file.file, sr=None)
    audio = encoder.embed_utterance(preprocess_wav("test.wav"))
    compare_audio = encoder.embed_utterance(preprocess_wav(wav, source_sr))
    similarity_score = np.inner(audio, compare_audio)
    return {"name": file.filename,
            "type": file.content_type,
            "score": float(similarity_score)}