

$(document).ready(function() {
    $('#send').attr('disabled','disabled');
    $('#chat-msg').keyup(function() {
        if($(this).val() != '') {
            $('#send').removeAttr('disabled');
        }
        else {
            $('#send').attr('disabled','disabled');
        }
    });

    // using jQuery
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');
    console.log("csrftoken: ", csrftoken)

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    //webkitURL is deprecated but nevertheless
    URL = window.URL || window.webkitURL;

    var gumStream; 						//stream from getUserMedia()
    var rec; 							//Recorder.js object
    var input; 							//MediaStreamAudioSourceNode we'll be recording

    // shim for AudioContext when it's not avb. 
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext //audio context to help us record

    var recordButton = document.getElementById("recordButton");
    var stopButton = document.getElementById("stopButton");
    var pauseButton = document.getElementById("pauseButton");

    //add events to those 2 buttons
    recordButton.addEventListener("click", startRecording);
    stopButton.addEventListener("click", stopRecording);
    pauseButton.addEventListener("click", pauseRecording);

    function startRecording() {
        console.log("recordButton clicked");

        $.ajax({
            url: 'language',
            method: 'POST',
            data: {
                lang: $('#langs').val(),
            },
            success: function(response) {
                console.log(response)
            },
            error: function(error) {
                console.log(error)
            }
        })
        /*
            Simple constraints object, for more advanced audio features see
            https://addpipe.com/blog/audio-constraints-getusermedia/
        */
        
        var constraints = { audio: true, video:false }

        /*
            Disable the record button until we get a success or fail from getUserMedia() 
        */

        recordButton.disabled = true;
        stopButton.disabled = false;
        pauseButton.disabled = false

        /*
            We're using the standard promise based getUserMedia() 
            https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        */

        navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
            console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

            /*
                create an audio context after getUserMedia is called
                sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
                the sampleRate defaults to the one set in your OS for your playback device
            */
            audioContext = new AudioContext();

            //update the format 
            document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"

            /*  assign to gumStream for later use  */
            gumStream = stream;
            
            /* use the stream */
            input = audioContext.createMediaStreamSource(stream);

            /* 
                Create the Recorder object and configure to record mono sound (1 channel)
                Recording 2 channels  will double the file size
            */
            rec = new Recorder(input,{numChannels:1})

            //start the recording process
            rec.record()

            console.log("Recording started");

        }).catch(function(err) {
            //enable the record button if getUserMedia() fails
            recordButton.disabled = false;
            stopButton.disabled = true;
            pauseButton.disabled = true
        });
    }

    function pauseRecording(){
        console.log("pauseButton clicked rec.recording=",rec.recording );
        if (rec.recording){
            //pause
            rec.stop();
            pauseButton.innerHTML="Resume";
        }else{
            //resume
            rec.record()
            pauseButton.innerHTML="Pause";

        }
    }

    function createDownloadLink(blob) {	
        var url = URL.createObjectURL(blob);
        var au = document.createElement('audio');
        var li = document.createElement('li');
        var br = document.createElement('br');
        var link = document.createElement('a');
    
        //name of .wav file to use during upload and download (without extendion)
        var filename = new Date().toISOString();
    
        //add controls to the <audio> element
        au.controls = true;
        au.src = url;
    
        //save to disk link
        link.href = url;
        link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
        link.innerHTML = "Save to disk";
    
        //add the new audio element to li
        li.appendChild(au);
        
        //add the filename to the li
    
        //add the save to disk link to li
        
        //upload link
        // upload.addEventListener("click", function(event){
            //   var xhr=new XMLHttpRequest();
            //   xhr.onload=function(e) {
            //       if(this.readyState === 4) {
            //           console.log("Server returned: ",e.target.responseText);
            //       }
            //   };
              var fd = new FormData();
              fd.append("audio_data", blob, filename);
            //   xhr.open("POST","11111",true);
            //   xhr.send(fd);
            // $.ajax({
            //     url: 'record',
            //     method: 'POST',
            //     data: fd, 
            //     dataType: 'json',
            //     success: function (res) {
            //         console.log('success: ', res)
            //     },
            //     error: function (err) {
            //         console.log('error: ', err)
            //     },
            //     cache: false,
            //     processData: false,
            //     contentType: false,
            // })



            function getCookie(name) {
                var cookieValue = null;
                if (document.cookie && document.cookie != '') {
                    var cookies = document.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = jQuery.trim(cookies[i]);
                        // Does this cookie string begin with the name we want?
                        if (cookie.substring(0, name.length + 1) == (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }

            console.log('csrttoken: ', csrftoken)
            var csrftoken = getCookie('csrftoken');
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'upload', true);
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
            xhr.setRequestHeader("MyCustomHeader", "Put anything you need in here, like an ID");
            xhr.send(blob);
            count = 0
            xhr.onreadystatechange = function() {
                // console.log('xhr:', this.responseText, count);
                if(count === 1) {
                    li.appendChild(br);
                    li.appendChild(document.createTextNode(this.responseText))
                }
                count++;
            };

        // })
    
        //add the li element to the ol
        recordingsList.appendChild(li);
    }

    function stopRecording() {
        console.log("stopButton clicked");

        //disable the stop button, enable the record too allow for new recordings
        stopButton.disabled = true;
        recordButton.disabled = false;
        pauseButton.disabled = true;

        //reset button just in case the recording is stopped while paused
        pauseButton.innerHTML="Pause";
        
        //tell the recorder to stop the recording
        rec.stop();

        //stop microphone access
        gumStream.getAudioTracks()[0].stop();

        //create the wav blob and pass it on to createDownloadLink
        rec.exportWAV(createDownloadLink);
        
    }




    // $('#recordButton').on('click', function(e) {
    //     startRecording()
    // })
});
