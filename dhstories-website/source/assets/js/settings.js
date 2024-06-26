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

/* GET INPUT STATE */
/* Gets the value of a selected input when given the name of the input or input group */

function getInputState(name) {
	var inputs = document.getElementsByName(name);
	var inputTagName = inputs[0].tagName.toLowerCase();
	/* Radio button handling */
	if (inputTagName == "input") {
		for (i = 0; i < inputs.length; i++) {
			if (inputs[i].checked) { return (inputs[i].value); }
		}
	}
	/* Select input handling */
	else if (inputTagName == "select") {
		return inputs[0].value;
	}
}

/* GET SETTINGS */
/* Gets the current values of the settings inputs (for font, style, size, etc.) 
	and sets the settings code (space-separated values) based on those inputs */

function getSettings() {
	if (!cookiesPreOk) {
		cookiesOk = document.getElementById("cookie-consent").checked;
	}
	settingsCode = getInputState("theme") + " " 
					+ getInputState("font") + " " 
					+ getInputState("size") + " " 
					+ getInputState("line") + " "
					+ getInputState("align");
}

/* PREVIEW SETTINGS */
/* Applies the current settings values to a preview box at the bottom of the page */

function previewSettings() {
	/* Get the settings as input by the user */
	getSettings();
	/* Apply settings classes to the body element - temporarily */
	applyStyle(settingsCode);
	/* Show the preview box to give readers a better idea of the look */
	document.getElementById("preview-box").className = "preview-box";
}

/* UPDATE SETTINGS */
/* Applies the current settings values and returns the user to the previous page */

function updateSettings() {
	/* Get the settings as input by the user */
	getSettings();
	/* Check that cookies are accepted by the user, either now (checkbox) or earlier (storage obj.)
	/* if not, display an error and halt */
	if (!cookiesOk) {
		window.alert("ERROR: Unable to save settings. Be sure to accept cookies!");
		return;
	}
	/* Set local storage or cookie values; display an error if this fails somehow (likely disabled storage) */
	if (window.confirm("Are these settings correct? If yes, click OK. NOTE: This will return you to the previous page!")) {
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
			window.alert("ERROR: Unable to save settings. You may have cookies and/or local storage disabled in your browser!");
		}
	}
}

/* CANCEL BUTTON */
/* Cancels any changes to the page and returns the user to the previous page. */
function cancelSettings() {
	if (window.confirm("Do you want to discard your changes and return to the previous page? If yes, click OK.")) {
		window.history.back();
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
	document.getElementById("cookie-notice").innerHTML = "<p>Cookies for <i>Dragonhouse Stories</i> have been accepted on this device.</p><p>If you would like to withdraw any given consent, erase these cookies from your device, and reset your reading settings, click: <a role='button' href='javascript:resetSettings()'>reset all settings</a>.</p>"
	/* Update default states of inputs based on existing styler settings
	/* (Split into array, loop array, use array values as ID targets for GEBI and check the targets) */
	var themeCode = getLocalObj("dhstories-theme");
	if (themeCode) {
		var themeCodeArray = themeCode.split(" ");
		for (i = 0; i < themeCodeArray.length; i++) {
			var inputElement = document.getElementById(themeCodeArray[i]);
			var inputTagName = inputElement.tagName.toLowerCase();
			if (inputTagName == "input") { inputElement.checked = true; }
			else if (inputTagName == "option") { inputElement.selected = true; }
		}
	}
}
