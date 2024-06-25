//********>
// SEARCH.JS
//********>

// Gets posts from JSON files based on search query @ search.html
// Advanced options coming soon!
// As an overview, this:
//	1. Gets the first JSON file and query string
//	2. Translates the query string into a query object, containing an array of keywords + a function that can perform a search using the keywords on a specified bit of text
//	3. Translates the JSON file into individual posts
//	4. Applies the query string search function to each post
//	5. Translates matching posts to post objects, which are stored in an array
//	6. Loops the array once it has 10 elements and uses the post object writeToHTML function to write each post to the result div
//	7. Repeats the above every 10 successful results, pulling new query files as needed.

//********>
// GLOBAL VARIABLES
//********>

var queryInput = document.getElementById("");
var results = document.getElementById("results-container");
var req = new XMLHttpRequest();
var baseURL = "{{- $.Site.BaseURL -}}"
var indexDataRaw = "";
var queryArray = [];
var resultCount = 0;

//********>
// OBJECT CONSTUCTORS
//********>

// Functions for creating query and post objects
// Post objects are created only when a query matches

function Post(title, url, desc, date, dateFormatted, edited, editedFormatted, tags, content, words) {
	// Data values
	this.title = title;
	this.url = url;
	this.desc = desc;
	this.date = date;
	this.dateFormatted = dateFormatted;
	this.edited = edited;
	this.editedFormatted = editedFormatted;
	this.tags = tags;
	this.content = content,
	this.words = words;
	
	// Find in post function:
	//	Finds a given phrase (query) in relevant post data
	//	"Section" refers to where to look
	//		One of:
	//			- Title
	//			- Description
	//			- Date (also searches DateFormatted)
	//			- Edited (also searches EditedFormatted)
	//			- Tags
	//			- Content
	//			- Words (i.e. word counts)
	//			- All
	this.findInPost = function (section, target) {
		var query = target;
		var found = false;
		var invert = false;
		
		if (query.charAt(0) == "-") { 
			invert = true; // Set negation toggle
			query = target.substr(1); // Erase leading dash
		}
		
		switch (section) {
			case "all":
				if (this.findInPost("title", query)
					|| this.findInPost("description", query)
					|| this.findInPost("date", query)
					|| this.findInPost("edited", query)
					|| this.findInPost("tags", query)
					|| this.findInPost("content", query)
					|| this.findInPost("words", query) )
					{ found = true; }
				else { found = false; }
				break;
			case "title":
				if (this.title.indexOf(query) != -1) { found = true; }
				else { found = false; }
				break;
			case "description":
				if (this.desc.indexOf(query) != -1) { found = true; }
				else { found = false; }
				break;
			case "date":
				if (this.date.indexOf(query) != -1
					|| this.dateFormatted.indexOf(query) != -1) 
					{ found = true; }
				else { found = false; }
				break;
			case "before":
				// May want to add some user-side error checking for this...
				if (Date.parse(this.date) < Date.parse(query)){ found = true; }
				else { found = false; }
				break;
			case "after":
				if (Date.parse(this.date) > Date.parse(query)){ found = true; }
				else { found = false; }
				break;
			case "edited":
				if (this.edited.indexOf(query) != -1
					|| this.editedFormatted.indexOf(query) != -1) { found = true; }
				else { found = false; }
				break;
			case "tags":
				for (var i = 0; i < this.tags.length; i++) {
					if (this.tags[i].indexOf(query) != -1) {
						found = true; // Return true on any match
					}
				}
				found = false; // Return false if no match
				break;
			case "content":
				if (this.content.indexOf(query) != -1) { found = true; }
				else { found = false; }
				break;
			case "words":
				if (this.words.indexOf(query) != -1) { found = true; }
				else { found = false; }
				break;
			default:
				console.log("Malformed findInPost() argument!");
		}
		// Invert return value if preceded by a negation character
		if (invert) { return !found; }
		else { return found; }
	}
	
	// Write to HTML function:
	//	Writes this post object as HTML, formatted the same as _default/list.html + partials/meta.html
	this.writeToHtml = function () {
		var output = "<article role='article'>"
			+ "<h3 itemprop='name'><a href='"
			+ this.url
			+ "'>"
			+ this.title
			+ "</a></h2>";
		if (this.description != "") {
			output += "<p class='meta'>"
				+ this.description
				+ "</p>";
		}
		if (this.date != "") {
			output += "<p class='meta'><time>"
				+ this.dateFormatted;
				+ "</time> - "
				+ this.words
				+ " words</p>";
		}
		if (this.edited != "" && this.edited != this.date) {
			output += "<p class='meta'>Edited: <time>"
				+ this.editedFormatted
				+ "</time></p>";
		}
		if (this.tags != "") {
			output += "<ul class='meta' aria-label='Tags'>";
			for (var i = 0; i < this.tags.length; i++) {
				output += "<li><a href='/tags/"
					+ this.tags
					+ "'>#"
					+ this.tags
					+ "</a></li>";
			}
			output += "</ul>";
		}
		output += "</article>";
		results.innerHTML = output;
	}
}

function Query(input, type) {
	this.type = type; // Type: string
	this.input = input; // Type: array
	
	this.applySearch = function(post) {
		for (var i = 0; i < input.length; i++) {

		}
	}
}

//********>
// SEARCH
//********>

// Bread and butter of search.js
// Gets the user query and JSON file(s)
// and writes matching posts as HTML to the results div

function search() {
	// Handle the JSON index first
	indexDataRaw = getJsonIndex(1);
	// Then manage the query
	queryArray = parseQuery(queryInput.split(" "), "", 0);
	
}

//********>
// PARSE QUERY
//********>

// Parses the user-input query string into distinct query objects

function parseQuery(queries, type, startIndex) {
	var queryInput = [];
	for (var i = startIndex; i < queries.length; i++) {
		// Control for phrase prefix modifiers
		// For all of these, close off the existing object creation
		//	then start with a new sliced array from the index onward
		// Also don't forget to substr to remove the prefix!
		// And don't forget that dates are single-use
		//	(So they will not call this method, they'll just make 
		//		a query object for the date and move on)
		if (queries[i].indexOf("all:") ){ }
		else if (queries[i].indexOf("title:") != -1 ){ }
		else if (queries[i].indexOf("date:") != -1 ){ }
		else if (queries[i].indexOf("before:") != -1 ){ }
		else if (queries[i].indexOf("after:") != -1 ){ }
		else if (queries[i].indexOf("text:") != -1 ){ }
		else if (queries[i].indexOf("tags:") != -1 ) { }
		else if (queries[i].indexOf("sort:") != -1 ){ }
		else { } // Add item to queryInput array
	}
}

//********>
// GET JSON FIELD
//********>

// Uses regex to get the value of a json field
// Return type is same as the value type (array or string, usually)
// Key: The key-name of the target field
// Data: The post's raw data from which to pull the key-value pair

function getJsonField(key, data) {
}

//********>
// GET JSON INDEX
//********>

// Gets json index file for the given page number
// Used for paginated indices

function getJsonIndex(page) {
	var url = baseURL + "/index.json" // Set the URL
	req.open("GET", url); // Try to get the index file based on the URL
	req.onreadystatechange = function() { // For each statechange...
		console.log(req.readyState);
		if (req.readyState == 4) { // See if the data stream is complete and
			if (req.status == "200") { // If we get an OK status code, then...
				return req.responseText;
			}
			else { // Otherwise, we ran into some kind of connection error, so...
				setError("Connection error! Check that you are connected to the internet!");
				return null;
			}
		}
	}
	req.send(null);
}