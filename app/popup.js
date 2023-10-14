// Initialize count
var count = 0;

document.addEventListener("DOMContentLoaded", function () {
  var countElement = document.getElementById("count");
  var capoElement = document.getElementById("capo");
  // Function to send a message to content.js

  // Event listeners for buttons
  document.getElementById("plus").addEventListener("click", function () {
    count++;
    if (count > 6) {
      count = -5;
    }
    countElement.innerText = count;
    capoElement.innerText = "Capo at: " + ((-1 * count)+12) % 12 ;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "increment" });
    });
  });

  document.getElementById("minus").addEventListener("click", function () {
    count--;
    if (count < -5) {
      count = 6;
    }
    countElement.innerText = count;
    capoElement.innerText = "Capo at: " + ((-1 * count)+12) % 12 ;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "decrement" });
    });
  });
});
