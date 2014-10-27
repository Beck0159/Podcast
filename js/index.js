window.addEventListener("DOMContentLoaded", init);

//////////////////// Global Variables ///////////////
var networkState = null;
var searchURL = "";
var linkToGrab = "http://developer.android.com/assets/images/home/ics-android.png";
var locationToPlace = "file://sdcard/ics-android.png";
var foundDir = false;

function init(){
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
    // Now safe to use device APIs
	console.log("Device Ready!!");
	// Event listeners
	document.querySelector("#btn").addEventListener("touchstart", showPodcastPage);
	document.querySelector("#btn2").addEventListener("touchstart", showHomePage);
	document.addEventListener("offline", onOffline, false);
	document.addEventListener("online", onOnline, false);
    loadXML();//Just to test the loadXML function
    
    //var buttonToClick = document.querySelector("#downloadImage");
    //buttonToClick.addEventListener('click', downloadFileStart, false);
	
}
//////////////////  Page Changes ////////////////////////
function showPodcastPage(ev){
	ev.preventDefault();
	console.log('Go Podcast Page');
	document.querySelector('#podPage').className = "Active content";
	document.querySelector('#homePage').className = "notActive content";
}

function showHomePage(ev){
	ev.preventDefault();
	console.log('Go Home');
	document.querySelector('#podPage').className = "notActive1 content";
	document.querySelector('#homePage').className = "Active1 content";
	
}
//////////////////   Search //////////////////////
function captureForm(form){
	console.log('FORM');
	
	networkState = navigator.connection.type;
	
	if(networkState == "none"){
		// no connection
		alert('No coneection ' + networkState);
	}else{
		// connection
		alert('Connection ' + networkState);
	}
	
	var searchURL = form.search.value;
	console.log(searchURL);
	
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
	
}

///////////////////// TEST FOR DIRECTORY INPUT /////////////////////
function directorySequence(){
    var input = (document.querySelector("#input").value);
    checkDirectory(input);
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

///////////////////// Testing for Downloadfile (NOT IN USE) /////////////////////
function downloadFileStart(){
    downloadFile("http://developer.android.com/assets/images/home/ics-android.png","file://sdcard/ics-android.png");
}

///////////////////// Download a File /////////////////////

/****files are saved to /data/data/io.appname/
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
function loadXML() {
    console.log("Loading xml");
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "http://feeds.feedburner.com/ThrillingAdventureHour?fmt=xml", false);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
           if(xmlhttp.status == 200){
               console.log(xmlhttp.responseText);
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

////////////////// WORK IN PROGRESS//////////////////
function managePodcasts(pod){
/*TODO: 
- find better naming convention for podcast episodes?
- need to make localstorage object to save podcast properties
- localstorage object could have a boolean to say if files were successfully downloaded
- get thumbnail(s) and store them with podcasts
- implement localstorage checks instead of directoryexisting checks
*/
    
    
    
//------OBJECT TEMPLATE-------//
    //var pod = {title:"podcast", episodes:[{title:"ep1", duration:"1:00", thumb:"th.jpg", link:"link.mp3"},{title:"ep2", duration:"2:00", thumb:"th2.jpg", link:"link2.mp3"}]}
    
    console.log(pod.title);
    console.log(pod.episodes[0].title);
    console.log("about to check dir");
    
    if (!checkDirectory(pod.title)){
        createDirectory(pod.title);
        downloadFile(pod.episodes[0].link, (pod.title+"/episode1.mp3"));
        downloadFile(pod.episodes[1].link, (pod.title+"/episode2.mp3"));
    }
    
    else{
        alert("You already have this podcast");
    }
    
//USE THIS FOR LOCALSTORAGE
/*var testObject = { 'one': 1, 'two': 2, 'three': 3 };

// Put the object into storage
localStorage.setItem('testObject', JSON.stringify(testObject));

// Retrieve the object from storage
var retrievedObject = localStorage.getItem('testObject');

console.log('retrievedObject: ', JSON.parse(retrievedObject));*/
    
}