//********>
// SEARCH.JS
//********>

/* The bread and butter of the search function */

//********>
// GLOBAL VARIABLES
//********>

/* User input variables */

var searchQuery, 		// The main search query
	lookIn, 			// The "Search In" section results
	tags, 				// Tags that posts ought to have
	beforeDate,			// Date posts should be newer than
	afterDate,			// Date posts should be older than
	longerThan,			// The read time posts should be longer than
	shorterThan;		// The read time posts should be shorter than
var newestFirst = true;	// Whether the results order by newest first (as a number, 1 or 0)
	
/* Index variables */

var posts,			// Current set of posts pulled from JSON files, as object array
	jsonIndex,		// Current json file, split into an array of posts
	indexURL,		// URL to current json file
	startIndex;		// Current page number of the paginated index files
// Global counter for posts
var postCount = 0;
// Base URL as provided by Hugo
var baseURL = "{{- $.Site.BaseURL -}}";
// Total number of posts in the search indices
var totalPostCount = {{- len (where (where .Site.RegularPages.Reverse `Params.hide` `=` nil) `Params.date` `!=` nil) -}};
// Number of posts per individual json index
var paginationSize = {{- .Site.Params.paginate -}};
// Total number of index pages (calculated based on total posts and index size)
var maxIndex = Math.ceil(totalPostCount / paginationSize);

/* Results variables */

var maxResults = paginationSize; // Maximum number of results to show per call of doSearch()
var resultObjects = []; // Array of result objects
var resultCount = 0; // Number of results acquired in this call of doSearch()
var resultsContainer = document.getElementById("results-container"); // HTML container hosting results
var cachedResults = []; // Any results grabbed that go over the maxResults value
var searchCount = 0; // How many times doSearch() has been called
var targetSearchCount = 1; // How many times we want doSearch() to call when pressing "begin search"
var snippetLength = 120; // About how long the post snippet should be, in characters (imprecise)

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

// The base used for encoding fields-to-search
// Since the number of fields should be far less than 64, where toString and parseInt can lack precision,
//	we just use how many fields there are
var fieldsEncodingRadix = document.getElementsByName("fields").length;
// The base used for encoding tags, from 2 to 36 inclusive
// Higher numbers means greater compression
var tagsEncodingRadix = 36;	


//********>
// POST OBJECT
//********>

/* The framework for post objects that do the heavy lifting on search */
/* Params: rawJson = a fragment of raw JSON text
	as specified by layouts/_default/index.json
	and gathered by getPosts(); */

function Post(rawJson) {
	
	// Post number / ID
	this.num = postCount;
	postCount++; // Increment counter for each retrieved post
	
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
		/* 		Note that we put content first because it is the only field that is not written to the page
			by default. Putting it first ensures a snippet, if any, is guaranteed to be included.
				If you decide to remove snippets, you can move "content" to the bottom and give a small boost
			to search speeds by leaving the largest field as a last resort. */
		switch(key) {
			case "content": return (this.findInContent(cleanQuery) != -1) ? true:false;
			case "date": return (this.date.search(cleanQuery) != -1) ? true:false;
			case "description": return (this.description.search(cleanQuery) != -1) ? true:false;
			case "edited": return (this.edited.search(cleanQuery) != -1) ? true:false;
			case "readtime": return (this.readtime.search(cleanQuery) != -1) ? true:false;
			case "tags": return (this.tags.search(cleanQuery) != -1) ? true:false;
			case "title": return (this.title.search(cleanQuery) != -1) ? true:false;
			case "url": return (this.url.search(cleanQuery) != -1) ? true:false;
			case "words": return (this.words.search(cleanQuery) != -1) ? true:false;
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

/* GET POSTS (rawJson - string) */
/* Creates array of post objects out of a raw JSON output */
/* Returns array of post objects, or null if the JSON input is blank */
/* Params: 
	rawJson = raw json output containing post information */
function getPosts(rawJson) {

	/* Initialize a variable for holding the resulting array */
	var result = [];
	
	/* Split the json on the character set "},{" */
	/* Other curly braces should be escaped in making the json file,
		so this substring ought to appear only between json items */
	var rawPosts = rawJson.split("},{");
	
	/* Send each fragment to the posts object constructor */
		/* And add the new object to the result array */
	for (var i = 0; i < rawPosts.length; i++) {
		result.push(new Post(rawPosts[i]));
	}
	
	/* Return the array */
	return result;
}

//********>
// FORM FUNCTIONS
//********>

/* Resets and (de)select all functions */

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
	
	/* Get the read time select lists */
	var readtimeMore = document.getElementById("readtime-more");
	var readtimeLess = document.getElementById("readtime-less");
	
	/* Set the "more than" read time to the smallest value */
	/* and the "less than" read time to the largest value */
	/* Values start largest at index 0, so the smallest value is at the largest index */
	readtimeMore.selectedIndex = readtimeMore.options.length-1;
	readtimeLess.selectedIndex = 0;
}

/* RESET ADVANCED ALL */
/* Resets all advanced search fields */
/* Does NOT reset the query box! See resetSearch() for that. */
function resetAllAdvanced() {
	checkboxAll("fields", true); // Search in fields
	checkboxAll("tags", true); // Tags filter
	resetDates(); // Dates selector
	resetWords(); // Words selector
	document.getElementById("new-first").checked = true; // Results sorting
}


/* RESET SEARCH */
/* Resets hash and refreshes page for a complete reset. */
function resetSearch() {
	window.location.hash = "";
	window.location.reload();
}

/* SHOW HIDDEN ELEMENT */
/* Takes ID of an element and removes any "hidden" class */
/* Preserves other classes */
function showHidden(Id) {
	document.getElementById(Id).className = document.getElementById(Id).className.toString().replace(/hidden/g, "");
}

/* HIDE SHOWN ELEMENT */
/* Same as showHidden, but adds "hidden" class to hide the element instead */
function hideShown(Id) {
	showHidden(Id); // Remove any existing "hidden" classes
	document.getElementById(Id).className += " hidden";
}

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

/* SHOW / HIDE LOAD MORE BUTTON */
/* Shows (or hides) the "load more results" button, as needed */
function loadMoreButton() {
	
	/* IDs for containers and buttons */
	/* Check the markdown file for what these should be set to */
	var lmContainerId = "load-more-container";
	var lmButtonId = "load-more";
	var lmEndId = "end-results";
	
	/* Load the container box / border first */
	showHidden(lmContainerId);
	
	/* Then, show the button, and only the button, only if we have posts left to look at */
	if ( postCount < totalPostCount || cachedResults.length ) {
		hideShown(lmEndId);
		showHidden(lmButtonId);	
	}
	
	/* Otherwise, hide the button and show an "End of Results" text instead */
	else { 
		hideShown(lmButtonId);
		showHidden(lmEndId); 
	}
}

//********>
// OTHER FUNCTIONS
//********>

/* NOTE: In order to encode sections and tags, split the string up 
Use groups of 32 in base 32, groups of 16 in hexadecimal
-Mind any overflow in this case: pad with 0s and be sure to abort at the end of the checkboxes list, NOT the end of the string.
(General idea is to range through the boxes array, and for each index of the box, get the index of the binary representation to determine true or false)

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
function decodeBinary(number, base) {
	return (parseInt(number, base)).toString(2);
}

/* GET CHECKBOX AS BINARY (name - string) */
/* Gets binary representation of an array of checkboxes */
/*	1 = checked, 0 = unchecked */
/* Returns binary string with a 1 appended to the front (to avoid truncation) */
/* Params:
	name = value of name attribute of checkbox group */
function getCheckboxBinary(name) {

	/* Initialize result variable */
	/* We initialize with 1 so that leading 0s do not get truncated */
	var result = "1";
	
	/* Pull all the field checkboxes */
	var boxes = document.getElementsByName(name);
	
	/* Range through the field checkboxes
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
// SEARCH FUNCTIONS
//********>

/* POPULATE VARIABLES */
/* Populates variables per user input query and advanced options */
function popVars() { 
	searchQuery = getQuery();
	if (doAdvanced) {
		lookIn = getCheckboxSet("fields");
		tags = getCheckboxSet("tags");
		beforeDate = getDateSelector("before");
		afterDate = getDateSelector("after");
		longerThan = getReadTime("more");
		shorterThan = getReadTime("less");
		newestFirst = (getRadioSet("sort-rule") == "new-first") ? 1:0;
	}
	/* Posts sort old-to-new, so if the search looks for newest posts first,
	//	it has to start at the largest index rather than the smallest
	// (This helps with caching indices, since new posts won't alter index json files) */
	startIndex = (newestFirst) ? (maxIndex):1;
}

/* ENCODE QUERY HASH */
/* Encodes search form variables / state as a URI fragment string */
/*	so that returning to the search page loads the results as it was */
/* Returns URI fragment string */
function encodeQueryHash() {
	
	/* Initialize result variable */
	var result = "q=";
	
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
		/* Search In state */
		result += "&f=" + encodeBinary(getCheckboxBinary("fields"), fieldsEncodingRadix);
		/* Tags state */
		result += "&t=" + encodeBinary(getCheckboxBinary("tags"), tagsEncodingRadix);
		/* Date states */
		result += "&b=" + beforeDate.getDate() + "-" + beforeDate.getMonth() + "-" + beforeDate.getFullYear();
		result += "&a=" + afterDate.getDate() + "-" + afterDate.getMonth() + "-" + afterDate.getFullYear();
		/* Read time states */
		if (longerThan) { result += "&m=" + longerThan; }
		if (shorterThan) { result += "&l=" + shorterThan; }
		/* Results order states */
		result += "&n=" + newestFirst;
	}
	
	/* Number of times continuedSearch() has been called */
	/* Used when there is a saved query and we are reloading the page */
	/*	such as when navigating back from clicking a result */
	result += "&c=" + searchCount;
	
	/* Return resulting URI fragment string */
	return result;
	
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
		/* For every checked tag, see if it exists in the post; if at least one does, move on */
		var postContainsTag = false;
		for (var i = 0; i < tags.length; i++) {
			if (post.findInPost("tags", tags[i])) { postContainsTag = true; break; }
		}
		if (!postContainsTag) { return false; }
	}
	
	/* Query search */
	if (!searchQuery) { return true; } // Default to true if no query is entered
	var keyArray = ["content", "date", "description", "edited", "readtime", "tags", "title", "url", "words"];
	if (doAdvanced) { keyArray = lookIn; } // Update key array to advanced "look in" checkboxes, if needed
	
	/* For every query item, look in every checked field for it, return false if it is never found */
	for (var i = 0; i < searchQuery.length; i++) {
		var isNegated = searchQuery[i].toString().charAt(0) == "-"; // Whether this query is negated
		var isMatched = false; // Whether the query was matched
		for (var j = 0; j < keyArray.length; j++) {
			/* Try to find the item in the given property (indicated by the given key) */
			var isInPost = post.findInPost(keyArray[j], searchQuery[i]);
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

/* WRITE SEARCH RESULTS */
/* Takes an array of results and writes the HTML to the page, up to maxResults */
/* Any excess results are cached. */
/* Params:
	results = an array of post objects */
/* Note that maxResults is 1-index, while i is 0-index. */
function writeSearchResults(results) {
	for (var i = 0; i < results.length; i++) {
		if (resultCount < maxResults || searchCount <= targetSearchCount) { 
			resultsContainer.innerHTML += results[i].writeToHtml(); // Write the result
			resultCount++; // Increment the counter of written results
		}
		else { cachedResults.push(results[i]); }
	}
}

/* START SEARCH */
/* Begins a user search query */
/* Params:
	searchCallsAmount: How many times to call doSearch() when starting */
function startSearch(searchCallsAmount) {
	if (searchCallsAmount) { targetSearchCount = searchCallsAmount; }
	cachedResults = []; // Remove any cached results
	postCount = 0; // Reset post counter
	popVars(); 	// Populate main variables
	window.location.hash = encodeQueryHash(); // Encode the query as a URI fragment in the browser URI
	resultsContainer.innerHTML = ""; // Erase any existing search result data
	hideAdvanced(); // Hide the advanced form first to get to results faster
	showHidden("reset-search-top"); // Show the reset button
	doSearch(); // Perform initial search
}

/* CONTINUE SEARCH */
/* Reiterates the next part of a search, if able */
/* Also handles any call of doSearch() that procures matches */
function continueSearch() {
	// Continue the search if we haven't hit the max results cap
	// OR if we need to call it a certain number of times
	if ( resultCount < maxResults || searchCount <= targetSearchCount ) { doSearch(); }
	// Otherwise, handle post-continueSearch() logic by....
	else { 
		resultCount = 0; // reset the result count for this call
		loadMoreButton(); // toggle the "load more" button
	}
}

/* DO SEARCH */
/* Iterates a search query, e.g. when the user clicks "load more results" */
function doSearch() {
	/* Reset the resultObjects array */
	resultObjects = [];
	
	/* Increment the counter for calls to this function */
	searchCount++;
	
	// Update the searches count record in the URI hash
	window.location.hash = window.location.hash.replace(/&c=[0-9]+/g, "&c=" + searchCount);
	
	/* If we have cached results, show them first */
	if ( cachedResults.length ) { 
		resultObjects = cachedResults; // Move the cache to the main array
		cachedResults = []; // Empty the cached results
		writeSearchResults(resultObjects); // Write the results to the page
		continueSearch(); // Repeat, if necessary
	}
	/* Otherwise, pull the next index if it exists */
	else if (1 <= startIndex && startIndex <= maxIndex) {
		
		/* Get the next index URL */
		/* Index page 1 has a different URL structure - keep note! */
		indexURL = baseURL + "/index.json"
		if (startIndex > 1) { indexURL = baseURL + "/page/" + startIndex + "/index.json"; }
		
		/* Get and parse the index JSON */
		var req = new XMLHttpRequest(); // Initialize the HTTP request
		req.onreadystatechange = function() { // For each statechange...
			if (req.readyState == 4 && req.status == "200") { // Once the data stream is complete...
			
				/* Populate the posts array */
				posts = getPosts(req.responseText);
				
				/* Perform the search on this index */
				/* Since new posts are at the end of indices, we look in reverse direction */
				for (var i = paginationSize-1; i >= 0; i--) {
					if (getSearchResults(posts[i])) { resultObjects.push(posts[i]); }
				} 
				
				// Reverse the results array, if needed
				if (!newestFirst) { resultObjects = resultObjects.reverse(); }
				
				// Write the collected results to the results container, up to maxResults
				writeSearchResults(resultObjects);
				
				/* Increment or decrement the index number whether we're going forwards or backwards */
				if (newestFirst) { startIndex = startIndex - 1; }
				else { startIndex = startIndex + 1; }
				
				// Repeat the search if we still need posts
				continueSearch();
			}
		}
		/* Functions that start the HTTP request */
		req.open("GET", indexURL);
		req.send(null);
	}

	/* If we are at the last index and have no results, write that as a message */
	/* If we have results, though, update the "load more" button */
	else {
		if (resultsContainer.innerHTML == "") { resultsContainer.innerHTML = "<em>No results found</em>" }
		else { loadMoreButton(); }
	}
}

/* --- */
/* PAGE LOAD SCRIPTS */
/* --- */

/* LOAD PREVIOUS QUERY */
/* Takes a query encoded in the URI hash and populates related fields, then re-runs the search */