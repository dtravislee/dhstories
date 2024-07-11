/* ********>
/* SETTINGS.JS
/* ********>

/* Gets and saves reading theme settings from the user
/* Uses Local Storage, falling back to cookies if needed
/* Includes preview function and easy "go back a page" cancel function
/*	(Doesn't actually go back, just saves the page name in the URI fragment for reuse)

/* GLOBAL VARIABLES */

var cookiesPreOk = getLocalObject("dhstories-cookies"); /* Whether cookies have been approved before */
var cookiesOk = cookiesPreOk; /* Initializing cookiesOk with pre-approval, if it exists */
var scSaveIndicator = "sc="; /* Prefix of the settings code in the hash when clicking "Cancel" */
var defaultSet = false; /* Indicator of whether the default input states have been set */
var consentErrorElem = document.getElementById("cookie-error");
var storageErrorElem = document.getElementById("storage-error");
var allOkElem = document.getElementById("settings-ok");
var nextPageHash = window.location.hash.match(/\/.*\//)[0];
var nextPage = window.location.origin + nextPageHash;
var i, dump, settingsCode, submitSettings;

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

/* SAVE SETTINGS */
/* Saves current settings to the URI as part of the fragment */
/* Enables a pretty good "oh no" button via browser refresh or back */
/*	(Say, e.g., if the user ups the font size way too big or small) */
function saveSettings () {
	getSettings();
	var settingsHash = "#sc=" + settingsCode.replace(/ /g, "_");
	if (nextPageHash) { settingsHash = nextPageHash + settingsHash; }
	window.location.hash = settingsHash;
}

/* PREVIEW SETTINGS */
/* Applies the current settings values to a preview box at the bottom of the page */
function previewSettings() {
	/* Backup settings in case things go awry (e.g. too large font size) */
	saveSettings();
	/* Apply settings classes to the body element - temporarily */
	applyStyle(settingsCode);
	/* Show the preview box to give readers a better idea of the look */
	document.getElementById("preview-box").className = "preview-box";
}

/* STORE SETTINGS */
/* Takes a pair of settings codes (one new, one old) and stores them in local storage objects
	(Or cookies if local storage is unavailable) */
/* NOTE: Does not have error checking itself! */
/* PARAMS:
	-newSettings = string, formatted like settingsCode, containing new settings
	-oldSettings = string, formatted like settingsCode, containing old settings (optional!) */
function storeSettings(newSettings, oldSettings){
	try { 
		window.localStorage.setItem("dhstories-cookies", "true"); /* Cookie acceptance */
		window.localStorage.setItem("dhstories-theme", newSettings); /* Settings */
		window.localStorage.setItem("dhstories-theme-old", oldSettings); /* Settings */
	}
	catch(e) { /* Set cookies for ~1 year instead */
		dump = e; /* IE7 */
		/* Note that setCookie is stored in base.js for global use */
		setCookie("dhstories-cookies", "true", 365); /* Cookie acceptance */
		setCookie("dhstories-theme", newSettings, 365); /* Settings */
		setCookie("dhstories-theme-old", oldSettings, 365); /* Previous settings */
	}
}

/* UPDATE SETTINGS */
/* Applies the current settings values and returns the user to the previous page */
function updateSettings() {
	/* Get the settings as input by the user */
	getSettings();
	/* Re-hide any previous error messages */
	storageErrorElem.className = "hidden";
	consentErrorElem.className = "hidden";
	/* Check that cookies are accepted by the user, either now (checkbox) or earlier (storage obj.)
	/* if not, display an error and halt */
	if (!cookiesOk) {
		window.alert("ERROR: Unable to save settings. Be sure to accept cookies!");
		consentErrorElem.className = "";
		document.getElementById("cookie-consent").focus();
		return;
	}
	/* Set local storage or cookie values; display an error if this fails somehow (likely disabled storage) */
	try {
		console.log(settingsCode);
		/* Get any current settings */
		var currentSettings = getLocalObject("dhstories-theme");
		/* Try to store the settings, using any current settings as the old settings */
		storeSettings(settingsCode, currentSettings);
		/* Show the All-OK box */
		allOkElem.className = ""; 
		/* Wait about 1 second, then... */
		submitSettings = setTimeout(function() {  
			window.location.hash = nextPageHash; /* Remove any stored URI code from using Cancel then Back */
			window.location.assign(nextPage); /* Navigate forward to the previous page */
			}, 1000); 
	}
	catch(e) {
		console.log(e);
		window.alert("ERROR: Unable to save settings. You may have cookies and/or local storage disabled in your browser!");
		storageErrorElem.className = "";
	}
}

/* CANCEL SETTINGS */
/* Cancels any changes to the page and returns the user to the previous page (navigating forward). */
function cancelSettings() {
	if (window.confirm("You may have settings in progress. Do you want to leave this page?")) {
		saveSettings();
		window.location.assign(nextPage);
	}
}

/* RESET SETTINGS */
/* Undoes all settings (erases cookies, refreshes page to revert to defaults, etc.) */
function resetSettings() {
	if (window.confirm("Are you sure you want to delete cookies and reset your reading preferences for Dragonhouse Stories?")){
		try {
			try { 
				window.localStorage.removeItem("dhstories-theme"); /* remove theme code */ 
				window.localStorage.removeItem("dhstories-theme-old"); /* remove old theme code */ 
				window.localStorage.removeItem("dhstories-cookies"); /* remove cookie permissions */
			}
			catch(e) { dump = e; /* IE7 */ }
			try {
				/* Note that setCookie is stored in base.js for global use */
				setCookie("dhstories-cookies", "", 0); /* Cookie acceptance */
				setCookie("dhstories-theme", "", 0); /* Settings */
				setCookie("dhstories-theme-old", "", 0); /* Old settings */
			}
			catch(e) { dump = e; /* IE7 */}
		}
		/* If cookies are disabled, we have no need to delete anything anyway, so...just skip. */
		catch(e) { dump = e; /* IE7 */ }
		window.location.reload(); /* Refresh this page */
	}
}

/* UNDO SETTINGS */
/* Reverts settings to the second most reset setup, saved as a third cookie */
function undoSettings() {
	/* First, stop any submission in progress */
	clearTimeout(submitSettings);
	/* And hide the success box */
	allOkElem.className = "hidden";
	
	/* Work with the rest only if cookies are accepted */
	if (cookiesOk) {
		/* Get the just-set settingsCodes (old and new) and swap them */
		/* getLocalObject is stored in base.js */
		var oldStyle = getLocalObject("dhstories-theme-old");
		var newStyle = getLocalObject("dhstories-theme");
		storeSettings(oldStyle, newStyle);
	}
	
	window.location.reload(); /* Refresh this page */
}

/* INITIAL STATE SETTER */
/* Update default states of inputs based on given startCode 
/* (Split into array, loop array, use array values as ID targets for GEBI and check the targets) */
/* PARAMS: startCode = string, formatted same as settingsCode */

function setStartSettings(startCode) {
	var startCodeArray = startCode.split(" ");
	for (i = 0; i < startCodeArray.length; i++) {
		var inputElement = document.getElementById(startCodeArray[i]);
		var inputTagName = inputElement.tagName.toLowerCase();
		if (inputTagName == "input") { inputElement.checked = true; }
		else if (inputTagName == "option") { inputElement.selected = true; }
	}
	defaultSet = true; /* Indicates defaults have been set, so later calls do not override this */
}

/* PAGE LOAD SCRIPTS */
/* Scripts for page load setup */

/* Set the Settings link at the top of the page to the current URL */
document.getElementById("settings").href = window.location.href;

/* See if settings-in-progress have been saved to the URI and, if so, try to restore those */
var hashSavedCodeIndex = window.location.hash.search(scSaveIndicator);
if (hashSavedCodeIndex){
	try {
		var hashSavedCode = window.location.hash.substr(hashSavedCodeIndex+scSaveIndicator.length).replace(/_/g, " ");
		if (hashSavedCode) { setStartSettings(hashSavedCode); }
	}
	catch(e) { dump = e; /* IE7 */ }
}

/* Do a few things if cookies have been accepted by the user beforehand... */
if (cookiesPreOk) {
	/* Update the cookie notice box (#cookie-notice) based on whether cookies are already allowed */
	var newNotice = document.getElementById("accepted-consent");
	document.getElementById("cookie-notice").innerHTML = newNotice.innerHTML;
	newNotice.parentNode.removeChild(newNotice);

	/* If not already set: */
	var themeCode = getLocalObject("dhstories-theme");
	if (themeCode && !defaultSet) {
		setStartSettings(themeCode);
	}
}
