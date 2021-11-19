(function() {

    // Localize jQuery variable
    var jQuery;
    var winjqundef = false;

    //Local vs release paths
    //var run_mode = "local"
    var path_local = "../dist/";
    var release_version = "0.0.1";
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
    function loadhtml(src, id) {
        return new Promise(function(resolve, reject){
            
        });
    }

    /******** Our main function ********/
    function main() { 
        jQuery(document).ready(function($) {  

            var id = getParams(search_path + "main.js");
            getUserParams(id)
            .then(custParams => {
            //console.log(window.location.hostname);
                if (custParams === undefined) {
                    alert('Error: Unidentified User' );
                }
                else if (custParams.fields.domain != window.location.hostname && custParams.fields.domain != "test") {
                    alert( 'Error: Incorrect User Domain' );
                    console.log('Invalid domain', window.location.hostname);
                }
                else {
                    /*****Load video and form scripts****/
                    loadcss(path + "player.css");
                    var video_path = path + "youtube_demo.js?id=" + custParams.fields.customer_id + "&video=" + 
                    custParams.fields.video + "&numElements=" + custParams.fields.numElements;
                    for (let r = 1; r<=custParams.fields.numElements; r++){
                        video_path = video_path + 
                        "&element_" + String(r) + "_type=" + eval("custParams.fields.element_" + String(r) + "_type") +
                        "&element_" + String(r) + "_insert=" + eval("custParams.fields.element_" + String(r) + "_insert");
                    }
                    //console.log(video_path)
                    loadScript(video_path, "text/javascript")
                    .then(script => {
                        for (let i=1; i<=custParams.fields.numElements; i++){
                            loadcss(eval("custParams.fields.element_" + String(i) + "_css"));
                            if (eval("custParams.fields.element_" + String(i) + "_type")=="form"){
                                $("#tadpoll1234").append("<div class='loginPopup' id='tadpoll_login" + String(i) + "'></div>");
                                $("#tadpoll_login" + String(i)).load(eval("custParams.fields.element_" + String(i) + "_html"), function(){
                                    $("#tadpoll_login" + String(i) + "> div").attr("id", "tadpoll_form" + String(i));
                                    $("#tadpoll_form" + String(i) + "> button").attr("id", "tadpoll_button" + String(i));
                                    $("#tadpoll_form" + String(i) + "> button").attr("onclick", "closeForm("+String(i)+")");
                                    $("#tadpoll_form" + String(i) + "> div > input").eq(0).attr("id", "data1form" + String(i));
                                    $("#tadpoll_form" + String(i) + "> div > input").eq(1).attr("id", "data2form" + String(i));
                                    $("#tadpoll_form" + String(i) + "> div > button").eq(0).attr("id", "tadpoll_submit" + String(i));
                                    $("#tadpoll_form" + String(i) + "> div > button").eq(0).attr("onclick", "closeForm("+String(i)+")");
                                });
                            }
                            else if(eval("custParams.fields.element_" + String(i) + "_type")=="iframe") {
                                $("#tadpoll1234").append("<div class='iframePopup' id='tadpoll_iframe" + String(i) + "'></div>");
                                $("#tadpoll_iframe" + String(i)).load(eval("custParams.fields.element_" + String(i) + "_html"), function(){
                                    $("#tadpoll_iframe" + String(i) + "> iframe").attr("id", "tadpoll_iframeform" + String(i));
                                    $("#tadpoll_iframe" + String(i) + "> iframe").attr("src", eval("custParams.fields.element_" + String(i) + "_src"));
                                    $("#tadpoll_iframe" + String(i) + "> button").attr("id", "tadpoll_iframebutton" + String(i));
                                    $("#tadpoll_iframe" + String(i) + "> button").attr("onclick", "closeiframe("+String(i)+")");
                                });
                            }
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

function getUserParams(id) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var requestOptions = {
        method: "get",
        headers: myHeaders,
        redirect: "follow",
        
    };
    
    var cid = Object.values(id);
    return fetch("https://v1.nocodeapi.com/davegtad/airtable/rQaerrGsnnHzwllE?tableName=Table 3&api_key=GJwptPIUjuDsMsOsz&filterByFormula=customer_id=" + cid, requestOptions)
    .then(response => response.json())
    .then(result => result.records[0])
    .catch(error => console.log('error', error));
}

})();