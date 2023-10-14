function transposeChord( chord, amount ) {
    const sharpnotes = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"];
    const flatnotes  = ["A","Bb","B","C","Db","D","Eb","E","F","Gb","G","Ab"];
    let rootChord = chord[0];
    if(chord[1] === '#' || chord[1] == 'b') {
        rootChord += chord[1];
    }
    amount = (amount % sharpnotes.length) || 1;
    if(amount < 0) { amount += sharpnotes.length; }
    for(let note=0; note < sharpnotes.length; ++note) {
        if(rootChord === sharpnotes[note]) {
            return( (sharpnotes[(note + amount) % sharpnotes.length]) + chord.substr(rootChord.length) );
        }
        if(rootChord === flatnotes[note]) {
            return( (flatnotes[(note + amount) % flatnotes.length]) + chord.substr(rootChord.length) );
        }
    }
    return ('???');
}

function transposeChordLine( line, amount ) {
    amount = amount || 1;
    let count = 0;
    let newLine = '';

    while(count < line.length) {
        if(line[count] >= 'A' && line[count] <= 'G') {
            let chord = line[count++];
            while (count < line.length && line[count] !== ' ' && (line[count] < 'A' || line[count] > 'G')) {
                chord += line[count++];
            }
            let newChord = transposeChord(chord, amount);
            if(newChord.length < chord.length) {    // pad if shorter
                newChord += " ";
            }
            if(newChord.length > chord.length && count < line.length && (line[count] < 'A' || line[count] > 'G')) { // trim if there's space
                count++;
            }
            newLine += newChord;
        } else {
            newLine += line[count++];
        }
    }
    return(newLine);
}

var count = 0;
function updateElement(element, positive) {
  // Get the current value
  let value = element.innerText;
  value = transposeChordLine(value, positive ? 1 : -1);
  // Update the element
  element.innerText = value;
}
function iterateElements(positive) {
  // Check if the node is an element
  var spanArray = document.documentElement.getElementsByTagName("span");
  for (var i = 0; i < spanArray.length; i++) {
    updateElement(spanArray[i], positive);
  }
}

function increment() {
    count++;
    iterateElements(true);
}

function decrement() {
    count--;
    iterateElements(false);
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'increment') {
        increment();
    } else if (request.action === 'decrement') {
        decrement();
    }
});