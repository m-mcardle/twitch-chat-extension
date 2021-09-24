let chatEnabled = false;


chrome.runtime.onStartup.addListener(() => { // On startup of the application set the chatEnabled to false
    chrome.storage.sync.set({chatEnabled: value}, function() {
        console.log("ON STARTUP: setting chatEnabled = " + value)
        updateChat(value)
    });
});


async function getCurrentTab() { // Function to get the active tab (could be important for determining what website it is on, ufc or f1)
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}
console.log("Loaded. Chat enabled = ", chatEnabled)