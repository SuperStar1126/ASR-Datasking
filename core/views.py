from django.shortcuts import render

from django.http import HttpResponse
from django.template import loader
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from os import path
from espnet2.bin.asr_inference import Speech2Text

lang = ''

englishSpeech2text = Speech2Text(
    train_config="saved_models/english/english_config.yaml",
    model_file="saved_models/english/english_model.pth",
    device="cpu",
    minlenratio=0.0,
    maxlenratio=0.0,
    ctc_weight=0.3,
    beam_size=10,
    batch_size=0,
    nbest=1
)

hebrewSpeech2text = Speech2Text(
    train_config="saved_models/hebrew/hebrew_config.yaml",
    model_file="saved_models/hebrew/hebrew_model.pth",
    device="cpu",
    minlenratio=0.0,
    maxlenratio=0.0,
    ctc_weight=0.3,
    beam_size=10,
    batch_size=0,
    nbest=1
)

frenchSpeech2text = Speech2Text(
    train_config="saved_models/french/french_config.yaml",
    model_file="saved_models/french/french_model.pth",
    device="cpu",
    minlenratio=0.0,
    maxlenratio=0.0,
    ctc_weight=0.3,
    beam_size=10,
    batch_size=0,
    nbest=1
)

def index(request):
    template = loader.get_template('index.html')
    return HttpResponse(template.render())

@csrf_exempt
def language(request):
    global lang 
    lang = request.POST.get('lang')
    return HttpResponse('success')

@csrf_exempt
def upload(request):
    audio = request.body
    result = ''
    try:
        if lang=='english':
            result = englishSpeech2text(audio)
        elif lang=='france':
            result = frenchSpeech2text(audio)
        elif lang=='hebrew':
            result = hebrewSpeech2text(audio)
        print("ASR thinks you said - " + result)
    except:
        print("ASR could not understand audio")
                
    return HttpResponse(result)
    
    