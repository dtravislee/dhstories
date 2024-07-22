//********>
// SEARCH.JS
//********>

/* The bread and butter of the search function */

//********>
// GLOBAL VARIABLES
//********>

/* User input variables */

var query, 			// The main search query
	lookIn, 		// The "Search In" section results
	tags, 			// Tags that posts ought to have
	beforeDate,		// Date posts should be newer than
	afterDate,		// Date posts should be older than
	longerThan,		// The read time posts should be longer than
	shorterThan,	// The read time posts should be shorter than
	newestFirst;	// Whether the results order by newest first (as a number, 1 or 0)
	
/* Index variables */

var posts,			// Current set of posts pulled from JSON files, as object array
	startIndex,		// 0-based index number the search starts at
	jsonIndex;		// Current json file, split into an array of posts
// Base URL as provided by Hugo
var baseURL = "{{- $.Site.BaseURL -}}";
// Total number of posts in the search index
var postCount = {{- len (where (where .Site.RegularPages.Reverse `Params.hide` `=` nil) `Params.date` `!=` nil) -}};
// Number of posts per individual json index
var paginationSize = {{- .Site.Params.paginate -}};
// Number of index pages (calculated based on total posts and index size)
var indexCount = Math.ceil(postCount / paginationSize);

/* Results variables */

// Number of results acquired so far
var resultCount = 0;
// Array of result objects
var resultObjects = [];
// HTML container hosting results
var resultsContainer = document.getElementById("results-container");

/* Advanced Options variables */

// Upper advanced options button
var topAdvancedID = "top-advanced-button";
var openAdvanced = document.getElementById(topAdvancedID).outerHTML;
// Lower advanced options button
var bottomAdvancedID = "bottom-advanced-button";
var closeAdvanced = document.getElementById(bottomAdvancedID).outerHTML;
// Advanced options container ID
var advID = "advanced-opt";
// Whether advanced options have been opened and need processing
var doAdvanced = false;

/* Hash code variables - used for saving search results */

var encodedQuery, 		// Full URL-compliant hash code
	fieldsEncoded, 		// Encoded reference for checked fields-to-search
	tagsEncoded, 		// Encoded reference for checked tags
	beforeDateString,	// DD-MM-YYY formatted string of beforeDate object
	afterDateString;	// DD-MM-YYY formatted string of afterDate object
	/* Read times and sort order are provided as-is */

// The base used for encoding fields-to-search
// Since the number of fields will be far less than 64, where toString and parseInt can lack precision,
//	we just use how many fields there are
var fieldsEncodingRadix = document.getElementsByName("fields").length;
// The base used for encoding tags, from 2 to 36 inclusive
var tagsEncodingRadix = 36;	
	

/* NOTE: In order to encode sections and tags, split the string up 
Use groups of 32 in base 32, groups of 16 in hexadecimal
-Mind any overflow in this case: pad with 0s and be sure to abort at the end of the checkboxes list, NOT the end of the string.
(General idea is to range through the boxes array, and for each index of the box, get the index of the binary representation to determine true or false)

//********>
// POST OBJECT
//********>

/* The framework for post objects that do the heavy lifting on search */
/* Params: rawJson = a fragment of raw JSON text
	as specified by layouts/_default/index.json
	and gathered by getPosts(); */

function Post(rawJson) {
	
	// Searchable attributes
	this.content = this._sanitizeText(this._getKeyValue("content"));
	this.date = this._getKeyValue("date");
	this.description = this._sanitizeText(this._getKeyValue("description"));
	this.edited = this._getKeyValue("edited");
	this.readtime = this._getKeyValue("readtime");
	this.tags = this._sanitizeText(this._getKeyValue("tags"));
	this.title = this._sanitizeText(this._getKeyValue("title"));
	this.url = this._getKeyValue("url");
	this.words = this._getKeyValue("words");
	
	// Datepart attributes
	this.year = this._getKeyValue("year");
	this.month = this._getKeyValue("month");
	this.day = this._getKeyValue("day");
	this.time = parseDateparts();
	
	/* SANITIZE TEXT (string) */
	/* (private function) */
	/* Undoes JSON escape characters, e.g. \n, &rdquo; etc. */
	this._sanitizeText = function(input) {
		return input
			/* Newlines */
			.replace(/(\\s|\\n|\\r|\s|\n|\r)/, " ") 
			/* Double quote marks */
			.replace(/(&ldquo;|&rdquo;|&#34;)/g, '"')
			/* Single quote marks */
			.replace(/(&lsquo;|&rsquo;|&#39;)/g, "'")
			/* Greater-than symbols */
			.replace(/&gt;/g, ">")
			/* Less-than symbols */
			.replace(/&lt;/g, "<")
			/* Braces */
			.replace(/&lbrace;/g, "{")
			.replace(/&rbrace;/g, "}")
			/* Brackets */
			.replace(/&#160;/g, "[")
			.replace(/&#xfe0e;/g, "]")
			/* Carats */
			.replace(/&#x21a9;/g, "^")
			/* Ellipses */
			.replace(/&hellip;/g, "…")
			/* Space condensation */
			.replace(/\s+/, " ")
	}
	
	/* GET KEY VALUE (string) */
	/* (private function) */
	/* When given a key, returns the string value of a key:value pair in the raw JSON segment. */
	this._getKeyValue = function(key) {
		
		/* Create a Regex value to use as a search parameter */
		var kvRegex = new RegExp('"' + key + '":\\s*".*?"');
		
		/* Execute the Regex as a search on the raw JSON fragment */
		var resultArray = kvRegex.exec(rawJson);
		
		/* If a result is found... */
		if (resultArray) {
			
			/* Initialize a result variable to return */
			var result = '';
			
			/* Get the key-value pair (first result in resultArray) */
			var kvPair = resultArray[0];
			
			/* Extract the value in the key-value pair by:
				1. Trimming the leading key segment, and
				2. Cutting trailing quotation marks, commas, semicolons, whitespace, etc. */
			var keyRegex = new RegExp('^"' + key + '":\\s*"');
			result = kvPair.replace(keyRegex, "").replace(/"(;|,)*\s*$/, "");

			/* Finally, return the result value */
			return result;
		}
	}
	
	/* PARSE DATEPARTS */
	/* Takes the object's date parts (year, month, day) and returns a string */
	/* String is milliseconds since Jan 1, 1970 */
	this._parseDateparts = function() {
		var rawDate = new Date(this.year, (this.month-1), this.day);
		return rawDate.getTime();
	}
	
	/* GET DATE BEFORE (string - milliseconds since Jan 1, 1970)*/
	/* Returns bool: whether the post was published on or before the date provided as argument */
	this.getDateBefore = function(inputTime) {
		return (this.time <= inputTime);
	}
	
	/* GET DATE AFTER (string - milliseconds since Jan 1, 1970)*/
	/* Returns bool: whether the post was published on or after the date provided as argument */
	this.getDateAfter = function(inputTime) {
		return (this.time >= inputTime);
	}
	
	/* FIND IN POST (key-string, query-string) */
	/* Returns bool: whether the given query string exists in the post property identified by a given key. */
	/*	Or false if improperly formatted */
	/* Valid keys include any of the searchable attribute names */
	this.findInPost = function(key, query) {
		switch(key) {
			case "content": return (this.content.search(query) != -1) ? true:false;
			case "date": return (this.date.search(query) != -1) ? true:false;
			case "description": return (this.description.search(query) != -1) ? true:false;
			case "edited": return (this.edited.search(query) != -1) ? true:false;
			case "readtime": return (this.readtime.search(query) != -1) ? true:false;
			case "tags": return (this.tags.search(query) != -1) ? true:false;
			case "title": return (this.title.search(query) != -1) ? true:false;
			case "url": return (this.url.search(query) != -1) ? true:false;
			case "words": return (this.words.search(query) != -1) ? true:false;
			default: return false;
		}
	}
	
	/* WRITE TO HTML */
	/*	Writes this post object as HTML, formatted the same as _default/list.html */
	this.writeToHtml = function () {
		var output = "<div role='article'>"
			+ "<h2><a href='"
			+ this.url
			+ "'><span>"
			+ this.title
			+ "</span></a></h2>";
		if (this.description != "") {
			output += "<p class='meta' aria-label='subtitle'>"
				+ this.description
				+ "</p>";
		}
		if (this.date != "") {
			output += "<p class='meta'>Published: "
				+ this.date
				+ "</p>";
		}
		if (this.edited != "" && this.edited != this.date) {
			output += "<p class='meta'>Edited: "
				+ this.edited
				+ "</p>";
		}
		if (this.tags != "") {
			/* Split the tags string into an array, then loop it */
			var tagsArray = this.tags.split("; ");
			var tagsCount = tagsArray.length;
			output += "<p class='meta'>Tags: ";
			for (var i = 0; i < tagsCount; i++) {
				output += "<a href='/tags/"
					+ this.tags
					+ "'><span>"
					+ this.tags
					+ "</span></a>";
				/* Add a comma-space after every entry except the last one */
				if (i < tagsCount-1){
					output += ", ";
				}
			}
			output += "</p>";
		}
		output += "</div>";
		results.innerHTML = output;
	}
}

//********>
// GETTER FUNCTIONS
//********>

/* GET QUERY */
/* Gets and sanitizes the user-input query */
/* Returns a string array representing the query keywords */
function getQuery() {
	
	/* Use an empty array variable to store the final result */
	var result = [];
	
	/* Get the query as written */
	/* We add leading and trailing spaces to ease targeting indicators */
	/*	(Because we don't need special start-of-string / end-of-string cases) */
	var rawQuery = " " + document.getElementById("search-input").value + " ";
	
	/* Remove orphan indicators (any -, /, or " surrounded by spaces) */
	var rawQueryClean = rawQuery.replace(/\s+[-\/"]\s+/g, " ");
		
	/* Extract Regex from query and remove them from the raw query string */
	var regexQueryExp = /\s-?\/.*?\/\s/g;
	result = result.concat(rawQueryClean.match(regexQueryExp));
	rawQueryClean = rawQueryClean.replace(regexQueryExp, " ");
	
	/* Same as above, but for literals (quotation marks) */
	var regexQueryExp = /\s-?".*?"\s/g;
	result = result.concat(rawQueryClean.match(regexQueryExp));
	rawQueryClean = rawQueryClean.replace(regexQueryExp, " ");
	
	/* Finally, split what is left based on spaces and add it to the result */
	rawQueryClean = rawQueryClean.replace(/\s+/g, " "); // Discards extra consecutive spaces
	rawQueryClean = rawQueryClean.replace(/^\s+/g, ""); // Discards any leading space
	rawQueryClean = rawQueryClean.replace(/\s+$/g, ""); // Discards any trailing space
	result = result.concat(rawQueryClean.split(" ")); // Splits the remainder on spaces and combines with result
	
	/* Return the array */
	return result;
}

/* GET CHECKBOX ARRAY */
/* Gets the results of a group of checkboxes by a shared name */
/* Returns array of strings, one for each checked box */
function getCheckboxArray(name) {
	
	/* Initiate an empty array variable to store the result */
	var result = [];
	
	/* Pull all the field checkboxes */
	var boxes = document.getElementsByName(name);
	
	/* Range through the field checkboxes and, if it is checked, add to the result */
	for (var i = 0; i < boxes.length; i++) {
		if (boxes[i].checked) {
			result.push(boxes[i].value);
		}
	}
	
	/* Return the resulting array */
	return result;
}

/* GET DATE SELECTOR */
/* Gets the date from a group of select boxes sharing the same name */
/* Returns integer provided by Date.getTime() (milliseconds since Jan 1 1970) */
function getDateSelector(name) {
	
	/* Initiate variable to hold date parts */
	var dateParts = [];
	
	/* Get the targeted date elements */
	var dateElems = document.getElementsByName(name);
	
	/* Range through date elements and add each value to the results array, in order */
	/* Order is [0] = day, [1] = month, [2] = year */
	for (var i = 0; i < dateElems.length; i++) {
		dateParts.push(parseInt(dateElems[i].value));
	}
	
	/* Subtract 1 from the month, as months are 0-index in date objects */
	dateParts[1] -= 1;
	
	/* Create a date object out of the input data for verification */
	var dateObject = new Date(dateParts[2], dateParts[1], dateParts[0]);
	
	/* If the dates in the array and the date object do not match, there is an overflow. */
	/* To counteract, lower the day part by 1, reset the date object, and check again. */
	/* Emergency exit if the input day part reaches 27 */
	/*	(All months have at least 27 days so if we subtract to that point, we have a problem) */
	while (dateObject.getFullYear() != dateParts[2] 
		|| dateObject.getMonth() != dateParts[1] 
		|| dateObject.getDate() != dateParts[0]) {
			dateParts[0] -= 1;
			dateObject.setFullYear(dateParts[2], dateParts[1], dateParts[0]);
			if (dateParts[0] <= 27){ break; }
		}
	
	/* Return the time format of the date object */
	return dateObject.getTime();
}

/* GET READ TIME */
/* Gets the selected read time */
/* Params: one of "more" or "less", as a string */
function getReadTime(type) {
	return document.getElementById("readtime-" + type).value;
}

/* GET RADIO SET RESULT */
/* Returns the value of a radio button group */
/* Param: Name of radio button group */
function getRadioSet(name) {
	
	/* Get all elements with the target name */
	var radioElems = document.getElementsByName(name);
	
	/* Return the value of the selected radio element */
	for (i = 0; i < radioElems.length; i++) {
		if (radioElems[i].checked) { return (radioElems[i].value); }
	}
}

/* GET POSTS */
/* Gets posts by pulling a json index file,
	then writing data to post objects */
/* Returns array of post objects, or null if there is a connection issue */
/* Params: Page = the page number of the desired index */
	/* (Page number is related to pagination number on the homepage) */
function getPosts(page) {
	var url = baseURL + "/index.json" // Set the URL
	var req = new XMLHttpRequest(); // Initialize the HTTP request
	req.open("GET", url); // Try to get the index file based on the URL
	req.onreadystatechange = function() { // For each statechange...
		console.log(req.readyState);
		if (req.readyState == 4) { // See if the data stream is complete and
			if (req.status == "200") { // If we get an OK status code, then...
				/* Initialize a variable for holding the resulting array */
				var result = [];
				
				/* Get the raw responseText from the json file,
					split on the character set "},{" */
				/* Other curly braces are escaped in making the json file,
					so this substring ought to appear only between json items */
				var rawJson = req.responseText.split("},{");
				
				/* Send each json fragment to the posts object constructor */
					/* And add the new object to the result array */
				for (var i = 0; i < rawJson.length; i++) {
				}
				
				return result;
			}
			else { // Otherwise, we ran into some kind of connection error, so display an error and do nothing
				resultsContainer.innerHTML = "<b>Connection error!</b> Check that you are connected to the internet!";
				return null;
			}
		}
	}
	req.send(null);
}

//********>
// FORM FUNCTIONS
//********>

/* Resets and (de)select all functions */

/* SET ALL CHECKBOXES */
/* Sets all checkboxes with a given name to be checked (true) or unchecked (false) */
/* Params:
	name (string) = The name of the checkbox collection
	checked (bool) = Whether the boxes should be checked */
function checkboxAll(name, checked){
	var checkboxes = document.getElementsByName(name);
	for (var i = 0; i < checkboxes.length; i++) {
		checkboxes[i].checked = checked;
	}
}

/* RESET DATES */
/* Resets date selectors to defaults */
/* Note that "defaults" means what the page loads from a blank slate,
	not what the selectors are set to when navigating back from a result. */
function resetDates(){
	/* Get the select boxes */
	var beforeDates = document.getElementsByName("before");
	var afterDates = document.getElementsByName("after");
	
	/* Roll through the before dates and set them all to the largest value */
	/* Values start largest at index 0 */
	for (var i = 0; i < beforeDates.length; i++){
		beforeDates[i].selectedIndex = 0;
	}
	
	/* Roll through the after dates and set them all to the smallest value */
	/* Values start largest at index 0, so the smallest value is at the largest index */
	for (var i = 0; i < afterDates.length; i++){
		afterDates[i].selectedIndex = afterDates[i].options.length-1;
	}
}

/* RESET READ TIMES */
/* Resets read time selectors to defaults */
/* Note that "defaults" means what the page loads from a blank slate,
	not what the selectors are set to when navigating back from a result. */
function resetWords() {
	/* Get the selectors */
	var readtimes = document.getElementsByName("readtime");
	/* Set each selector to the largest possible index,
		at which the option is "any length" */
	/* (This is so that incrementing uses the up arrow key) */
	for (var i = 0; i < readtimes.length; i++){
		readtimes[i].selectedIndex = readtimes[i].options.length-1;
	}
}

/* RESET ALL */
/* Resets all advanced search fields */
/* Does NOT reset the query box! Refresh the page for that. */
function resetAllAdvanced() {
	checkboxAll("fields", true); // Search in fields
	checkboxAll("tags", true); // Tags filter
	resetDates(); // Dates selector
	resetWords(); // Words selector
	document.getElementById("new-first").checked = true; // Results sorting
}

/* SHOW ADVANCED OPTIONS */
/* Shows the advanced options */
function showAdvanced() {
	/* Set both top and bottom buttons to "close advanced" state */
	/* Be sure to replace IDs appropriately! */
	document.getElementById(topAdvancedID).outerHTML = closeAdvanced.replace(bottomAdvancedID, topAdvancedID);
	document.getElementById(bottomAdvancedID).outerHTML = closeAdvanced.replace(topAdvancedID, bottomAdvancedID);
	
	/* Set the advanced options container class to null */
	document.getElementById(advID).className = "";
	
	/* Trigger the advanced options toggle */
	doAdvanced = 1;
}

/* HIDE ADVANCED OPTIONS */
/* Hides the advanced options */
function hideAdvanced() {
	/* Set both top and bottom buttons to "open advanced" state */
	/* Be sure to replace IDs appropriately! */
	document.getElementById(topAdvancedID).outerHTML = openAdvanced.replace(bottomAdvancedID, topAdvancedID);
	document.getElementById(bottomAdvancedID).outerHTML = openAdvanced.replace(topAdvancedID, bottomAdvancedID);
	
	/* Set the advanced options container class to null */
	document.getElementById(advID).className = "hidden";
}

//********>
// OTHER FUNCTIONS
//********>

/* Random bits and bobs used in the search process */

/* ENCODE BINARY (binary - string, base - number)*/
/* Takes a binary string and a number base, from 2 to 36, and encodes the binary in the base chosen */
/* Note: For precision, input strings should be limited to 64 characters */
function encodeBinary(binary, base) {
	return (parseInt(binary, 2)).toString(base);
}
/* DECODE BINARY (number - string, base - number) */
/* Takes an encoded number string and the base used to encode it, from 2 to 36,
	and returns the binary string */
/* Note: For precision, input strings should be limited to 64 characters */
function encodeBinary(number, base) {
	return (parseInt(number, base)).toString(2);
}

function siteSearch() {
}