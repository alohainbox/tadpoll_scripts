(function() {

    // Localize jQuery variable
    var jQuery;
    var winjqundef = false;

    //Local vs release paths
    //var run_mode = "local"
    var path_local = "../dist/";
    var release_version = "0.1.2";
    var path_release = "https://cdn.jsdelivr.net/gh/np-ally/tadpoll_scripts@" + release_version + "/dist/";
    var search_path_release = "np-ally/tadpoll_scripts@" + release_version + "/dist/";
    
    if (window.location.protocol === "file:") {var path = path_local; var search_path = '';}
    else { path = path_release; search_path = search_path_release; }

    /******** Load jQuery if not present *********/
    if (window.jQuery === undefined) { winjqundef=true; }
    if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.10.1') {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type","text/javascript");
        script_tag.setAttribute("src",
            "https://code.jquery.com/jquery-1.10.1.min.js");
        if (script_tag.readyState) {
          script_tag.onreadystatechange = function () { // For old versions of IE
              if (this.readyState == 'complete' || this.readyState == 'loaded') {
                  scriptLoadHandler();
              }
          };
        } else {
          script_tag.onload = scriptLoadHandler;
        }
        // Try to find the head, otherwise default to the documentElement
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    } else {
        // The jQuery version on the window is the one we want to use
        jQuery = window.jQuery;
        main();
    }
    
    /******** Called once jQuery has loaded ******/
    function scriptLoadHandler() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        if (winjqundef) { jQuery = window.jQuery; }
        else { jQuery = window.jQuery.noConflict(true); }
        // Call our main function
        main(); 
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
    function loadcss(src) {
        var css_link = $("<link>", { 
            rel: "stylesheet", 
            type: "text/css", 
            href: src 
        });
        css_link.appendTo('head');
    }

    /******** Our main function ********/
    function main() { 
        jQuery(document).ready(function($) {  

            var cdata = getParams(search_path + "main.js");
            var pageId = "c"+cdata.id+"v"+cdata.video;
            //console.log(cdata, pageId);
            getUserParams("id=" + cdata.id, "customers")
            .then(custParams => {
            //console.log(window.location.hostname);
                if (custParams[0] === undefined) {
                    alert('Error: Unidentified User' );
                }
                else{
                    //console.log(custParams);
                    var vidindex;
                    for (let i=0; i<custParams[0].fields['video_id (from video_id)'].length; i++){
                        if (custParams[0].fields['video_id (from video_id)'][i]==cdata.video){vidindex=i;}
                    }
                    if (vidindex == undefined){alert( 'Error: video is not in customer list');}
                    getUserParams("id=" + eval("custParams[0].fields['video_id (from video_id)']["+vidindex+"]"), "videos")
                    .then(vidParams => {
                        //console.log(vidParams[0]);
                    if (vidParams[0].fields.domain != window.location.hostname && vidParams[0].fields.domain != "test") {
                        alert( 'Error: Incorrect User Domain' );
                        console.log('Invalid domain', window.location.hostname);
                    }
                    else {
                        /*****Load video and form scripts****/
                        loadcss(path + "player.css");
                        var video_path;
                        if (vidParams[0].fields.video_type == "youtube"){
                            video_path = path + "youtube_demo.js?id=" + vidParams[0].fields.id + "&video=" + 
                            vidParams[0].fields.video + "&numElements=" + vidParams[0].fields.elements.length + "&cid=" + custParams[0].fields.id;
                        }
                        else if (vidParams[0].fields.video_type == "vimeo"){
                            video_path = path + "vimeo_td.js?id=" + vidParams[0].fields.id + "&video=" + 
                            vidParams[0].fields.video + "&numElements=" + vidParams[0].fields.elements.length + "&cid=" + custParams[0].fields.id;
                        }
                        else {alert( 'Error: unsupported video player');}
                        var filterFormula = "OR(";
                        for (let r = 0; r<vidParams[0].fields.elements.length; r++){
                            filterFormula = filterFormula + "id=" + vidParams[0].fields['id (from elements)'][r];
                            if (r==vidParams[0].fields.elements.length-1) {filterFormula = filterFormula + ")"}
                            else {filterFormula = filterFormula + ","}
                        }
                        //console.log(filterFormula);
                        getUserParams(filterFormula, "elements")
                        .then(elParams => {
                            //console.log(elParams, vidParams[0].fields['id (from elements)']);
                            var ind;
                            let order = [];
                            for (let i=0; i<vidParams[0].fields['id (from elements)'].length; i++) {    
                                //requires id in element table to match row id
                                ind=undefined;
                                for(let y=0; y<elParams.length; y++){
                                    if (vidParams[0].fields['id (from elements)'][i] == elParams[y].fields.id) {
                                        ind=y;
                                        order[i] = y;
                                        break;
                                    }
                                }
                                video_path = video_path + 
                                "&element_" + String(i) + "_type=" + elParams[ind].fields.type +
                                "&element_" + String(i) + "_insert=" + elParams[ind].fields.insert;
                                //console.log("create video path",ind, video_path);
                            }
                            //console.log(video_path, order)
                            loadScript(video_path, "text/javascript")
                            .then(() => {
                                for (const [i, value] of order.entries()){
                                    if (!checkdupcss(elParams[value].fields.css)){
                                        loadcss(elParams[value].fields.css);
                                    }
                                    if (elParams[value].fields.type == "form"){
                                        $("#tadpoll_"+pageId).append("<div class='loginPopup' id='tadpoll_login" + pageId + "f" + String(i) + "'></div>");
                                        $("#tadpoll_login" + pageId + "f" + String(i)).load(elParams[value].fields.html, function(){
                                            $("#tadpoll_login" + pageId +"f" +  String(i) + "> div").attr("id", "tadpoll_form" + pageId + "f" + String(i));
                                            if (elParams[value].fields.skipbtnenable == "1") {
                                                $("#tadpoll_login" + pageId + "f" + String(i) + "> button").attr("onclick", "closeForm('" + pageId+"f" + String(i)+"')");
                                            }
                                            else { 
                                                $("#tadpoll_login" + pageId + "f" + String(i) + "> button").empty();
                                            }
                                            $("#tadpoll_login" + pageId + "f" + String(i) + "> button").attr("id", "tadpoll_button" + pageId + "f" + String(i));
                                            $("#tadpoll_form" + pageId + "f" + String(i) + "> div > h2").append(elParams[value].fields.title);
                                            $("#tadpoll_form" + pageId + "f" + String(i) + "> div > input").eq(0).attr("id", "data1form" + pageId + "f" + String(i));
                                            $("#tadpoll_form" + pageId + "f" + String(i) + "> div > input").eq(1).attr("id", "data2form" + pageId + "f" + String(i));
                                            $("#tadpoll_form" + pageId + "f" + String(i) + "> div > label > p").eq(0).append(elParams[value].fields.question1);
                                            $("#tadpoll_form" + pageId + "f" + String(i) + "> div > input").eq(0).attr("placeholder", elParams[value].fields.placeholder1);
                                            $("#tadpoll_form" + pageId + "f" + String(i) + "> div > label > p").eq(1).append(elParams[value].fields.question2);
                                            $("#tadpoll_form" + pageId + "f" + String(i) + "> div > input").eq(1).attr("placeholder", elParams[value].fields.placeholder2);
                                            $("#tadpoll_form" + pageId + "f" + String(i) + "> div > button").eq(0).attr("id", "tadpoll_submit" + pageId + "f" +String(i));
                                            $("#tadpoll_form" + pageId + "f" + String(i) + "> div > button").eq(0).attr("onclick", "closeForm('" + pageId + "f" + String(i)+"')");
                                            $("#tadpoll_form" + pageId + "f" + String(i) + "> div > button").eq(0).append(elParams[value].fields.btntext);
                                        });
                                    }
                                    else if(elParams[value].fields.type =="iframe") {
                                        $("#tadpoll_" + pageId).append("<div class='iframePopup' id='tadpoll_iframe" + pageId + "f" + String(i) + "'></div>");
                                        $("#tadpoll_iframe" + pageId + "f" + String(i)).load(elParams[value].fields.html, function(){
                                            $("#tadpoll_iframe" + pageId + "f" + String(i) + "> iframe").attr("id", "tadpoll_iframeform" + pageId + "f" + String(i));
                                            $("#tadpoll_iframe" + pageId + "f" + String(i) + "> iframe").attr("src", elParams[value].fields.src); 
                                            $("#tadpoll_iframe" + pageId + "f" + String(i) + "> button").attr("id", "tadpoll_iframebutton" + pageId + "f" + String(i));
                                            $("#tadpoll_iframe" + pageId + "f" + String(i) + "> button").attr("onclick", "closeiframe('"+ pageId + "f" + String(i)+"')");
                                        });
                                    }
                                }
                            });
                        }); 
                    }
                    });
                }
            });
        });
    }
    // Extract "GET" parameters from a JS include querystring

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
function checkdupcss(css_name) {
    // Find all script tags
    var styles = document.getElementsByTagName("link");
    var dup = false;
    // Look through them trying to find ourselves
    for(var i=0; i<styles.length; i++) {
        if(styles[i].href.indexOf(css_name) > -1) {
            dup = true;
            break;
        }
    }
    return dup;
}

function getUserParams(exp, table) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var requestOptions = {
        method: "get",
        headers: myHeaders,
        redirect: "follow",
        
    };
    
    //var cid = Object.values(id);
    return fetch("https://v1.nocodeapi.com/davegtad/airtable/rQaerrGsnnHzwllE?tableName="+table+"&api_key=GJwptPIUjuDsMsOsz&filterByFormula=" + exp, requestOptions)
    .then(response => response.json())
    .then(result => result.records)
    .catch(error => console.log('error', error));
}

})();