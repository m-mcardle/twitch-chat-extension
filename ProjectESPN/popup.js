var onSwitch = document.getElementById("on-off");

chrome.storage.sync.get("chatEnabled", function(value) { // On load of the DOM it should update the slider based on the stored value
    onSwitch.checked = value.chatEnabled
});
onSwitch.addEventListener("click", updateOnOff);

function updateOnOff() // Function to send message to content.js to update the chat to either disappear or appear
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {function: "updateChat", value: onSwitch.checked}, function(response) {
          console.log("Popup response:" + response);
        });
    });
}

