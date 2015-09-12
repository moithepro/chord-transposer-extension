var scale_itailian = ["do", "re", "mi", "fa", "sol", "la", "si"],
    scale_english = ["C", "D", "E", "F", "G", "A", "B"],
    chordSuffixes = ["7", "m", "#", "b"],
    whitespaces = [" ", "\t", "\n", ")", "(", ">", "<", ";"],
    chordClass = "chordTransposerChord",
    currentState = {
        converted: false,
        transpose: 0,
        convertFromItalian: true
    },
    detectedChords = [],
    $container,
    containerText;


//"private" method:
var setup = function(containerSelector) {
    $container = $(containerSelector);

    if ($container.length == 0) {
        console.log('no container');
    } else {
        console.log('setup');

        containerText = $container.html().toString();
        detectChords();

        if (detectedChords.length > 0) {
            managePopup();
        } else {
            console.log('no detectedChords');
        }

    }
};

var managePopup = function() {
    /* Listen for message from the popup */
    chrome.runtime.onMessage.addListener(function(msg, sender, callback) {
        /* First, validate the message's structure */
        if (msg.from != 'popup')
            return;

        switch (msg.subject) {
            case 'convert':
                applyDomToChords();
                break;
            case 'transposeUp':
                transpose(1);
                break;
            case 'transposeDown':
                transpose(-1);
                break;
        }

        callback(currentState);
    });

    /* open popup */
    chrome.runtime.sendMessage({
        from: 'content',
        subject: 'showPageAction'
    });
}

var detectChords = function() {
    var chordArray,
        currentChord,
        tempText,
        matchIndex,

        chordArray = currentState.convertFromItalian ? scale_itailian : scale_english;

    chordArray.forEach(function(currentChord, index, array) {
        tempText = containerText.toString().toLowerCase();
        matchIndex = tempText.indexOf(currentChord);

        while (matchIndex != -1) {
            var currentMatch = checkChordMatch(tempText, matchIndex, currentChord);
            var offset = currentChord.length;

            if (currentMatch) {
                detectedChords[matchIndex + containerText.toLowerCase().indexOf(tempText)] = currentMatch;
                offset = currentMatch.length;
            }

            tempText = tempText.substr(matchIndex + offset + 1);
            matchIndex = tempText.indexOf(currentChord);
        }
    });
}

var applyDomToChords = function() {
    var chord,
    	index;

    for (index = detectedChords.length - 1; index >= 0; index--)
	{
		chord = detectedChords[index];
		if(chord)
			applyDomToSingleChord(index, chord);
	}

    $container.html(containerText);

    $(document).on('click', '.' + chordClass, function() {
    	$(this).replaceWith($('<span>' + $(this).data('originaltext') + '</span>'));
    });

    currentState.converted = true;
}

var applyDomToSingleChord = function(index, match) {
    var strBegin = containerText.substr(0, index);
    var strEnd = containerText.substr(index + match.length);

    match[0].toUpperCase();

    var prfx = "<a class='" + chordClass + "' data-originaltext='" + match + "'>";
    var sfx = "</a>";

    if (currentState.convertFromItalian)
        match = convertItalianChordToEnglish(match.toLowerCase());

    containerText = strBegin + prfx + match + sfx + strEnd;
}

//we arrive to this function knowing that match is definitely in the str
//we need to check whether it is wrapper in whitespaces or has a suffix
//if we find a match then we return it just so that we add the suffix if needed
var checkChordMatch = function(str, index, match) {
    var isMatch = null;

    //check if chord is preceeded by whitespace
    if (hasWhitespaceBefore(str, index) == -1)
        return isMatch;

    //if string is precisely long enough we have a perfect match
    //no need to check what exists after
    if (str.length == index + match.length) {
        isMatch = match;
    } else if (str.length > index + match.length) {

        if (hasWhitespaceAfter(str, index, match) != -1) {
            //check if we have a normal chord with preceeding whitespace
            isMatch = match;
        } else {
            var sfx = hasSuffixAfter(str, index, match);
            while (sfx != -1) {
                match += chordSuffixes[sfx];

                if (hasWhitespaceAfter(str, index, match) != -1) {
                    //has whitespace so stop while
                    //otherwise continue checking for suffixes
                    isMatch = match;
                    sfx = -1;
                } else {
                	sfx = hasSuffixAfter(str, index, match);
                }
            }
        }
    }

    return isMatch;
}

var hasWhitespaceBefore = function(str, index) {
    return charCheck(str[index - 1], whitespaces);
}

var hasWhitespaceAfter = function(str, index, match) {
    return charCheck(str[index + match.length], whitespaces);
}

var hasSuffixAfter = function(str, index, match) {
    return charCheck(str[index + match.length], chordSuffixes);
}

var charCheck = function(character, arr) {
    if (character) {
        return arr.indexOf(character);
    } else {
        return true;
    }
}

var convertItalianChordToEnglish = function(chord) {
    var sfx = '';
    chord = chord.toLowerCase();

    if ((chord.length == 3 && chord != 'sol') || (chord.length == 4)) {
        sfx = chord[chord.length - 1];
        chord = chord.substring(0, chord.length - 1);
    }

    chord = scale_english[scale_itailian.indexOf(chord)] + sfx;

    return chord;
}

var transpose = function(offset) {
    var $chords = $container.find('.' + chordClass),
        $chord,
        chordText;

    $chords.each(function() {
        $chord = $(this);
        if ($chord.attr('donttranspose') != 'true') {
            chordText = $chord.text();
            chordText = transposeChord(chordText, offset);
            $chord.text(chordText)
        }
    })

    currentState.transpose += offset;

    if (currentState.transpose < -6)
        currentState.transpose += 12;
    else if (currentState.transpose > 6)
        currentState.transpose -= 12;
}

function transposeChord(chord, amount) {
    var scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    return chord.replace(/[CDEFGAB]#?/g,
        function(match) {
            var i = (scale.indexOf(match) + amount) % scale.length;
            return scale[i < 0 ? i + scale.length : i];
        }
    );
}

$(document).ready(function() {
    setup(".post.hentry[itemprop='blogPost'] .post-body");
})