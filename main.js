const cors = "https://cors-anywhere.herokuapp.com/";
//const cors = "http://localhost:8080/";

var youtubeAudio = document.getElementById('youtube');
var videoID = "";

document.querySelector('.submit').addEventListener('click', function () {
    videoID = document.querySelector('.input input').value.replace('https://youtu.be/', '');
    document.querySelector('.input').classList.add('hide');
    document.querySelector('audio').classList.remove('hide');
    start();
});

function start() {
    fetch(cors + "https://www.youtube.com/get_video_info?video_id=" + videoID).then(response => {
        if (response.ok) {
            response.text().then(ytData => {

                // parse response to find audio info
                var ytData = parse_str(ytData);
                var getAdaptiveFormats = JSON.parse(ytData.player_response).streamingData.adaptiveFormats;
                var findAudioInfo = getAdaptiveFormats.findIndex(obj => obj.audioQuality);

                // get the URL for the audio file
                var audioURL = getAdaptiveFormats[findAudioInfo].url;

                // update the <audio> element src
                youtubeAudio.src = audioURL;

            }).catch(() => { window.location.reload(); }).then(() => {
                setTimeout(() => {
                    console.log(youtubeAudio.duration)
                    if (isNaN(youtubeAudio.duration)) {
                        window.location.reload();
                    }
                }, 1000)
            });
        } else { window.location.reload(); }
    })

    function parse_str(str) {
        return str.split('&').reduce(function (params, param) {
            var paramSplit = param.split('=').map(function (value) {
                return decodeURIComponent(value.replace('+', ' '));
            });
            params[paramSplit[0]] = paramSplit[1];
            return params;
        }, {});
    }

    youtubeAudio.addEventListener('play', function (e) {
        play(videoID, e.target);
        document.querySelector('.controls').style.opacity = '0';
    }, { once: true });

    function play(vid, target) {
        const request = new Request(`https://video.google.com/timedtext?lang=en&v=${vid}`);

        fetch(request).then(res => res.text()).then(text => {
            var con = document.createElement('div');
            con.innerHTML = text;
	
			try {
				var subs = con.querySelector('transcript').querySelectorAll('text');
			} catch {window.location.reload();}
            

            subs.forEach(sub => {
                sub.innerText = sub.innerText.replace(/(&quot\;)/g, "\"").replace(/&#39;/g, "'");
            });

            var subCounter = 0;

            setInterval(function () {
                if (target.currentTime > subs[subCounter].attributes.start.value) {
                    document.body.appendChild(subs[subCounter]);
                    document.body.appendChild(document.createElement('br'));
                    subCounter++;
                    window.scrollBy(0, 1000);
                }
            }, 10);
        });
    }
}

