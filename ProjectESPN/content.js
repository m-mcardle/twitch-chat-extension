// Matthew McArdle
// July 8th, 2021
// Chrome extension for adding Twitch Chat into live videos on F1tv
// 
// This script functions as a set of dominoes for the most part due to the asyncronus nature of the storage requests through Chrome.
// After one set/get succeeds it will invoke the next step in validating or implementing the iFrame into the correct video container.
// Currently this supports only F1tv.formula1.com but I plan to implement it for ESPN+ as well
// The user can turn the chat implementation on/off through using the slider that is in the extension's popup
// This will connect to the Twitch account I made specifically for this project livechatf1 (I also have LiveChatUFC)
// TODO: 
// -Figure out VPN to set up ESPN+ 
// -Find how their video player is named/located make the code variable based on their current website F1/ESPN
// DONE! -Going to try and embed button into the screen to turn chat off and on 

var checkExist = setInterval(checkForVideo, 1000); // start loop to scan the page for the video container, check every second
var loopCount = 0; // counter for avoiding unneccesary requests if the container doesn't exist
var currentStatus = false;

chrome.runtime.onMessage.addListener( // Message listener for the ping from the popup to update whether the chat should show up or not
    function(request, sender, sendResponse) {
      if (request.function === "updateChat") {
        console.log("Request:", request)
        setStatus(request.value) // Call first function to set the status
        sendResponse("Receieved message");
      }
    }
);

function setStatus(value) // Update the status variable in memory for the users preference of the chat
{
    chrome.storage.sync.set({chatEnabled: value}, function() {
        console.log("setting chatEnabled = " + value)
        currentStatus = value;
        updateChat(value)
    });
}

function updateChat(enable) // function to attempt to set chat (can mean either remove chat or implement it)
{
    var div = document.getElementById("twitchChatDiv")

    if (enable == false && div != null) {
        div.parentNode.removeChild(div)
    } else if (enable == true && div == null) {
        checkForVideo()
    }
}

function checkForVideo() // function that loops to scan for the expected video container
{
    loopCount++;
    if (loopCount > 30) { // After 15 seconds give up looking
        console.log("Timed out while looking for video")
        loopCount = 0;
        clearInterval(checkExist);
    }
    var inside = document.getElementsByClassName("WatchVideoPlayer__Player")
    if (inside == null || inside[0] == null) {
        return;
    }
    var interior = inside[0].firstChild

    if (interior != null) {
        loopCount = 0;
        console.log("Embedded Video Exists!");
        attachButton()
        checkStatus()
        clearInterval(checkExist);
    }
}

function checkStatus() // function to check if chat is enabled in the users settings
{
    chrome.storage.sync.get("chatEnabled", function(value) {
        console.log("Current status is " + value.chatEnabled, currentStatus)
        currentStatus = value.chatEnabled
        attachChat(value.chatEnabled);
    });
}

function attachChat(enabled) // Function to embed the div and iframe that contain the twitch chat
{

    if (!enabled) {
        console.log("Chat is not enabled. Therefore not adding it to embedded video")
        return 
    }
    var interior = document.getElementsByClassName("WatchVideoPlayer__Player")[0].firstChild

    if (interior == null)
    {
        console.log("Error: Could not find container to embed chat into")
        return
    }

    console.log("Creating div")

    var div = document.createElement("div")
    div.id = "twitchChatDiv"
    div.style.width = "20%"
    div.style.height = "90%"
    div.style.position = "absolute"
    div.style.top = "1%"
    div.style.left = "5px";
    div.style.zIndex = 2147483647;

    interior.appendChild(div)

    var iframe = document.createElement("iframe")
    iframe.src = "https://twitch.tv/embed/livechatufc/chat?parent=www.espn.com"
    iframe.id = "chat_embed"
    iframe.style.height = "100%";
    iframe.style.width = "100%";
    iframe.style.left = 0;
    iframe.style.position = "absolute"
    iframe.style.zIndex = 2147483647;

    div.appendChild(iframe)

}

function attachButton()
{
    var div = document.getElementById("twitchChatButton")

    if (div != null) { return; } // If the button is there dwbi

    var controlBar = document.getElementsByClassName("vjs-control-bar")[0]

    if (controlBar == null) { 
        console.log("Error: Couldn't find list")
        return; 
    } // If the list aint there don't bother

    console.log("Creating button")

    var button = document.createElement("button")
    button.id = "twitchChatButton"
    button.type = "button"
    button.style.fontSize = "medium"
    button.innerText = "Enable Chat"
    button.style.top = "2px"
    button.addEventListener("click", switchChat);
    
    controlBar.appendChild(button)
    
}

function switchChat()
{
    currentStatus = !currentStatus
    setStatus(currentStatus)
}


// WatchVideoPlayer__Player