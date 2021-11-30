var release_version = "0.1.3";
var search_path_release = "np-ally/tadpoll_scripts@" + release_version + "/dist/";
if (window.location.protocol === "file:") {var search_path = '';}
else { search_path = search_path_release; }

//get customer id
var custParams = getParams(search_path + "vimeo_td.js");
//console.log("id", custParams);
var pageId = "c" + custParams.cid + "v" + custParams.id;
//Add container elements to format video
var playeroptions = {
    maxwidth: 500,
    maxheight: 400,
    title: false,
    pip: false,
    autoplay: false
  };
var playeroptstring = "?";
var pindex = 1;
for(let key in playeroptions){
    playeroptstring = playeroptstring + key + "=" + playeroptions[key];
    if (pindex < Object.keys(playeroptions).length){ playeroptstring = playeroptstring + "&";}
    pindex++;
}
//console.log(playeroptstring);
$("#tadpoll_" + pageId).append("<div class='playerPopup'><iframe class='playerwin' id='player" + pageId + 
"' src=https://player.vimeo.com/video/"+ custParams.video + playeroptstring + "' frameborder='0'></iframe></div>");

// This code loads the IFrame Player API code asynchronously.
var player, playerframe;
loadScript("https://player.vimeo.com/api/player.js", "text/javascript")
.then(() => setupvid());

var done_pause = false;
var timep = 0;
var pause_source_func = false;
var currentplay = 0;
var playtime = eval("custParams.element_" + String(currentplay) + "_insert");

function setupvid() {
    playerframe = document.getElementById("player" + pageId);
    player = new Vimeo.Player(playerframe);
    player.on('timeupdate', onTimeEvent);
    player.on('pause', onPauseEvent);
}

//console.log("playtime", playtime);

var onTimeEvent = function onTimeStateChange(event) {
        timep = Math.round(event.seconds);
        //console.log("OnTime", playtime, timep, (playtime-timep)*1000, done_pause);
        
        if (timep >= playtime && !done_pause){ 
            pauseVideo();
            //console.log("pause in time event"); 
        }
}

var onPauseEvent = function onPauseStateChange(event){    
        timep = Math.round(event.seconds);
        //console.log("paused & done", timep, playtime, pause_source_func, done_pause);
            if (timep < playtime && pause_source_func) {
                pause_source_func = false;
                playVideo();
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
                else if (eval("custParams.element_" + String(currentplay) + "_type")=="iframe_toggle"){
                    openiframetoggle(currentplay);
                    //console.log("open iframe", currentplay, timep, pause_source_func);
                }
                done_pause = true;
            }
}

function pauseVideo() {
    //console.log("pausefunction");
    player.pause();
    pause_source_func = true;
}
function playVideo() {
    //console.log("playfunction");
    player.play();
}

function openForm(num) {
    document.getElementById("tadpoll_form" + pageId + "f" + String(num)).style.display = "block";
    document.getElementById("tadpoll_button" + pageId + "f" + String(num)).style.display = "block";
}
function openiframe(num) {
    document.getElementById("tadpoll_iframeform" + pageId + "f" + String(num)).style.display = "block";
    document.getElementById("tadpoll_iframebutton" + pageId + "f" + String(num)).style.display = "block";
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
        done_pause = false; 
        currentplay++;
        playtime = eval("custParams.element_" + String(currentplay) + "_insert");
    }
    playVideo();
}

function closeiframe(id) {
    document.getElementById("tadpoll_iframeform" + id).style.display = "none";
    document.getElementById("tadpoll_iframebutton" + id).style.display = "none";
    const playid = id.split('f')[1];
    pauseVideo();
    pause_source_func = false;
    if (playid < custParams.numElements-1) { 
        done_pause = false; 
        currentplay++;
        playtime = eval("custParams.element_" + String(currentplay) + "_insert");
    }
    //console.log("iframeclose", id, currentplay, done);
    playVideo();
}

function closeiframetoggle(id) {
    document.getElementById("tadpoll_iframeform" + id).style.display = "none";
    const playid = id.split('f')[1];
    $("#tadpoll_iframebutton" + id).text(clnTxt("custParams.element_" + playid + "_toggleBtnTextOpen"));
    $("#tadpoll_iframebutton" + id).attr("onclick", "openiframetoggle('"+ playid +"')");
    document.getElementById("tadpoll_iframebutton" + id).className = "btn_close";
    
    
    pauseVideo();
    pause_source_func = false;
    if (playid < custParams.numElements-1 && done_pause) { 
        done_pause = false; 
        currentplay++;
        playtime = eval("custParams.element_" + String(currentplay) + "_insert");
    }
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
function loadScript(src, type) {
    return new Promise(function(resolve, reject) {
        let script = document.createElement('script');
        script.type = type;
        script.src = src;
    
        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`Script load error for ${src}`));
    
        document.head.append(script);
      });
}
