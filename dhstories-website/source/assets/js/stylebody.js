//********>
// STYLE BODY
//********>

// Applies settings to the body element
// Includes a mix of class names and inline styles
// Used on global styler.js and in settings.js (for previews)

// inputCode = styleCode in other files

function applyStyle(inputCode) {
	document.body.className = inputCode; 
	/* The following takes the place of dozens of CSS lines */
	var fontSize = inputCode.match(/s[0-9]+/);
	var lineHeight = inputCode.match(/l[0-9]+/);
	if (fontSize) {	document.body.style.fontSize = fontSize[0].substr(1) + "%"; }
	// Below gives line height as a decimal so as to override, rather than modify, the default.
	if (lineHeight) { 
		var lineHeightNum = (lineHeight[0].substr(1)) / 100;
		document.body.style.lineHeight = lineHeightNum.toString(); 
	}
}