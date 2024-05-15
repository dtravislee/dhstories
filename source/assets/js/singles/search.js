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

//********>
// OBJECT CONSTUCTORS
//********>

// Functions for creating query and post objects
// Post objects are created only when a query matches

function Post(number, title, url, desc, date, dateFormatted, tags, content) {
	// Data values
	this.number = number;
	this.title = title;
	this.url = url;
	this.desc = desc;
	this.date = date;
	this.dateFormatted = dateFormatted;
	this.tags = tags;
	this.content = content;
	
	// Write to HTML function:
	//	Writes this post object as HTML, formatted the same as _default/list.html + partials/meta.html
	this.writeToHtml = function () {
		/* <article role='article'>
				<h2 itemprop='name'><a href='{{- .RelPermalink -}}'>{{- .Title -}}</a></h2>
				{{- with .Description -}}
	<p class='meta'>{{- . -}}</p>
{{- end -}}
	
{{- if .Params.date -}}
	<p class='meta'>
		<time>{{- .Date.Format (`January 02, 2006`) -}}</time>
		{{- ` – ` -}}
		{{- .WordCount -}}{{- ` words` -}}
	</p>
{{- end -}}


{{- with .Lastmod -}}
	{{ if ne . $.Date -}}
	<p class='meta'>
	{{- `Edited: ` -}}
	<time>
		{{- .Format (`January 02, 2006`) -}}
	</time>
	{{- `)` -}}
	{{- end -}}
{{- end -}}


{{- with .Params.tags -}}
	<ul class="meta" aria-description="Tags">
		{{- range . -}}
			<li><a href='{{- `/tags/` | relURL -}}{{- . | urlize -}}'>
				{{- `#` -}}{{- . | humanize | title -}}
			</a></li>
		{{- end -}}
	</ul>
{{- end -}}
			</article> */
	}
}

function Query(input, type) {
}

//********>
// SEARCH
//********>

// Bread and butter of search.js
// Gets the user query and JSON file(s)
// and writes matching posts as HTML to the results div

function search() {
	getJsonIndex(1);
}

//********>
// PARSE QUERY
//********>

// Parses the user-input query string into distinct query objects
// Currently basic, but hoping to expand advanced functionality
// (quoted strings, tag / description suffixes, date ranges...) 

function parseQuery() {
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
				indexDataRaw = req.responseText;
			}
			else { // Otherwise, we ran into some kind of connection error, so...
				setError("Connection error! Check that you are connected to the internet!");
			}
		}
	}
	req.send(null);
}