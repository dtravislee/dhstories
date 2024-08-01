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
	jsonIndex,		// Current json file, split into an array of posts
	indexURL,		// URL to current json file
	startIndex;		// Current page number of the paginated index files - starts at page 1
// Global counter for posts
var postCount = 1;
// Base URL as provided by Hugo
var baseURL = "{{- $.Site.BaseURL -}}";
// Total number of posts in the search index
var totalPostCount = {{- len (where (where .Site.RegularPages.Reverse `Params.hide` `=` nil) `Params.date` `!=` nil) -}};
// Number of posts per individual json index
var paginationSize = {{- .Site.Params.paginate -}};
// Total number of index pages (calculated based on total posts and index size)
var maxIndex = Math.ceil(totalPostCount / paginationSize);

/* Results variables */

var maxResults = paginationSize; // Maximum number of results per search call
var resultCount, // Number of results acquired so far, in total
	currentResultCount, // Number of results acquired in this call of continueSearch()
	resultInIndex, // Reference of result in current index (in case we hit the max amid an index)
	resultObjects; // Array of result objects
var resultsContainer = document.getElementById("results-container"); // HTML container hosting results

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
		
		/* If a result is not found, return null */
		if (! resultArray) { return null; }
		
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
	this.title = this._sanitizeText(this._getKeyValue("title"));
	this.url = this._getKeyValue("url");
	this.words = this._getKeyValue("words");
	
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
		return (this.readtime >= inputTime);
	}
	
	/* GET READ TIME LESS (integer - read time in minutes)*/
	/* Returns bool: whether the post is read time shorter than, or equal to, the input time */
	this.getReadtimeLess = function(inputTime) {
		return (this.readtime <= inputTime);
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
	/* Writes this post object as HTML, formatted the same as _default/list.html */
	/* Returns the outputted HTML */
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

/* GET JSON (url - string) */
/* Retrieves the raw content of a JSON file
	when given a URL to the target file */
/* Params: 
	url = a url pointed to a well-formatted JSON file */
function getJson(url) {
	var req = new XMLHttpRequest(); // Initialize the HTTP request
	req.open("GET", url); // Try to get the index file based on the URL
	req.onreadystatechange = function() { // For each statechange...
		if (req.readyState == 4) { // See if the data stream is complete and if so...
			if (req.status != "200") { return null; } // Return null if there is a connection error
			return req.responseText;
		}
	}
	req.send(null);
}

/* GET POSTS (rawJson - string) */
/* Creates array of post objects out of a raw JSON output */
/* Returns array of post objects, or null if the JSON input is blank */
/* Params: 
	rawJson = raw output from a getJson() call containing post information 
		(see index.json for more) */
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
		result.push(new Post(rawJson[i]));
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
function encodeBinary(number, base) {
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
	query = getQuery();
	if (doAdvanced) {
		lookIn = getCheckboxSet("fields");
		tags = getCheckboxSet("tags");
		beforeDate = getDateSelector("before");
		afterDate = getDateSelector("after");
		longerThan = getReadTime("more");
		shorterThan = getReadTime("less");
		newestFirst = getRadioSet("sort-rule") == "new-first" ? 1:0;
	}
	// Posts sort old-to-new, so if the search looks for newest posts first,
	//	it has to start at the largest index rather than the smallest
	// (This helps with caching indices, since new posts won't alter index json files)
	startIndex = newestFirst ? maxIndex:1;
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
	if (query) {
		for (var i = 0; i < query.length; i++) {
			result += encodeURIComponent(query[i]);
			if (i != query.length-1) { result += "+"; } // Use + to demarcate individual queries
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
	
	/* Number of results retrieved so far */
	/* Used when there is a saved query and we are reloading the page */
	/*	such as when navigating back from clicking a result */
	result += "&c=" + resultCount;
	
	/* Return resulting URI fragment string */
	return result;
	
}

/* GET SEARCH RESULTS */
/* Applies a search query to a given post object */
/* Returns bool: true if the query matches, false otherwise */
/* Params:
	post = a target post object */
function getSearchResults(post) {
	
	/* Basic search */
	if (!doAdvanced) {
		if (!query) { return true; } // Default to true if no query is entered
		for (var i = 0; i < query.length; i++) {
			if (post.findInPost("content", query[i])) { continue; }
			if (post.findInPost("date", query[i])) { continue; }
			if (post.findInPost("description", query[i])) { continue; }
			if (post.findInPost("edited", query[i])) { continue; }
			if (post.findInPost("readtime", query[i])) { continue; }
			if (post.findInPost("tags", query[i])) { continue; }
			if (post.findInPost("title", query[i])) { continue; }
			if (post.findInPost("url", query[i])) { continue; }
			if (post.findInPost("words", query[i])) { continue; }
			return false; // Return false if a query item isn't found anywhere
		}
		return true; // If all queries are found in the post, return true
	}
	
	/* Advanced search */
	/* We tackle this bottom-to-top in the advanced search form */
	if (!getReadtimeMore(longerThan)) { return false; }
	if (!getReadtimeLess(shorterThan)) { return false; }
	if (!getDateBefore(beforeDate)) { return false; }
	if (!getDateAfter(afterDate)) { return false; }
	for (var i = 0; i < tags.length; i++) {
		if (!post.findInPost("tags", tags[i])) { return false; }
	}
	/* For every query item, look in every checked field for it, return false if it is never found */
	for (var i = 0; i < query.length; i++) {
		for (var j = 0; j < lookIn.length; j++) {
			if (post.findInPost(lookIn[j], query[i])) { break; }
			if (j = lookIn.length-1) { return false; } 
		}
	}
	return true; // Returns if it passes every other test
}

/* SEARCH IN INDEX */
/* Applies a search query to posts in an index in a given order */
/* Params:
	startPos = the position from which to start searching through the index
	endPos = the position at which to halt the search */
/* Note that startPost can be greater than endPos, leading to a reverse direction search */
function searchInIndex(startPos, endPos){
	var i = startPos;
	while (currentResultCount < maxResults) {
		if (getSearchResults(posts[i])) { // Push matching results and increment counters
			resultObjects.push(posts[i]); 
			resultCount++;
			currentResultCount++;
		} 
		if (i != endPos) { break; } // Break if this is the last item of the index
		i = startPos > endPos ? i--:i++; // Increment or decrement whether we're going forwards or backwards
	}
}

/* START SEARCH */
/* Begins a user search query */
function startSearch() {
	popVars(); 	// Populate main variables
	window.location.hash = encodeQueryHash(); // Encode the query as a URI fragment in the browser URI
	continueSearch(); // Perform an initial search
}

/* CONTINUES SEARCH */
/* Iterates a search query, e.g. when the user clicks "load more results" */
function continueSearch() {
	/* Reset the resultsObject array */
	resultObjects = [];
	/* If we left off in the middle of an index, finish that first */
	if (0 < resultInIndex < paginationSize) {
		// Set end point based on whether new or old first
		// (Note that new posts are at the end!)
		var endPos = newestFirst ? (paginationSize-1):0;
		// Finish the search on the current index
		searchInIndex(resultInIndex, endPos); 
	}
	/* Only pull more results if still needed (and said results exist) */
	while (currentResultCount < maxResults && 1 <= startIndex <= maxIndex) {
		
		/* Get the next index URL */
		/* Index page 1 has a different URL structure - keep note! */
		indexURL = baseURL + "/index.json"
		if (startIndex > 1) { indexURL = baseURL + "/page/" + startIndex + "/index.json"; }
		
		/* Populate the posts array */
		posts = getPosts(getJson(indexURL));
		
		/* Set start and end positions for index searching, based on whether we look for newest posts first */
		var startPos = newestFirst ? 0:(paginationSize-1);
		var endPos = newestFirst ? (paginationSize-1):0;
		searchInIndex(startPos, endPos);
		
		/* Increment or decrement the index number whether we're going forwards or backwards */
		startIndex = newestFirst ? startIndex--:startIndex++;
	}
	// Update the count record in the URI hash
	window.location.hash = window.location.hash.replace(/&c=[0-9]+/g, "&c=" + resultCount);
	
	// Finally, write the collected results to the results container
	for (var i = 0; i < resultObjects.length; i++) {
		resultsContainer.innherHTML += resultObjects[i].writeToHtml();
	}
}

/* If we decide to paginate:
	-go through all the posts to get results
	-Instead of writing all the results as HTML, write only the index number and post number in that index
	-Then, based on what posts need to show, use those numbers to pull the data from the index files again
	(Does require a few added HTTP request calls but, with caching, that should be okay...)
BUT Finish this version first, then duplicate and change it, just in case we want to revert it!

Maybe pre-load search indices too. We could still pre-load...
-But that could mean more server calls...
-Unless cached...?
*/