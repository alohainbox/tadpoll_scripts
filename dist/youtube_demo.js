    var release_version = "0.1.5";
    var search_path_release = "np-ally/tadpoll_scripts@" + release_version + "/dist/";
    if (window.location.protocol === "file:") {var search_path = '';}
    else { search_path = search_path_release; }

    //get customer id
    var custParams = getParams(search_path + "youtube_demo.js");
    //console.log("id", custParams);
    var pageId = "c" + custParams.cid + "v" + custParams.id;
    //Add container elements to format video
    $("#tadpoll_" + pageId).append("<div class='playerPopup'><div class='playerwin' id='player'></div></div>");
    
    
 // This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script')
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

  // This function creates an <iframe> (and YouTube player)
  // after the API code downloads.
    var player;
    function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
        videoId: custParams.video,
        playerVars: {
            'playsinline' : 1, 
            'controls' : 1,
            'rel' : 0,
            'modestbranding' : 1,
            'disablekb' : 1,
            'fs' : 0,
            'autoplay' : 0
         },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onPlaybackRateChange': onPlayerRateChange
        }
        });
    }

  // The API will call this function when the video player is ready.
    function onPlayerReady(event) {
    event.target.playVideo();
    }

  //The API will call this function when the video player rate changes.
    var playbackrate = 1;
    function onPlayerRateChange(event) {
        playbackrate = event.data;
        //console.log("playbackrate", playbackrate)
    }
    
  // The API calls this function when the player's state changes.
    var done = false;
    var done_pause = false;
    var timep = 0;
    var pause_source_func = false;
    var currentplay = 0;
    var playtime = eval("custParams.element_" + String(currentplay) + "_insert");
    //console.log("playtime", playtime);
    
    
    function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
            timep = Math.round(player.getCurrentTime());
            //console.log(playtime, timep, (playtime-timep)*1000, done_pause);
            
            if (timep >= playtime && !done_pause){ 
                if (eval("custParams.element_" + String(currentplay) + "_type")!="iframe_toggle"){
                    pauseVideo();
                }
                //console.log("pause in playing"); 
            }
            else { 
                //console.log("set time out in playing to ", ((playtime-timep)*1000)/playbackrate)
                if (eval("custParams.element_" + String(currentplay) + "_type")!="iframe_toggle"){
                    setTimeout(pauseVideo, ((playtime-timep)*1000)/playbackrate);
                }
                else if (eval("custParams.element_" + String(currentplay) + "_type")=="iframe_toggle"){
                    //console.log("open iframebutton", currentplay, timep, playtime);
                    setTimeout(openiframebutton, ((playtime-timep)*1000)/playbackrate, currentplay);
                } 
            }
            done = true;
        }
        if (event.data == YT.PlayerState.PAUSED && done) {
            timep = Math.round(player.getCurrentTime());
            //console.log("paused & done", timep, playtime, pause_source_func, done_pause);
                if (timep < playtime && !pause_source_func) {
                    //console.log("set done to false")
                    done = false;
                }
                else if (timep < playtime && pause_source_func) {
                    pause_source_func = false;
                    playVideo();
                    done = false;
                    //console.log("pause source")
                }
                else if (timep >= playtime && !done_pause) {
                    if (eval("custParams.element_" + String(currentplay) + "_type")=="form"){
                        openForm(currentplay);
                        //console.log("open form", currentplay, timep, pause_source_func);
                    }
                    else if (eval("custParams.element_" + String(currentplay) + "_type")=="iframe"){
                        openiframe(currentplay);
                        //console.log("open iframe", currentplay, timep, pause_source_func);
                    }
                    
                    done_pause = true;
                    done = false;
                }
        }
    }
    function pauseVideo() {
        player.pauseVideo();
        pause_source_func = true;
    }
    function playVideo() {
        player.playVideo();
    }
    function openForm(num) {
        document.getElementById("tadpoll_form" + pageId + "f" + String(num)).style.display = "block";
        document.getElementById("tadpoll_button" + pageId + "f" + String(num)).style.display = "block";
    }
    function openiframe(num) {
        document.getElementById("tadpoll_iframeform" + pageId + "f" + String(num)).style.display = "block";
        document.getElementById("tadpoll_iframebutton" + pageId + "f" + String(num)).style.display = "block";
    }
    
    function openiframebutton(num) {
        $("#tadpoll_iframe" + pageId + "f" + String(num) + "> button").text(clnTxt("custParams.element_" + String(num) + "_toggleBtnTextOpen"));
        $("#tadpoll_iframe" + pageId + "f" + String(num) + "> button").attr("onclick", "openiframetoggle('"+ num + "')");
        document.getElementById("tadpoll_iframebutton" + pageId + "f" + String(num)).style.display = "block";
        document.getElementById("tadpoll_iframebutton" + pageId + "f" + String(num)).className = "btn_close";

        if (num < custParams.numElements-1) {
            done=false; 
            done_pause = false; 
            currentplay++;
            playtime = eval("custParams.element_" + String(currentplay) + "_insert");
        }
        else {done = true;}
    }

    function openiframetoggle(num) {
        pauseVideo();
        pause_source_func = false;
        document.getElementById("tadpoll_iframeform" + pageId + "f" + String(num)).style.display = "block";
        $("#tadpoll_iframe" + pageId + "f" + String(num) + "> button").text(clnTxt("custParams.element_" + String(num) + "_toggleBtnTextClose"));
        $("#tadpoll_iframe" + pageId + "f" + String(num) + "> button").attr("onclick", "closeiframetoggle('"+ pageId + "f" + String(num) +"')");
        document.getElementById("tadpoll_iframebutton" + pageId + "f" + String(num)).style.display = "block";
        document.getElementById("tadpoll_iframebutton" + pageId + "f" + String(num)).className = "btn_fs";
    }

    function clnTxt(txt){
        var newtxt = eval(txt).replace(/%20/g, " ");
        return newtxt;
    }

    var record_id = "new";
    function closeForm(id) {
        document.getElementById("tadpoll_form"+id).style.display = "none";
        document.getElementById("tadpoll_button"+id).style.display = "none";
        data1 = document.getElementById("data1form" + id).value;
        data2 = document.getElementById("data2form" + id).value;
        const playid = id.split('f')[1];
        var data1_key = "data1form" + playid;
        var data2_key = "data2form" + playid;
        var data_obj = {};
        if (record_id == "new") {
            data_obj[data1_key] = data1;
            data_obj[data2_key] = data2;
            data_obj["customer_id"]=custParams.cid;
            data_obj["video_id"]=custParams.id;
            saveForm(data_obj, "customerData")
            .then(record => {
                record_id = record[0].id; 
            //console.log(record, record[0].id, record_id);
            });
        }
        else {
            data_obj["id"] = record_id;
            data_obj["fields"]={};
            data_obj["fields"][data1_key] = data1;
            data_obj["fields"][data2_key] = data2;
            data_obj["fields"]["customer_id"]=custParams.cid;
            data_obj["fields"]["video_id"]=custParams.id;
            //console.log(data_obj, data1_key, data2_key);
            updateForm(data_obj, "customerData");
        }
        pauseVideo();
        pause_source_func = false;
        if (playid < custParams.numElements-1) {
            //console.log("set done to false, done_form", currentplay)
            done=false;
            done_pause = false; 
            currentplay++;
            playtime = eval("custParams.element_" + String(currentplay) + "_insert");
        }
        else {done = true;}
        playVideo();
    }
    
    function closeiframe(id) {
        document.getElementById("tadpoll_iframeform" + id).style.display = "none";
        document.getElementById("tadpoll_iframebutton" + id).style.display = "none";
        const playid = id.split('f')[1];
        pauseVideo();
        pause_source_func = false;
        if (playid < custParams.numElements-1) {
            done=false; 
            done_pause = false; 
            currentplay++;
            playtime = eval("custParams.element_" + String(currentplay) + "_insert");
        }
        else {done = true;}
        //console.log("iframeclose", id, currentplay, done);
        playVideo();
    }

    function closeiframetoggle(id) {
        document.getElementById("tadpoll_iframeform" + id).style.display = "none";
        const playid = id.split('f')[1];
        $("#tadpoll_iframebutton" + id).text(clnTxt("custParams.element_" + playid + "_toggleBtnTextOpen"));
        $("#tadpoll_iframebutton" + id).attr("onclick", "openiframetoggle('"+ playid +"')");
        document.getElementById("tadpoll_iframebutton" + id).className = "btn_close";
        
        //console.log("iframeclose", id, currentplay, done);
        playVideo();
    }
    
    function saveForm(data_obj, table) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: "post",
            headers: myHeaders,
            redirect: "follow",
            body: JSON.stringify([data_obj])
        };
        //console.log(requestOptions);
        return fetch("https://v1.nocodeapi.com/davegtad/airtable/rQaerrGsnnHzwllE?tableName="+table+"&api_key=GJwptPIUjuDsMsOsz", requestOptions)
        .then(response => response.json())
        .then(result => result)
        .catch(error => console.log('error', error));
    }
    function updateForm(data_obj, table) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: "put",
            headers: myHeaders,
            redirect: "follow",
            body: JSON.stringify([data_obj])
        };
    
        fetch("https://v1.nocodeapi.com/davegtad/airtable/rQaerrGsnnHzwllE?tableName="+table+"&api_key=GJwptPIUjuDsMsOsz", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
    }
    
    function getParams(script_name) {
        // Find all script tags
        var scripts = document.getElementsByTagName("script");
        // Look through them trying to find ourselves
        for(var i=0; i<scripts.length; i++) {
            if(scripts[i].src.indexOf("/" + script_name) > -1) {
            // Get an array of key=value strings of params
                var pa = scripts[i].src.split("?").pop().split("&");
                // Split each key=value into array, the construct js object
                var p = {};
                for(var j=0; j<pa.length; j++) {
                    var kv = pa[j].split("=");
                    p[kv[0]] = kv[1];
                }
                return p;
            }
        }
        // No scripts match
        return {};
    }
  