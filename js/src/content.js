var currentState = {
        initialized: false,
        converted: false,
        transpose: 0,
        convertFromItalian: true
    },
    detectedChords = [],
    $page,
    pageHTML;

/* Listen for message from the popup */
chrome.runtime.onMessage.addListener(function(msg, sender, callback) {
    /* First, validate the message's structure */
    if (msg.from != 'popup')
        return;

    switch (msg.subject) {
        case 'select':
            DOMHelper.selectDOM(DOMSelected);
            break;
        case 'convert':
            DOMHelper.styleChords(detectedChords, currentState.convertFromItalian, ChordHelper, pageHTML);

            currentState.converted = true;
            break;
        case 'transposeUp':
        case 'transposeDown':
            var $chords = $page.find('.' + DOMHelper.chordClass),
                offset = msg.subject = 'transposeUp' ? 1 : -1;

            currentState.transpose = ChordHelper.transposeChords($chords, offset, currentState.transpose);
            break;
    }

    callback(currentState);
});

var DOMSelected = function(el) {
    $page = $(el);

    if ($page.length == 0) {
        console.log('no container');
    } else {
        console.log('setup');

        pageHTML = $page.html().toString();

        detectedChords = DOMHelper.detectChords(pageHTML, currentState.convertFromItalian ? ChordHelper.scale_italian : ChordHelper.scale_english);

        currentState.initialized = true;

        if (detectedChords.length == 0) {
            console.log('no detectedChords');
        }
    }
};

$(document).ready(function() {
    //setup(".post.hentry[itemprop='blogPost'] .post-body");
    chrome.runtime.sendMessage({
        from: 'content',
        subject: 'showPageAction'
    });
})