//********>
// JS SHOW
//********>

// Shows elements that require Javascript
// These elements are normally hidden, so this script removes the CSS rules that hide them
// Does this by removing the style rule (in a separate <style> tag)

var hider = document.getElementById("js-hide");
hider.parentNode.removeChild(hider);

//********>
// STYLE BODY
//********>

// Applies settings to the body element
// Includes a mix of class names and inline styles
// Used in site styler below and in settings.js (for previews)

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

//********>
// SITE STYLER
//********>

// Applies user selection of fonts + colours to the page
// Also adjusts links so the selection keeps across links
// Fonts are hardcoded (serif or sans-serif) using pretty good system font stacks.
// No custom selections: users get freedom, but not THAT much freedom.

/* First, a method for setting cookies, if needed */

/* SET COOKIE */
/* Sets a browser cookie with the given key name, value, and expiration date (in # of days). */
/* Can also be used to delete cookies by setting expiration date to 0 */
/* Also used by settings.js (base.js is global so it can borrow when needed) */
/* Brazenly stolen by a lazy butt from w3schools: https:/*www.w3schools.com/js/js_cookies.asp */
function setCookie(name, value, expDays) {
	var date, expireDate;
	date = new Date();
	date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
	expireDate = date.toUTCString();
	document.cookie = name + "=" + value + ";expires=" + expireDate + ";path=/";
}

/* Then, a method to pull cookies / local storage data */

/* GET LOCAL OBJECT */
/* Gets a local object (from user's device) as Local Storage
	If this fails, it will look for an equivalent cookie object instead */
function getLocalObject(itemName) {
	var targetItem = "";
	// Try to get the target Local Storage item
	try { targetItem = localStorage.getItem(itemName); }
	catch(e) { var dump = e; } /* IE7 */
	// If the target Local Storage item does not exist
	//	then check for the equivalent cookie object
	// If it does exist, then return the item value 
	if (!targetItem) { 
		try { 
			/* While we are at it: refresh the expiry date on it */
			var itemValue = RegExp(itemName + "[^;]*").exec(document.cookie)[0].split("=")[1];
			setCookie(itemName, itemValue, 365);
			return itemValue;
		}
		catch(e) { var dump = e; /* IE7 */ return ""; }
	}
	else { return targetItem; }
}

/* Before anything else, we check if cookie permissions are set
	If not, we skip everything. Need permission first! */
/* Note: "dhstories-cookies" is a boolean cookie, either "true" or does not exist */

var cookiePermission = false;
if (getLocalObject("dhstories-cookies")) { cookiePermission = true; }

/* If cookies are permitted, we can continue. */
if (cookiePermission) {
	// Get the theme code
	/* NOTE: Theme codes are space-separated values: (color) (font) (size) */
	var styleCode = getLocalObject("dhstories-theme");
	// Apply theme code to the document body (only if not null - fallback to baseStyleCode)
	if (styleCode) { applyStyle(styleCode); }
}