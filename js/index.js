/*TODO: 
- localstorage object could have a boolean to say if files were successfully downloaded
- what if one podcast downloads and the other fails
- handle download queue when device is offline
- will the download queue persist when app is terminated
- get thumbnail(s) and store them with podcasts
- find better naming convention for podcast episodes?
*/



window.addEventListener("DOMContentLoaded", init);

//////////////////// Global Variables ///////////////
var networkState = null;
var searchURL = "";
var linkToGrab = "http://developer.android.com/assets/images/home/ics-android.png";
var locationToPlace = "file://sdcard/ics-android.png";
var foundDir = false;
var downloadQueue = [];
var my_media = null;
var mediaTimer = null;


function init(){
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
    // Now safe to use device APIs
	console.log("Device Ready!!");
	
	//////////////////////// Event listeners /////////////////////////////
	document.querySelector("#backBTN").addEventListener("touchstart", showHomePage);
	document.querySelector("#play").addEventListener("touchend", playClicked);
	document.querySelector("#pause").addEventListener("touchend", pauseClicked);
	document.querySelector("#rewind").addEventListener("touchend", rewindClicked);
	document.querySelector("#fastForward").addEventListener("touchend", forwardClicked);
	document.addEventListener("offline", onOffline, false);
	document.addEventListener("online", onOnline, false);
   
	
	
    displayPodcasts();
    //var buttonToClick = document.querySelector("#downloadImage");
    //buttonToClick.addEventListener('click', downloadFileStart, false);
	
}
//////////////////  Page Changes ////////////////////////
function showPodcastPage(podNumber){

	console.log('Go Podcast Page');
	document.querySelector('#podPage').className = "Active content";
	document.querySelector('#homePage').className = "notActive content";
	
	displayPodcastPage(podNumber);
	
}

function showHomePage(ev){
	ev.preventDefault();
	console.log('Go Home');
	document.querySelector('#podPage').className = "notActive1 content";
	document.querySelector('#homePage').className = "Active1 content";
	document.querySelector('#podcastPageList').innerHTML = null;
	
}

/////////////////// Page Setup ////////////////////
function displayPodcastPage(podNumber){
	
	var retrievedObject = localStorage.getItem('podcastData');
    var podcastObject = JSON.parse(retrievedObject);
	
	
	for(var i = 0; i < podcastObject.podcasts[podNumber].episodes.length; i++){
            console.log(podcastObject.podcasts[podNumber].episodes[i].title);
			var podcastListItems = document.querySelector('#podcastPageList');
			var Podcasts = 	"<li class='table-view-cell media'>                                                                                                                             	<a class='navigate-right' id='btn"+i+"' onClick=''><img class='media-object pull-left' src='http://placehold.it/64x64' alt='Placeholder image for Argo's poster'/>                                                                                                                            <div class='media-body'>"+podcastObject.podcasts[podNumber].episodes[i].title+"</div></a></li>"
			podcastListItems.innerHTML += Podcasts;
        }
	
	initializeMedia("file:///storage/sdcard/Thrilling%20Adventure%20Hour/episode2.mp3");
	
}

function displayPodcasts(){
	console.log("display podcasts");
	if (localStorage.getItem('podcastData')){
		console.log('exists');
		
		//Clear existing data
		var podcastListItems = document.querySelector('#podcastList').innerHTML = null;
		
		//Display podcasts
		var retrievedObject = localStorage.getItem('podcastData');
        var podcastObject = JSON.parse(retrievedObject);
        
        for(var i = 0; i < podcastObject.podcasts.length; i++){
            console.log(podcastObject.podcasts[i].title);
			
			var podcastListItems = document.querySelector('#podcastList');
			var Podcasts = 	"<li class='table-view-cell media'>                                                                                                                             	<a class='navigate-right' id='btn"+i+"' onClick='showPodcastPage("+i+")'><img class='media-object pull-left' src='http://placehold.it/64x64' alt='Placeholder image for Argo's poster'/>                                                                                                                            <div class='media-body'>"+podcastObject.podcasts[i].title+"<p>2 Episodes Available</p></div></a></li>"
		podcastListItems.innerHTML += Podcasts;
		
		//document.querySelector("#btn"+i+"").addEventListener("touchstart", showPodcastPage);
		console.log("#btn"+i+" Event Listener Added");
        }
		
		
	}else{
		//Clear existing data
		var podcastListItems = document.querySelector('#podcastList').innerHTML = null;
		
		var podcastListItems = document.querySelector('#podcastList');
		var noPodcasts = 	"<li class='table-view-cell media'>                                                                                                                             	<a class='navigate-right' id='btn'>                                                                                                                            <div class='media-body'>No Podasts Found</div></a></li>"

		podcastListItems.innerHTML += noPodcasts;

	}
	
}

//////////////////   Search //////////////////////
function captureForm(form){
	console.log('FORM');
	
	networkState = navigator.connection.type;

    var searchURL = form.search.value;
	console.log(searchURL);
    
    // this if statement not working
	if(networkState == "none"){
		// no connection
		alert('No coneection ' + networkState);
        downloadQueue.push(searchURL);
	}else{
		// connection
		alert('Connection ' + networkState);
        loadXML(searchURL);
	}
	

	
}
///////////////////// Network Events /////////////////////

function onOffline() {
    // Handle the offline event
	networkState = navigator.connection.type;
	console.log('Offline ' + networkState);
	
}

function onOnline() {
    // Handle the offline event
	networkState = navigator.connection.type;
	console.log('Online ' + networkState);
    
    if (downloadQueue.length > 0){
        for(var i=0; i < downloadQueue.length; i++){
            loadXML(downloadQueue[i]);
        }
        
        downloadQueue = [];
    }	
}

///////////////////// Create a Directory /////////////////////
function createDirectory(input){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onRequestFileSystemSuccess, null); 

    function onRequestFileSystemSuccess(fileSystem) { 
        var entry=fileSystem.root; 
        entry.getDirectory(input, {create: true, exclusive: false}, onGetDirectorySuccess, onGetDirectoryFail); 
    } 

    function onGetDirectorySuccess(dir) { 
        console.log("Created dir "+dir.name); 
    } 

    function onGetDirectoryFail(error) { 
        console.log("Error creating directory "+error.code); 
    } 
}

///////////////////// Check if a Directory exists /////////////////////
function checkDirectory(input){

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onRequestFileSystemSuccess, null); 

    function onRequestFileSystemSuccess(fileSystem) { 
        var entry=fileSystem.root; 
        entry.getDirectory(input, {create: false, exclusive: false}, onGetDirectorySuccess, onGetDirectoryFail); 
    } 

    function onGetDirectorySuccess(dir) { 
        console.log("Found Directory");
        foundDir = true;
        console.log("Directory did exist");
    } 

    function onGetDirectoryFail(error) { 
        console.log("Did not find directory");
        foundDir = false;
        console.log("Directory did not exist");
        //createDirectory(input);
    } 
    
    if (foundDir){
        return true;
    }
    else{
        return false;
    }
}

///////////////////// Download a File /////////////////////

/****files are saved to /data/data/io.appname/podcastname
*/
function downloadFile(linkToGrab, locationToPlace){
    var localPath;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
             function onFileSystemSuccess(fileSystem){
                 fileSystem.root.getFile("dummy.html", {
                     create: true, exclusive: false
                 },

                function gotFileEntry(fileEntry){
                    var fileTransfer = new FileTransfer();
                    fileEntry.remove();
					
                    localPath = fileSystem.root.toURL() + locationToPlace;
                    fileTransfer.download(
                        linkToGrab,localPath,function(theFile){
                            console.log("download complete: " + theFile.toURI());
                            showLink(theFile.toURI());
                        },

                        function(error) {
                            console.log("download error source " + error.source);
                            console.log("download error target " + error.target);
                            console.log("error code: " + error.code);
                        }
                    );
                },fail
            );
        },fail
    );
}
function showLink(url){
    alert(url);
}
function fail(evt) {
    console.log(evt.target.error.code);
}

///////////////////// Fetch XML /////////////////////
function loadXML(link) {
    
    link = link + "?fmt=xml";
    console.log("Loading xml");
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", link, false);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
           if(xmlhttp.status == 200){
               //console.log(xmlhttp.responseText);
               parseXML(xmlhttp.responseText);
           }
           else if(xmlhttp.status == 400) {
              console.log('There was an error 400')
           }
           else {
               console.log('something else other than 200 was returned')
               console.log(xmlhttp.status);
           }
        }
    }
    xmlhttp.send();
}

///////////////////// Parse XML /////////////////////
function parseXML(txt) {
    var pod = {title:"", episodes:[{title:"", duration:"", thumb:"", link:""},{title:"", duration:"", thumb:"", link:""}]};
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(txt, "text/xml");
    console.log(xmlDoc);
    var itemList = xmlDoc.getElementsByTagName('item');
    
    pod.title = xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;
    pod.episodes[0].link = itemList[0].getElementsByTagName('origEnclosureLink')[0].childNodes[0].nodeValue;
    pod.episodes[0].title = itemList[0].getElementsByTagName('title')[0].childNodes[0].nodeValue;
    pod.episodes[0].duration = itemList[0].getElementsByTagName('duration')[0].childNodes[0].nodeValue;
    pod.episodes[1].link = itemList[1].getElementsByTagName('origEnclosureLink')[0].childNodes[0].nodeValue;
    pod.episodes[1].title = itemList[1].getElementsByTagName('title')[0].childNodes[0].nodeValue;
    pod.episodes[1].duration = itemList[1].getElementsByTagName('duration')[0].childNodes[0].nodeValue;
    //pod.episodes[0].thumb = 
    
    
    console.log("episode title: "+itemList[0].getElementsByTagName('title')[0].childNodes[0].nodeValue);
    console.log("episode duration: "+itemList[0].getElementsByTagName('duration')[0].childNodes[0].nodeValue);
    console.log("episode link: "+itemList[0].getElementsByTagName('origEnclosureLink')[0].childNodes[0].nodeValue);
    //console.log("Title: "+xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue);
    
    managePodcasts(pod);
   //downloadFile(episode1Link, podcastTitle);

}

////////////////// Manages Podcast Organization //////////////////
function managePodcasts(pod){
    
//------OBJECT TEMPLATE-------//
    //var pod = {title:"podcast", episodes:[{title:"ep1", duration:"1:00", thumb:"th.jpg", link:"link.mp3"},{title:"ep2", duration:"2:00", thumb:"th2.jpg", link:"link2.mp3"}]}
    
    console.log(pod.title);
    console.log(pod.episodes[0].title);
    console.log("about to check dir");
    
    if (!checkIfExists(pod.title)){
        createDirectory(pod.title);
        //downloadFile(pod.episodes[0].link, (pod.title+"/episode1.mp3"));
		downloadFile(pod.episodes[0].link, ("TAH/episode1.mp3"));
        downloadFile(pod.episodes[1].link, (pod.title+"/episode2.mp3"));
        savePodcastData(pod);
    }
    
    else{
        alert("You already have this podcast");
    }
}

//////////////// Checks if podcast exists ///////////////////////
function checkIfExists(title){

    var podExists = false;
    
    if (localStorage.getItem('podcastData')){
        var retrievedObject = localStorage.getItem('podcastData');
        var podcastObject = JSON.parse(retrievedObject);
        
        for(var i = 0; i < podcastObject.podcasts.length; i++){
            if (podcastObject.podcasts[i].title == title){
                podExists = true;
            }
        }
        
        if (podExists){
            return true;
        }
        
        else{
            return false;
        }
    }
    
    else{
        return false;
    }

}

/////////////// Saves podcast info to localstorage ///////////////////
function savePodcastData(pod){

    var retrievedObject = "";
    var podcastList = "";
    
    if (localStorage.getItem('podcastData')){
        retrievedObject = localStorage.getItem('podcastData');
        console.log("retrieved object successfully");
        podcastList = JSON.parse(retrievedObject);
        podcastList.podcasts.push(pod);
        console.log("pushed to array");
    }
    
    else{
        podcastList = {podcasts:[]};
        podcastList.podcasts.push(pod);
        console.log("created podcast list");
    }
    
    localStorage.setItem('podcastData', JSON.stringify(podcastList));
    console.log("set local storage successfully");
    
    displayPodcasts();
}

///////////////  Get Podcast Data Object /////////////////
function getPod()
{
    
    var retrievedObject;
    var podcastList = null;
    
    if (localStorage.getItem('podcastData')){
        retrievedObject = localStorage.getItem('podcastData');
        console.log("retrieved object successfully");
        podcastList = JSON.parse(retrievedObject);
    }
    
    else{
        console.log("no podcast data");
    }
    
    return podcastList;
}

///////////////////////////// Media Player Events ////////////////////
function initializeMedia(src){
	
	my_media = new Media(src, onSuccess, onError);
	
}
function playClicked(ev){
	ev.preventDefault();
	//change play button into pause button
	document.querySelector("#play").className = "icon icon-play pull-left spacer invisable";
	document.querySelector("#pause").className = "icon icon-pause spacer";	
	//console.log('Play Podcast');
	
	//get title of podcast this being played
	
	playAudio();
	
}

function pauseClicked(ev){
	ev.preventDefault();
	//change play button into pause button
	document.querySelector("#pause").className = "icon icon-pause pull-left spacer invisable";
	document.querySelector("#play").className = "icon icon-play pull-left spacer";	
	console.log('Pause Pressed');
	
	pauseAudio();

}

function rewindClicked(ev){
	ev.preventDefault();
	console.log('Rewind Pressed');
	
	// Update media position every second
   
        // get media position
        my_media.getCurrentPosition(
            // success callback
            function(position) {
                if (position > -1) {
                    console.log((position) + " sec");
					    var rewind = ((position*1000)-10000);
						console.log(rewind);
						my_media.seekTo(rewind);
                }
            },
            // error callback
            function(e) {
                console.log("Error getting pos=" + e);
            }
        );
  
	
}

function forwardClicked(ev){
	ev.preventDefault();
	
	// get media position
        my_media.getCurrentPosition(
            // success callback
            function(position) {
                if (position > -1) {
                    console.log((position) + " sec");
					    var rewind = ((position*1000)+30000);
						console.log(rewind);
						my_media.seekTo(rewind);
                }
            },
            // error callback
            function(e) {
                console.log("Error getting pos=" + e);
            }
        );
	
	
	
}

function playAudio() {
	console.log("Play Pod");
	// Create Media object from src
	
	// Play audio
	my_media.play();
	
		mediaTimer = setInterval(function() {
        // get media position
        my_media.getCurrentPosition(
            // success callback
            function(position) {
				
					var dur = my_media.getDuration();
					var durMil = dur * 1000;
					console.log(durMil+" duration");
				
             		var positionMil = position * 1000;
                    console.log((positionMil) + " Milisec");
					
					if(positionMil < durMil){
					
						console.log('Less then duration'+durMil);
					}
					else{
						alert('Done Playing');	
						//removeFile("Thrilling Adventure Hour",2);
						clearInterval(mediaTimer);
						removeFile();
						//break;
					}   
            },
            // error callback
            function(e) {
                console.log("Error getting pos=" + e);
            }
        );
    }, 1000);
	
}

// Pause audio
function pauseAudio() {
	if (my_media) {
		 my_media.pause();
		 clearInterval(mediaTimer);
	}
}

function seekPositon(seconds) {
      if (Player.media === null)
         return;
 
      Player.media.seekTo(seconds * 1000);
      Player.updateSliderPosition(seconds);
   }

function removeFile(){
	
 console.log('Hello');	
}
////////////////////////// Media Player Calls //////////////////////
function onSuccess() {
            console.log("playAudio():Audio Success");
        }
function onError(error) {
	alert('code: '    + error.code    + '\n' +
		  'message: ' + error.message + '\n');
}