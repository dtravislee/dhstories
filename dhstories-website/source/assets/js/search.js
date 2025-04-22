//********>
// SEARCH.JS
//********>

/* The bread and butter of the search function */

//********>
// GLOBAL VARIABLES
//********>

/* User input variables */

var searchQuery, 		// The main search query
	lookIn, 			// Post fields the engine should look into (e.g. title)
	badTags, 			// Blacklisted tags
	beforeDate,			// Date posts should be newer than
	afterDate,			// Date posts should be older than
	longerThan,			// The read time posts should be longer than
	shorterThan,		// The read time posts should be shorter than
	oldestFirst;		// Whether the results order by oldest posts first (default: new first)
	
/* Index variables */

var posts = [];		// Current set of posts pulled from JSON files, as object array
var jsonIndex,		// Current json file, split into an array of posts
	indexURL,		// URL to current json file
	startSearchIndex;		// Current page number of the paginated index files
// Base URL as provided by Hugo
var baseURL = "{{- $.Site.BaseURL -}}";
// Total number of posts in the search indices
var totalPostCount = {{- len (where (where .Site.RegularPages.Reverse `Params.hide` `=` nil) `Params.date` `!=` nil) -}};
// Number of posts per individual json index
var paginationSize = {{- .Site.Params.paginate -}};
// Total number of index pages (calculated based on total posts and index size)
var maxIndex = Math.ceil(totalPostCount / paginationSize);

/* Results variables */

var maxVisibleResults = paginationSize; // Maximum number of results to show per search
var maxResults = maxVisibleResults * 2; // Maximum number of results to grab per search, including cached results
var visibleResults = []; // Result objects to show the user
var cachedResults = []; // Result objects from an index that go over the maxVisibleResults limit
var resultsContainer = document.getElementById("results-container"); // HTML container hosting results
var snippetLength = 120; // About how long the post snippet should be, in characters (imprecise)
var searchCount = 0; // Number of times search has run
var targetSearchCount = 1; // Number of times to run the search count
var resultsGroupName = "results-group"; // ID prefix for results group elements

/* Load More button variables */

var lmContainerId = "load-more-container"; // Container
var lmButtonId = "load-more"; // Load more link / button
var lmEndId = "end-results"; // End of results text box
var lmNoneId = "no-results"; // No results found text box

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
var doAdvanced = 0;
// The base used for encoding binary to a text string, from 2 to 36 inclusive
// Higher numbers means greater compression
var binaryEncodingRadix = 36;	


//********>
// POST OBJECT
//********>

/* The framework for post objects that do the heavy lifting on search */
/* Params: rawJson = a fragment of raw JSON text
	as specified by layouts/_default/index.json */

function Post(rawJson) {
	
	/*---*/
	/* PRIVATE FUNCTIONS */
	/*---*/
	
	/* SANITIZE TEXT (string) */
	/* (private function) */
	/* Undoes JSON escape characters, e.g. \n, &rdquo; etc. */
	this._sanitizeText = function(input) {
		return input.replace(/(\\s|\\n|\\r|\s|\n|\r)/, " ") 
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
		
		/* If a result is not found, return null */
		if (!resultArray) { return null; }
		
		/* Otherwise... */
		
		/* Get the key-value pair (first result in resultArray) */
		var kvPair = resultArray[0];
		
		/* Extract and return the value in the key-value pair by:
			1. Trimming the leading key segment, and
			2. Cutting trailing quotation marks, commas, semicolons, whitespace, etc. */
		var keyRegex = new RegExp('^"' + key + '":\\s*"');
		return kvPair.replace(keyRegex, "").replace(/"(;|,)*\s*$/, "");
	}
	
	/* PARSE DATEPARTS */
	/* Takes the object's date parts (year, month, day) and returns a date object */
	this._parseDateparts = function() {
		var rawDate = new Date(this.year, (this.month-1), this.day);
		return rawDate;
	}
	
	/*---*/
	/* ATTRIBUTES */
	/*---*/
	
	// Searchable attributes
	this.content = this._sanitizeText(this._getKeyValue("content"));
	this.date = this._getKeyValue("date");
	this.description = this._sanitizeText(this._getKeyValue("description"));
	this.edited = this._getKeyValue("edited");
	this.readtime = this._getKeyValue("readtime");
	this.tags = this._sanitizeText(this._getKeyValue("tags"));
	this.taglinks = this._sanitizeText(this._getKeyValue("taglinks"));
	this.title = this._sanitizeText(this._getKeyValue("title"));
	this.url = this._getKeyValue("url");
	this.words = this._getKeyValue("words");
	this.snippet = "";
	
	// Datepart attributes
	this.year = this._getKeyValue("year");
	this.month = this._getKeyValue("month");
	this.day = this._getKeyValue("day");
	this.time = this._parseDateparts();
	
	/*---*/
	/* PUBLIC FUNCTIONS */
	/*---*/
	
	/* GET DATE BEFORE (integer - milliseconds since Jan 1, 1970)*/
	/* Returns bool: whether the post was published on or before the date provided as argument */
	this.getDateBefore = function(inputTime) {
		return (this.time <= inputTime);
	}
	
	/* GET DATE AFTER (integer - milliseconds since Jan 1, 1970)*/
	/* Returns bool: whether the post was published on or after the date provided as argument */
	this.getDateAfter = function(inputTime) {
		return (this.time >= inputTime);
	}
	
	/* GET READ TIME MORE (integer - read time in minutes)*/
	/* Returns bool: whether the post read time is longer than, or equal to, the input time */
	this.getReadtimeMore = function(inputTime) {
		return (parseInt(this.readtime) >= parseInt(inputTime));
	}
	
	/* GET READ TIME LESS (integer - read time in minutes)*/
	/* Returns bool: whether the post is read time shorter than, or equal to, the input time */
	this.getReadtimeLess = function(inputTime) {
		return (parseInt(this.readtime) <= parseInt(inputTime));
	}
	
	/* FIND IN CONTENT (query-string) */
	/* Finds the given query in the post's content and populates the post snippet if needed */
	/* Behaves like string.search(), just with extra logic to populate the post snippet */
	this.findInContent = function(query) { 
		/* Find the index where the query first appears */
		var queryIndex = this.content.search(query);
		
		/* If no snippet exists, populate it */
		if (!this.snippet && queryIndex != -1) {
			
			/* Start by getting the snippet's start / end indices */
			var charactersMargin = snippetLength / 2; // Get # of characters to left or right to grab
			var startIndex = queryIndex - charactersMargin; // Where to start the substring
			var endIndex = queryIndex + charactersMargin; // Where to end the substring
			if (startIndex < 0) { startIndex = 0; } // Normalize startIndex into bounds if needed
			if (endIndex > this.content.length) { endIndex = this.content.length; } // Normalize endIndex into bounds
			
			/* Then grab the snippet and cut it off at a space character for good presentation */
			var snippetString = this.content.substring(startIndex, endIndex); // Get the snippet
			startIndex = snippetString.indexOf(" "); // Move the startIndex to the first space in the snippet
			endIndex = snippetString.lastIndexOf(" "); // Move the endIndex to the last space in the snippet
			snippetString = snippetString.substring(startIndex, endIndex); // Trim the snippet at the space characters
			
			/* Clean up some character escapes */
			snippetString = snippetString.replace(/\\n/g, " "); // New line escapes
			snippetString = snippetString.replace(/\\u0026/g, "&"); // Ampersand escapes
			
			/* Finally, save the snippet */
			this.snippet = "…" + snippetString + "…";
		}
		/* Return the index where the query appears as a boolean*/
		return queryIndex;
	}
	
	/* FIND IN POST (key-string, query-string) */
	/* Returns bool: whether the given query string exists in the post property identified by a given key. */
	/*	Or false if improperly formatted */
	/* Valid keys include any of the searchable attribute names */
	this.findInPost = function(key, query) {
		var cleanQuery = query.toString();
		/* Negation handling (removing leading - character) */
		if (cleanQuery.charAt(0) == "-") { cleanQuery = cleanQuery.substring(1); }
		/* Regexp handling */
		var regexQuery = cleanQuery.match(/\/.*?\//);
		if (regexQuery) {
			// Clean out the regex indicators (slashes) when making it into a regular expression
			try { cleanQuery = new RegExp(regexQuery[0].substring(1, regexQuery[0].length-1), "i"); }
			catch (e) {	var dump = e; /* IE7 */ }
		}
		else {
			/* Final conversion to regexp for case insensitivity */
			/* Seems to help search accuracy in other ways, too! */
			try { cleanQuery = new RegExp(cleanQuery, "i"); }
			catch (e) { var dump = e; /* IE7 */ }
		}
		switch(key) {
			case "content": return (this.findInContent(cleanQuery) != -1) ? true:false; // All body content
			case "date": return (this.date.search(cleanQuery) != -1 || this.edited.search(cleanQuery) != -1) ? true:false; // Both edited and regular dates
			case "description": return (this.description.search(cleanQuery) != -1) ? true:false; // Description / subtitle
			case "readtime": return (this.readtime.search(cleanQuery) != -1) ? true:false; // Post read time
			case "tags": return (this.tags.search(cleanQuery) != -1 || this.taglinks.search(cleanQuery) != -1) ? true:false; // Tags and tag URLs
			case "title": return (this.title.search(cleanQuery) != -1) ? true:false; // Titles
			case "url": return (this.url.search(cleanQuery) != -1) ? true:false; // Post URLs
			case "words": return (this.words.search(cleanQuery) != -1) ? true:false; // Post word counts
			default: return false;
		}
	}
	
	/* WRITE TO HTML */
	/* Writes this post object as HTML, formatted the same as _default/list.html */
	/* Returns the outputted HTML */
	this.writeToHtml = function () {
		var output = "<div role='article' class='listed-article'>"
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
		if (this.readtime != "" && this.words != "") {
			output += "<p class='meta'>"
				+ this.readtime
				+ " minute read ("
				+ this.words
				+ " words)";
		}
		if (this.tags != "") {
			/* Split the tags string into an array, then loop it */
			var tagsArray = this.tags.split("; ");
			var taglinksArray = this.taglinks.split("; ");
			var tagsCount = tagsArray.length; // Same as taglinks
			output += "<p class='meta'>Tags: ";
			for (var i = 0; i < tagsCount; i++) {
				output += "<a href='/tags/"
					+ taglinksArray[i]
					+ "'><span>"
					+ tagsArray[i]
					+ "</span></a>";
				/* Add a comma-space after every entry except the last one */
				if (i < tagsCount-1){
					output += ", ";
				}
			}
			output += "</p>";
		}
		if (this.snippet != "") {
			output += "<p class='snippet'>" 
				+ this.snippet 
				+ "</p>";
		}
		output += "</div>";
		return output;
	}
}

//********>
// GETTER FUNCTIONS
//********>

/* GET QUERY */
/* Gets and sanitizes the user-input query */
/* Returns a string array representing the query keywords */
function getQuery() {
	
	/* Get the input value first */
	var queryValue = document.getElementById("search-input").value;
	
	/* If the value is empty, return null before further processing */
	if (!queryValue) { return null; }
	
	/* Use an empty array variable to store the final result */
	var result = [];
	
	/* Get the query as written */
	/* We add leading and trailing spaces to ease targeting indicators */
	/*	(Because we don't need special start-of-string / end-of-string cases) */
	var rawQuery = " " + queryValue.toLowerCase() + " ";
	
	/* Remove orphan indicators (any -, /, or " surrounded by spaces) */
	var rawQueryClean = rawQuery.replace(/\s+[-\/"]\s+/g, " ");
		
	/* Extract Regex from query and remove them from the raw query string */
	var regexQueryExp = /\s-?\/.*?\/\s/g;
	var regexExpMatch = rawQueryClean.match(regexQueryExp);
	/* If any regex is found, add it to result and remove it from the raw query string */
	if (regexExpMatch) {
		result = result.concat(regexExpMatch);
		rawQueryClean = rawQueryClean.replace(regexQueryExp, " ");
	}
	
	/* Same as above, but for literals (quotation marks) */
	var regexQueryLit = /\s-?".+?"\s/g;
	var regexLitMatch = rawQueryClean.match(regexQueryLit);
	/* If any regex for literals is found, add it to result and remove it from the raw query string */
	if (regexLitMatch) { 
		/* Ensure quotation marks are removed from the actual query item */
		for (var i = 0; i < regexLitMatch.length; i++) {
			regexLitMatch[i] = regexLitMatch[i].replace(' "', "").replace('" ', "");
		} 
		result = result.concat(regexLitMatch); 
		rawQueryClean = rawQueryClean.replace(regexQueryLit, " ");
	}
	
	/* Finally, split what is left based on spaces and add it to the result */
	rawQueryClean = rawQueryClean.replace(/\s+/g, " "); // Discards extra consecutive spaces
	rawQueryClean = rawQueryClean.replace(/^\s+/g, ""); // Discards any leading space
	rawQueryClean = rawQueryClean.replace(/\s+$/g, ""); // Discards any trailing space
	if (rawQueryClean) { /* Will be true if any other query items remain */
		result = result.concat(rawQueryClean.split(" "));
	}
	
	/* Return the array */
	return result;
}

/* GET CHECKBOX ARRAY (name - string) */
/* Gets the results of a group of checkboxes by a shared name */
/* Returns array of strings, one for each checked box */
/* Params:
	name = value of name attribute of checkbox group */
function getCheckboxSet(name) {
	
	/* Initiate an empty array variable to store the result */
	var result = [];
	
	/* Pull all the field checkboxes */
	var boxes = document.getElementsByName(name);
	
	/* If we are handling tags, we want to get unchecked boxes instead, so...*/
	if (name == "tags") {
		/* Range through the field checkboxes and, if it is unchecked, add to the result */
		for (var i = 0; i < boxes.length; i++) {
			if (!boxes[i].checked) { result.push(boxes[i].value); }
		}
	}
	/* Otherwise, retrieve checked values as normal */
	else {
		for (var i = 0; i < boxes.length; i++) {
			if (boxes[i].checked) { result.push(boxes[i].value); }
		}
	}
	
	
	/* Return the resulting array */
	return result;
}

/* GET DATE SELECTOR */
/* Gets the date from a group of select boxes sharing the same name */
/* Returns a date object */
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
	return dateObject;
}

/* GET READ TIME (type - string, one of "more" or "less" */
/* Gets the selected read time */
/* Params: one of "more" or "less", as a string */
function getReadTime(type) {
	return document.getElementById("readtime-" + type).value;
}

/* GET RADIO SET RESULT (name - string) */
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

/* GET CHECKBOX AS BINARY (name - string) */
/* Gets binary representation of an array of checkboxes */
/*	1 = checked, 0 = unchecked */
/* Params:
	name = value of name attribute of checkbox group */
function getCheckboxBinary(name) {

	/* Initialize result variable */
	var result = "";
	
	/* Pull all the checkboxes with the given name */
	var boxes = document.getElementsByName(name);
	
	/* Range through the checkboxes
		if it is checked, append 1 to the result
		if it is unchecked, append 0 to the result */
	for (var i = 0; i < boxes.length; i++) {
		if (boxes[i].checked) { result += "1"; }
		else { result += "0"; }
	}
	
	/* Return the resultant binary string */
	return result;
}

//********>
// SETTER FUNCTIONS
//********>

/* SET ALL CHECKBOXES (name - string, checked - bool) */
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

/* SET CHECKBOX FROM HASH (name - string) */
/* Sets checkbox group, ID'd by name, based on code in URI fragment */
/* Params:
	name = name attribute of target checkbox group */
function setCheckboxFromHash(name) {
	/* Try to pull the hash fragment from the URI before continuing */
	var boxesHash = pullFromHash(name);
	if (boxesHash) { 
		/* Decode the hash to binary */
		var boxesBinary = encodeToBinary(boxesHash);
		/* Target all field checkboxes */
		var boxes = document.getElementsByName(name);
		/* Append leading "0" characters until it matches the number of boxes */
		while (boxesBinary.length < boxes.length) {
			boxesBinary = "0" + boxesBinary;
		}
		/* Cap loop at the smaller of the binary string and checkboxes count to prevent exceptions */
		var checkboxLoopMax = Math.min(boxesBinary.length, boxes.length);
		/* For every bit / checkbox, check box if bit = 1, otherwise uncheck */
		for (var i = 0; i < checkboxLoopMax; i++) {
			if (boxesBinary.charAt(i) == "1") { boxes[i].checked = true; }
			else { boxes[i].checked = false; }
		}
	}
}

/* SET CHECKBOX FROM HASH (name - string) */
/* Sets group of selectors for a date, ID'd by name, based on code in URI fragment */
/* Params:
	name = name attribute of target date group */
function setDateFromHash(name) {
	var hashDate = pullFromHash(name);
	if (hashDate) {
		var hashDateParts = hashDate.split("-");
		var dateElement = document.getElementsByName(name);
		var dateLoopMax = Math.min(hashDateParts.length, dateElement.length);
		for (var i = 0; i < dateLoopMax; i++) {
			dateElement[i].value = hashDateParts[i];
		}
	}
}

/* SET READ-TIME FROM HASH (name - string) */
/* Sets a read-time selector based on code in URI fragment */
/* Params:
	id = id attribute of target readtime selector */
function setReadTimeFromHash(id) {
	var hashReadTime = pullFromHash(id);
	if (hashReadTime) { document.getElementById(id).value = hashReadTime; }
}

/* RESET CHECK / RADIO SELECTOR */
/* Resets set of checkboxes / radio buttons to HTML-supplied default */
/* Params:
	name = name attribute of checkbox or radio group */
function resetCheckboxRadio(name) {
	var elementSet = document.getElementsByName(name);
	for (var i = 0; i < elementSet.length; i++) {
		elementSet[i].checked = elementSet[i].defaultChecked;
	}
}

/* RESET OPTION SELECTOR */
/* Resets series of drop-down selectors to HTML-supplied default */
/* Params:
	name = name attribute of selector list group */
function resetSelectors(name) {
	var elementSet = document.getElementsByName(name);
	/* Look at each selector, find its defaultSelected index,
		and change the current selected index to that default */
	for (var i = 0; i < elementSet.length; i++) {
		for (var j = 0; j < elementSet[i].options.length; j++) {
			if (elementSet[i].options[j].defaultSelected) {
				elementSet[i].selectedIndex = j;
				break;
			}
		}
	}
}

/* RESET ADVANCED ALL */
/* Resets all advanced search fields */
/* Does NOT reset the query box! See resetSearch() for that. */
function resetAllAdvanced() {
	resetCheckboxRadio("fields"); // Search in fields
	resetCheckboxRadio("tags"); // Tags filter
	resetSelectors("before"); // Before date selector
	resetSelectors("after"); // After date selector
	resetSelectors("readtime"); // Word count selector
	resetCheckboxRadio("sort-rule"); // Results sorting
}

/* RESET SEARCH */
/* Resets hash and refreshes page for a complete reset. */
function resetSearch() {
	window.location.hash = "";
	window.location.reload();
}

//********>
// FORM FUNCTIONS
//********>

/* SHOW ADVANCED OPTIONS */
/* Shows the advanced options */
function showAdvanced() {
	/* Set both top and bottom buttons to "close advanced" state */
	/* Be sure to replace IDs appropriately! */
	document.getElementById(topAdvancedID).outerHTML = closeAdvanced.replace(bottomAdvancedID, topAdvancedID);
	document.getElementById(bottomAdvancedID).outerHTML = closeAdvanced.replace(topAdvancedID, bottomAdvancedID);
	
	/* Set the advanced options container class to null */
	showHidden(advID);
	
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
	
	/* Set the advanced options container class to hidden */
	hideShown(advID);
}

//********>
// OTHER FUNCTIONS
//********>

/* NOTE: In order to encode sections and tags, split the string up 
Use groups of 32 in base 32, groups of 16 in hexadecimal
-Mind any overflow in this case: pad with 0s and be sure to abort at the end of the checkboxes list, NOT the end of the string.
(General idea is to range through the boxes array, and for each index of the box, get the index of the binary representation to determine true or false)

/* Random bits and bobs used in the search process */

/* DECODE FROM BINARY (binary - string, base - number)*/
/* Encodes a binary string into the base set in global variables */
/* Params:
	binary = string of binary to encode
/* Note: For precision, input strings should be limited to 64 characters */
function decodeFromBinary(binary) {
	return (parseInt(binary, 2)).toString(binaryEncodingRadix);
}
/* ENCODE TO BINARY (number - string, base - number, targetSize = number) */
/* Takes a number string and returns the binary string */
/* Params:
	number = string representation of a number to decode into binary
/* Note: For precision, input strings should be limited to 64 characters */
function encodeToBinary(number) {
	return (parseInt(number, binaryEncodingRadix)).toString(2);
}

//********>
// SEARCH FUNCTIONS
//********>

/* POPULATE VARIABLES */
/* Populates variables per user input query and advanced options */
function popVars() { 
	searchQuery = getQuery();
	if (doAdvanced) {
		lookIn = getCheckboxSet("fields");
		badTags = getCheckboxSet("tags");
		beforeDate = getDateSelector("before");
		afterDate = getDateSelector("after");
		longerThan = getReadTime("more");
		shorterThan = getReadTime("less");
		oldestFirst = parseInt(getRadioSet("sort-rule"));
	}
	/* Posts sort old-to-new, so if the search looks for newest posts first,
	//	it has to start at the largest index rather than the smallest
	// (This helps with caching indices, since new posts won't alter index json files) */
	startSearchIndex = (oldestFirst) ? 1:(maxIndex);
	
	/* Note that we sort lookIn so that "content", if enabled, is done first.
	/* 	We put content first because it is the only post field that is not written to the page
			by default. Putting it first ensures a snippet, if any, is guaranteed to be included.
		If you decide to remove snippets, you can change this sorting step give a small boost
			to search speeds by leaving the largest field as a last resort. */
			
	/* Temporary array for lookIn ordering */
	var lookInArray = [];
	/* Order for lookIn */
	var lookInOrder = ["content", "title", "description", "tags", "url", "date", "readtime", "words"];
	/* Default active lookIn fields */
	if(!lookIn) { lookIn = ["title", "description", "tags", "url", "date", "readtime", "words"]; }

	/* Look at each lookIn element, in order.
		If it is also present in the lookIn variable, add it to the temp array. */ 
	for (var i = 0; i < lookInOrder.length; i++) {
		for (var j = 0; j < lookIn.length; j++) {
			if (lookInOrder[i] == lookIn[j]) { lookInArray.push(lookIn[j]); break; }
		}
	}
	/* Finally, set lookIn to its ordered version */
	lookIn = lookInArray;
}

/* ENCODE QUERY HASH */
/* Encodes search form variables / state as a URI fragment string */
/*	so that returning to the search page can load the results as it was */
/* Returns URI fragment string */
function encodeQueryHash() {
	
	/* Initialize result variable ("q" for "query") */
	var result = "&q=";
	
	/* Range through query variable, adding each query item to result as a string */
	/* Queries use encodeURIComponent to prevent read issues (e.g. if a & exists in the query) */
	if (searchQuery) {
		for (var i = 0; i < searchQuery.length; i++) {
			result += encodeURIComponent(searchQuery[i]);
			if (i != searchQuery.length-1) { result += "+"; } // Use + to demarcate individual queries
		}
	}
	
	/* Advanced queries have nifty shorthands as follows:
		f = fields (to search in)
		t = tags
		b = before (date)
		a = after (date)
		m = more than (x words / minutes)
		l = less than (x words / minutes)
		n = newest first (result order)
		c = count (of results gathered)
	*/
	if (doAdvanced) {
		/* Indicator for advanced options */
		result += "&adv";
		/* Search In state */
		result += "&f=" + decodeFromBinary(getCheckboxBinary("fields"));
		/* Tags state */
		result += "&t=" + decodeFromBinary(getCheckboxBinary("tags"));
		/* Date states */
		result += "&b=" + beforeDate.getDate() + "-" + beforeDate.getMonth() + "-" + beforeDate.getFullYear();
		result += "&a=" + afterDate.getDate() + "-" + afterDate.getMonth() + "-" + afterDate.getFullYear();
		/* Read time states */
		if (longerThan) { result += "&m=" + longerThan; }
		if (shorterThan) { result += "&l=" + shorterThan; }
		/* Results order states */
		result += "&n=" + oldestFirst;
	}
	
	/* Number of times continuedSearch() has been called */
	/* Used when there is a saved query and we are reloading the page */
	/*	such as when navigating back from clicking a result */
	result += "&c=" + searchCount;
	
	/* Return resulting URI fragment string */
	return result;
	
}

/* PULL FROM HASH */
/* Gets data from URI fragment string to set search form variables / state */
/* Params:
	type = string, one of "query", "fields", "tags", "before", "after", "readtime-more", "readtime-less", "sort-rule", "search-count" */
/* Note that this does not do any type-specific processing - this only grabs the raw text string from the URI fragment. */
function pullFromHash(type) {
	/* Store the URI fragment string */
	var hashCode = window.location.hash;
	/* Get the type as a single letter key; return null-string if type is malformatted */
	var hashKey = "";
	switch(type) {
		case "query": hashKey = "q"; break;
		case "fields": hashKey = "f"; break;
		case "tags": hashKey = "t"; break;;
		case "before": hashKey = "b"; break;
		case "after": hashKey = "a"; break;
		case "readtime-more": hashKey = "m"; break;
		case "readtime-less": hashKey = "l"; break;
		case "sort-rule": hashKey = "n"; break;
		case "search-count": hashKey = "c"; break;
		default: return "";
	}
	/* Try to pull the data from the URI fragment */
	try {
		/* Create a Regex value based on the hash key input */
		var hashRegex = new RegExp('(?:' + hashKey + '=)(.*?)(?:&|$)', 'i');
		
		/* Execute the Regex as a search on the stored hash code 
			We return the [1]th result as that includes only the captured group */
		return hashRegex.exec(hashCode)[1];
	}
	catch(e) {
		var dump = e; /* IE7 */
		return ""; // Return null-string if data is not found
	}
}

/* GET SEARCH RESULTS */
/* Applies a search query to a given post object */
/* Returns bool: true if the query matches, false otherwise */
/* Params:
	post = a target post object */
function getSearchResults(post) {
	
	/* We tackle this bottom-to-top in the advanced search form,
		skipping if the form was not used */
	if (doAdvanced) {
		if (!post.getReadtimeMore(longerThan)) { return false; }
		if (!post.getReadtimeLess(shorterThan)) { return false; }
		if (!post.getDateBefore(beforeDate)) { return false; }
		if (!post.getDateAfter(afterDate)) { return false; }
		for (var i = 0; i < badTags.length; i++) {
			if (post.findInPost("tags", badTags[i])) { return false; }
		}
	}
	
	/* Query search */
	if (!searchQuery) { return true; } // Default to true / pull all if no query is entered
	
	/* For every query item, look in every checked field for it, return false if it is never found */
	for (var i = 0; i < searchQuery.length; i++) {
		var isNegated = searchQuery[i].toString().charAt(0) == "-"; // Whether this query is negated
		var isMatched = false; // Whether the query was matched
		for (var j = 0; j < lookIn.length; j++) {
			/* Try to find the item in the given property (indicated by the given key) */
			var isInPost = post.findInPost(lookIn[j], searchQuery[i]);
			/* If the item is found, but the query is negated, then we skip this post */
			if (isInPost && isNegated) { return false; }
			/* Otherwise, we say the query matches if:
				1. The query is in the post and is not negated
				2. The query is not in the post but the query is negated */
			if (isInPost && !isNegated
				|| !isInPost && isNegated ) { isMatched = true; break; } // Exit this loop if we have a match
		}
		if (isMatched) { continue; } // If the query was matched, move to the next query
		return false; // Skip this post if a query never matches
	}
	return true; // Use this post if all queries matched
}

/* START SEARCH */
/* Begins a user search query */
/* Params:
	resultsAmount = how many results to pull off the initial call of startSearch */
function startSearch(targetSearches) {
	targetSearchCount = 1; // Reset targetSearchCount, e.g. if doing a different search
	if (targetSearches) { targetSearchCount = targetSearches; } // Apply targetSearches if needed
	cachedResults = []; // Remove any cached results
	searchCount = 0; // Reset search counter
	popVars(); 	// Populate main variables
	window.location.hash = encodeQueryHash(); // Encode the query as a URI fragment in the browser URI
	resultsContainer.innerHTML = ""; // Erase any existing search result data
	hideAdvanced(); // Hide the advanced form first to get to results faster
	showHidden("reset-search-top"); // Show the reset button
	doSearch(); // Perform initial search
}

/* DO SEARCH */
/* Pulls the next index and performs a search, populating visibleResults */
function doSearch() {
	
	/* If we have cached results, add those to the visibleResults array first */
	if ( cachedResults.length ) { 
		visibleResults = cachedResults; // Move the cache to the main array
		cachedResults = []; // Empty the cached results
		doSearch(); // Recall this function
	}
	
	/* With no cached results, ensure the next index exists */
	else if (1 <= startSearchIndex && startSearchIndex <= maxIndex) {
		
		/* Get the next index URL */
		/* Index page 1 has a different URL structure - keep note! */
		indexURL = baseURL + "/index.json"
		if (startSearchIndex > 1) { indexURL = baseURL + "/page/" + startSearchIndex + "/index.json"; }
		
		
		/* USE THIS REQUEST TO FILL THE CACHE INSTEAD */
		/* Basically, the 0th call should populate visibleResults, the 1st should populate the cache */
		/* startSearch() thus should call at least twice.
		/* There should always be posts in the cache at the end of each call 
		If there aren't, then we're at the end, and we can detect that without calling again 
		This will make the load more button accurate */
		
		
		/* Get and parse the index JSON */
		var req = new XMLHttpRequest(); // Initialize the HTTP request
		req.onreadystatechange = function() { // For each statechange...
			if (req.readyState == 4 && req.status == "200") { // Once the data stream is complete...
			
				/* Split the json on the character set "},{" */
				/* Other curly braces should be escaped in making the json file,
					so this substring ought to appear only between json items */
				var rawPosts = req.responseText.split("},{");
				
				/* Send each fragment to the posts object constructor */
					/* And add the new object to the posts array */
				for (var i = 0; i < rawPosts.length; i++) {
					posts.push(new Post(rawPosts[i]));
				}
				
				/* Perform the search on this index */
				/* Since new posts are at the end of indices, we look in reverse direction */
				for (var i = paginationSize-1; i >= 0; i--) {
					if (getSearchResults(posts[i])) { visibleResults.push(posts[i]); }
				} 
				
				/* Clear the posts array */
				posts = [];
				
				/* Increment or decrement the index number whether we're going forwards or backwards */
				if (oldestFirst) { startSearchIndex = startSearchIndex + 1; }
				else { startSearchIndex = startSearchIndex - 1; }
				
				/* Recursively call this again to get more results, if needed */
				/* Note that we go for maxResults to also populate the cache,
					which we use to tell the user if there are more results to show */
				if (visibleResults.length < maxResults) { doSearch(); }
				/* Otherwise, complete this search call */
				else { endSearch(); }
			}
		}
		/* Functions that start the HTTP request */
		req.open("GET", indexURL);
		req.send(null);
	}
	/* If the next index doesn't exist, complete this search call */
	else { endSearch(); }
}

/* END SEARCH*/
/* Finalizes the search process after doSearch() acquires enough results */

function endSearch() {
	
	// Update the search counter for a successful search call
	searchCount++;
	
	// Update the results count record in the URI hash
	window.location.hash = window.location.hash.replace(/&c=[0-9]+/g, "&c=" + searchCount);
	
	// Reverse the results array, if needed
	if (oldestFirst) { visibleResults = visibleResults.reverse(); }
	
	// Write any collected results to the results container, caching any excess
	var resultHTML = "";
	if (visibleResults.length > 0) { 
		var resultsGroupClass = "";
		if (searchCount > 1) { resultsGroupClass += "' class='" + resultsGroupName; }
		resultHTML += "<div id='" + resultsGroupName + "-" + searchCount + resultsGroupClass + "'>";
		for (var resultCount = 0; resultCount < visibleResults.length; resultCount++) {
			if (resultCount < maxVisibleResults) { resultHTML += visibleResults[resultCount].writeToHtml(); }
			else { cachedResults.push(visibleResults[resultCount]); }
		}
		resultHTML += "</div>";
		resultsContainer.innerHTML += resultHTML;
	}
	
	/* If targetSearchCount is set, then we know to auto-navigate
	to where the user likely left off. 
		Just ensure it doesn't try to navigate beyond the max group number */
	if (targetSearchCount > 1) {
		var navSection = resultsGroupName + "-" + Math.min(maxIndex, targetSearchCount);
		hashNav(navSection);
	}
	
	/* Reset the visibleResults array */
	visibleResults = [];
	
	/* Load the "load more" container box / border */
	showHidden(lmContainerId);
	
	/* If we got no results (results HTML is empty), input a "no results" message to the user */ 
	if (resultsContainer.innerHTML == "") {
		hideShown(lmEndId);
		hideShown(lmButtonId);
		showHidden(lmNoneId);
	}
	/* If we have results and posts left in the cache, show the "load more" button */
	else if (cachedResults.length > 0) { 
		hideShown(lmEndId);
		hideShown(lmNoneId);
		showHidden(lmButtonId);	
	}
	/* If we have results, but none in the cache, then show "end of results" text instead */
	else {
		hideShown(lmButtonId);
		hideShown(lmNoneId);
		showHidden(lmEndId);	
	}
	
	/* Finally, repeat if we need to call another search automatically */
	if (searchCount < targetSearchCount) { doSearch(); }
}

/* --- */
/* PAGE LOAD SCRIPTS */
/* --- */

/* LOAD PREVIOUS QUERY */
/* Takes a query encoded in the URI hash and populates related fields, then re-runs the search */

if (window.location.hash) {
	
	/* Enable doAdvanced if needed */
	if (window.location.hash.indexOf("&adv") != -1) { doAdvanced = 1; }
	
	/* Query textbox population */
	/* We need to decode the URI encoding and swap "+" characters back to " " per encodeQueryHash() */
	document.getElementById("search-input").value = decodeURIComponent(pullFromHash("query").replace("+", " "));

	/* Checkbox populations */
	setCheckboxFromHash("fields");
	setCheckboxFromHash("tags");
	
	/* Date selectors setting */
	setDateFromHash("before");
	setDateFromHash("after");
	
	/* Read time selectors setting */
	setReadTimeFromHash("readtime-more");
	setReadTimeFromHash("readtime-less");
	
	/* Sort rule setting */
	var sortRule = pullFromHash("sort-rule");
	if (sortRule) { document.getElementsByName("sort-rule")[sortRule].checked = true; }
	
	/* Initial searches setting */
	var loadedSearchCount = pullFromHash("search-count");
	if (loadedSearchCount) { startSearch(loadedSearchCount); }
}