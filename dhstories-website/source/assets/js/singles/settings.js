/* ********>
/* SETTINGS.JS
/* ********>

/* Gets and saves reading theme settings from the user
/* Uses Local Storage, falling back to cookies if needed
/* Includes preview function and easy "go back a page" cancel function

/* GLOBAL VARIABLES */

var cookiesPreOk = getLocalObj("dhstories-cookies"); /* Whether cookies have been approved before */
var cookiesOk = cookiesPreOk; /* Initializing cookiesOk with pre-approval, if it exists */
var i, dump, settingsCode;
var errorBoxId = "error-box";
var hashCode = window.hash; /* Set if the user happens to go back in browser history */

/* SET COOKIE */
/* Sets a browser cookie with the given key name, value, and expiration date (in # of days). */
/* Can also be used to delete cookies by setting expiration date to 0 */
/* Brazenly stolen by a lazy butt from w3schools: https:/*www.w3schools.com/js/js_cookies.asp */
function setCookie(name, value, expDays) {
	var date, expireDate;
	date = new Date();
	date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
	expireDate = date.toUTCString();
	document.cookie = name + "=" + value + ";expires=" + expireDate + ";path=/";
}

/* GET RADIO STATE */
/* Gets the value of a selected radio button when given the name of the radio button group */

function getRadioState(name) {
	var radioButtons = document.getElementsByName(name);
	for (i = 0; i < radioButtons.length; i++) {
		if (radioButtons[i].checked) { return (radioButtons[i].value); }
	}
}

/* GET SETTINGS */
/* Gets the current values of the settings inputs (for font, style, size, etc.) 
	and sets the settings code (space-separated values) based on those inputs */

function getSettings() {
	if (!cookiesPreOk) {
		cookiesOk = document.getElementById("cookie-consent").checked;
	}
	settingsCode = getRadioState("theme") + " " 
					+ getRadioState("font") + " " 
					+ getRadioState("size") + " " 
					+ getRadioState("line") + " "
					+ getRadioState("align");
}

/* PREVIEW SETTINGS */
/* Applies the current settings values to a preview box at the bottom of the page */

function previewSettings() {
	/* Reset any error message */
	setError("", errorBoxId);
	/* Get the settings as input by the user */
	getSettings();
	/* Apply settings classes to the settings page */
	document.body.className = settingsCode;
	/* Show the preview box to give readers a better idea of the look */
	document.getElementById("preview-box").className = "preview-box";
}

/* UPDATE SETTINGS */
/* Applies the current settings values and returns the user to the previous page */

function updateSettings() {
	/* Reset any error message */
	setError("", errorBoxId);
	/* Get the settings as input by the user */
	getSettings();
	/* Check that cookies are accepted by the user, either now (checkbox) or earlier (storage obj.)
	/* if not, display an error and halt */
	if (!cookiesOk) {
		setError("<b>ERROR:</b> Unable to save settings. Be sure to accept cookies!", errorBoxId);
		return;
	}
	/* Set local storage or cookie values; display an error if this fails somehow (likely disabled storage) */
	try {
		try { 
			window.localStorage.setItem("dhstories-cookies", "true"); /* Cookie acceptance */
			window.localStorage.setItem("dhstories-theme", settingsCode); /* Settings */
		}
		catch(e) { /* Set cookies for ~1 year instead */
			dump = e; /* IE7 */
			setCookie("dhstories-cookies", "true", 365); /* Cookie acceptance */
			setCookie("dhstories-theme", settingsCode, 365); /* Settings */
		}
		window.history.back(); /* Navigate to previous page */
	}
	catch(e) {
		console.log(e);
		setError("<b>!!ERROR:</b> Unable to save settings. You may have cookies and/or local storage disabled in your browser!", errorBoxId);
	}
}

/* RESET SETTINGS */
/* Undoes all settings (erases cookies, refreshes page to revert to defaults, etc.) */

function resetSettings() {
	if (window.confirm("Are you sure you want to delete cookies and reset your reading preferences for Dragonhouse Stories? NOTE: This will return you to the previous page!")){
		try { 
			window.localStorage.removeItem("dhstories-theme"); /* remove theme code */ 
			window.localStorage.removeItem("dhstories-cookies"); /* remove cookie permissions */
		}
		catch(e) { dump = e; } /* IE7 */
		setCookie("dhstories-cookies", "", 0); /* Cookie acceptance */
		setCookie("dhstories-theme", "", 0); /* Settings */
		window.history.back(); /* Navigate to previous page */
	}
}

/* PAGE LOAD SCRIPTS */
/* Scripts for page load setup */

/* Exchange the To Top link with a Javascript scrollTo function */
document.getElementById("top-link").href = "javascript:window.location.replace('#');";

/* Do a few things if cookies have been accepted by the user beforehand... */
if (cookiesPreOk) {
	/* Update the cookie notice box (#cookie-notice) based on whether cookies are already allowed */
	document.getElementById("cookie-notice").innerHTML = "Cookies for <i>Dragonhouse Stories</i> have been accepted on this device. <p>If you would like to withdraw any given consent, erase these cookies from your device, and reset your reading settings, please <a href='javascript:resetSettings()'>click here</a>.</p>"
	/* Update default checked states of radio buttons based on existing styler settings
	/* (Split into array, loop array, use array values as ID targets for GEBI and check the targets) */
	var themeCode = getLocalObj("dhstories-theme");
	if (themeCode) {
		var themeCodeArray = themeCode.split(" ");
		for (i = 0; i < themeCodeArray.length; i++) {
			document.getElementById(themeCodeArray[i]).checked = true;
		}
	}
}
