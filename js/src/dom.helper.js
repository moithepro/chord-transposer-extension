function DOMHelper() {
};

DOMHelper.selectingDOM = false;
DOMHelper.whitespaces = [" ", "\t", "\n", ")", "(", ">", "<", ";"];
DOMHelper.chordSuffixes = ["7", "m", "#", "b"];
DOMHelper.chordClass = "chordTransposerChord";

DOMHelper.selectDOM = function(callback) {
	if(!callback)
		return;

	DOMHelper.selectingDOM = true;

    var hoverHandler = function(e){
        if(!DOMHelper.selectingDOM)
            return;
        
        $(".ct_ds_hover").removeClass('ct_ds_hover');

        var $el = $(e.target);

        if($el.css('position') == 'static')
            $el.css('position', 'relative');
        
        $el.addClass("ct_ds_hover");
    }

    var clickHandler = function(e){
        DOMHelper.selectingDOM = false;

        $("body *").off('mouseenter',hoverHandler);
        
        $(document).off('click', '.ct_ds_hover', clickHandler);

        $(this).removeClass('ct_ds_hover');
        
        callback(e.currentTarget);
    }

    $("body *").on('mouseenter',hoverHandler);

    $(document).on('click', '.ct_ds_hover', clickHandler)
}

DOMHelper.detectChords = function(pageHTML, chordArray) {
    var tempText,
        matchIndex,
        detectedChords = [];

    chordArray.forEach(function(currentChord, index, array) {
        tempText = pageHTML.toString().toLowerCase();

        matchIndex = tempText.indexOf(currentChord);

        while (matchIndex != -1) {
            var currentMatch = DOMHelper.checkChordMatch(tempText, matchIndex, currentChord);

            var offset = currentChord.length;

            if (currentMatch) {
                detectedChords[matchIndex + pageHTML.toLowerCase().indexOf(tempText)] = currentMatch;

                offset = currentMatch.length;
            }

            tempText = tempText.substr(matchIndex + offset + 1);

            matchIndex = tempText.indexOf(currentChord);
        }
    });

    return detectedChords;
}

//we arrive to this function knowing that match is definitely in the str
//we need to check whether it is wrapper in whitespaces or has a suffix
//if we find a match then we return it just so that we add the suffix if needed
DOMHelper.checkChordMatch = function(str, index, match) {

	var charCheck = function(character, arr) {
	    if (character) {
	        return arr.indexOf(character);
	    } else {
	        return true;
	    }
	}

	var hasWhitespaceBefore = function(str, index) {
	    return charCheck(str[index - 1], DOMHelper.whitespaces);
	}

	var hasWhitespaceAfter = function(str, index, match) {
	    return charCheck(str[index + match.length], DOMHelper.whitespaces);
	}

	var hasSuffixAfter = function(str, index, match) {
	    return charCheck(str[index + match.length], DOMHelper.chordSuffixes);
	}

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
                match += DOMHelper.chordSuffixes[sfx];

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

DOMHelper.styleChords = function(detectedChords, convertFromItalian, chordHelper, pageHTML) {

	var styleSingleChord = function(index, match) {
	    var strBegin = pageHTML.substr(0, index);
	    var strEnd = pageHTML.substr(index + match.length);

	    match = match[0].toUpperCase() + match.substr(1);

	    var prfx = "<a class='" + DOMHelper.chordClass + "' data-originaltext='" + match + "'>";
	    var sfx = "</a>";

	    if (convertFromItalian)
	        match = chordHelper.italianToEnglish(match);

	    pageHTML = strBegin + prfx + match + sfx + strEnd;
	};

    var chord,
    	index;

    for (index = detectedChords.length - 1; index >= 0; index--)
	{
		chord = detectedChords[index];
		if(chord)
			styleSingleChord(index, chord);
	}

    $page.html(pageHTML);

    $(document).on('click', '.' + DOMHelper.chordClass, function() {
    	$(this).replaceWith($('<span>' + $(this).data('originaltext') + '</span>'));
    });
}
