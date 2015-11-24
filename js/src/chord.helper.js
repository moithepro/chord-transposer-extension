function ChordHelper() {
};

ChordHelper.scale_italian = ["do", "re", "mi", "fa", "sol", "la", "si"];
ChordHelper.scale_english = ["C", "D", "E", "F", "G", "A", "B"];
ChordHelper.scale_english_full = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

//easier to transpose with sharp chords
//at the moment only works with english chords
ChordHelper.flatToSharp = function(chord) {
	var sfx = chord.substr(1);

	//don't do anything if chord is not flat
    if(sfx.indexOf('b') == -1)
    	return chord;

    var temp = chord[0].toUpperCase(),
        i = ChordHelper.scale_english.indexOf(temp);

    if(i == 0)
        i = ChordHelper.scale_english.length - 1;
    else
        i--;

    temp = ChordHelper.scale_english[i];

    sfx = sfx.replace('b','#');

    return temp + sfx;
};

ChordHelper.transposeChords = function($chords, offset, currentTranspose) {
    var $chord,
        chordText;

    $chords.each(function() {
        $chord = $(this);

        if ($chord.attr('donttranspose') != 'true') {
            chordText = $chord.text();

            chordText = ChordHelper.transposeSingle(chordText, offset);

            $chord.text(chordText)
        }
    })

    currentTranspose += offset;

    if (currentTranspose < -6)
        currentTranspose += 12;
    else if (currentTranspose > 6)
        currentTranspose -= 12;

    return currentTranspose;
}

ChordHelper.transposeSingle = function(chord, amount) {
    var scale = ChordHelper.scale_english_full;

    return chord.replace(/[CDEFGAB]#?/g,
        function(match) {
            var i = (scale.indexOf(match) + amount) % scale.length;

            return scale[i < 0 ? i + scale.length : i];
        }
    );
};

ChordHelper.italianToEnglish = function(chord) {
    var sfx = '',
        endChord = 2;

    //make sure chord is lower case
    chord = chord.toLowerCase();

    //if chord is 'sol' then the chord is longer
    if(chord.indexOf('sol') == 0)
        endChord = 3;

    //split suffix from actual chord
    sfx = chord.substr(endChord);

    chord = chord.substr(0,endChord);

    //convert and add suffix
    chord = ChordHelper.scale_english[ChordHelper.scale_italian.indexOf(chord)] + sfx;
    
    //change flat chords to sharp chords for future transposing
    chord = ChordHelper.flatToSharp(chord);

    return chord;
};

ChordHelper.englishToItalian = function(chord) {
	var temp,
		sfx;

	//make sure chord is sharp for transpose
	chord = ChordHelper.flatToSharp(chord);

	temp = chord[0].toUpperCase();

	sfx = chord.substr(1);

    //convert and add suffix
    chord = ChordHelper.scale_italian[ChordHelper.scale_english.indexOf(chord)] + sfx;

    return chord;
};