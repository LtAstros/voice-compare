"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import os
from django.contrib import admin
from django.urls import path
from django.conf import settings
from ninja import NinjaAPI, File
from ninja.files import UploadedFile
from resemblyzer import preprocess_wav, VoiceEncoder
import numpy as np
import librosa

api = NinjaAPI()

encoder = VoiceEncoder()

@api.get("/add")
def add(request, a: int, b: int):
    return {"result": a + b}

@api.get("/test")
def test(request):
    return {"result": 200}

@api.post("/audio/")
async def audio_process(request, file: UploadedFile):
    wav, source_sr = librosa.load(file.file, sr=None)
    audio = encoder.embed_utterance(preprocess_wav(os.path.join(settings.BASE_DIR, "test.wav")))
    compare_audio = encoder.embed_utterance(preprocess_wav(wav, source_sr))
    similarity_score = np.inner(audio, compare_audio)
    return {"name": file.name,
            "type": file.content_type,
            "score": float(similarity_score)}

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),
]
