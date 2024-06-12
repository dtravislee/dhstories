+++
### Front Matter

###### Title (string) - Required.
title = "Search"

###### Description (string) - For subtitle and social media metadata. (Optional - If omitted, will hide subtitle and use only auto-summary for social media metadata.)
description = "A simple way to find your favourites"

#### Layout (string) - Layout to use for this content
layout = "search"
+++

<noscript>JavaScript must be enabled to search the site!</noscript>

{{< search.inline >}}
{{- $buttonName := "Begin Search" -}}
<form class='js-only' action='javascript:search();'>
	<input id='search-input' class='text-input long' placeholder='Enter keywords to search and click "{{- $buttonName -}}"' title='Enter a search query and click "{{- $buttonName -}}"'/>
	<p class='search-tip'>
		<b>Note:</b> For exact matches, enclose phrases in <code>"quotation marks"</code>. Exclude keywords by adding a dash to the beginning of a <code>-keyword</code>. Enable <a href='https://en.wikipedia.org/wiki/Regular_expression'>Regex</a> by surrounding expressions with <code>/forward slashes/</code>.</p>
	<p id='error-box' class='error-box hidden'></p>
	<p class='search-buttons'>
		<a href='javascript:search();' class='search-go'>{{- $buttonName -}}</a>
		<a href='javascript:openAdvanced();' id='search-adv'>Advanced Options</a>
		<a href='javascript:closeAdvanced();' id='close-search-adv' class='hidden'>Close Options</a>
	</p>
	<div id='advanced-opt' class=''>
		<h2>Advanced Search</h2>
		<fieldset>
			<legend>Search In</legend>
			<p>Look for the search query in:</p>
			<div class='loc-col left-col'>
				<span class='loc-item'>
					<input type='checkbox' id='loc-title' name='search-loc' value='title' checked>
					<label for='loc-title'>Title</label>
				</span>
				<span class='loc-item'>
					<input type='checkbox' id='loc-date' name='search-loc' value='date' checked>
					<label for='loc-date'>Date</label>
				</span>
				<span class='loc-item'>
					<input type='checkbox' id='loc-edited' name='search-loc' value='edited' checked>
					<label for='loc-edited'>Edited Date</label>
				</span>
				<span class='loc-item'>
					<input type='checkbox' id='loc-link' name='search-loc' value='link' checked>
					<label for='loc-link'>URL</label>
				</span>
			</div>
			<div class='loc-col right-col'>
				<span class='loc-item'>
					<input type='checkbox' id='loc-tags' name='search-loc' value='tags' checked>
					<label for='loc-tags'>Tags</label>
				</span>
				<span class='loc-item'>
					<input type='checkbox' id='loc-desc' name='search-loc' value='desc' checked>
					<label for='loc-desc'>Description</label>
				</span>
				<span class='loc-item'>
					<input type='checkbox' id='loc-text' name='search-loc' value='text' checked>
					<label for='loc-text'>Content</label>
				</span>
				<span class='loc-item'>
					<input type='checkbox' id='loc-words' name='search-loc' value='words' checked>
					<label for='loc-words'>Word Count</label>
				</span>
			</div>
			<div class='loc-col left-col'>
				<a href='javascript:locAll();'>Select All</a>
			</div>
			<div class='loc-col right-col'>
				<a href='javascript:locNone();'>Select None</a>
			</div>
		</fieldset>
			{{/* Create tags list */}}
			{{- define "taglist" -}}
				{{ range (sort .Site.Taxonomies.tags) }}
					{{- with .Page.Title -}}
						<option value='{{- . -}}'>{{- . -}}</option>
					{{- end -}}
				{{- end -}}
			{{- end -}}
			{{/* Set tags input description */}}
			{{- $tagInputDesc := `Add tags, separated by commas (e.g. tag 1, tag 2)` -}}
		<fieldset id='incl-tags'>
			<legend>Include Tags</legend>
			<label for='include-tag'>Select a tag to add to the "include tag" list:</label>
			<p>
				<select id='include-tag' name='include-tag' class='select-box'>
					<option value=''>--Choose a tag--</option>
					{{- template "taglist" . -}}
				</select>
			</p><p>
				<a href='javascript:addTag(incl-tag-input);' class='tag-input'>Add tag to list</a>
				<a href='javascript:removeTag(incl-tag-input);' class='tag-input'>Remove tag from list</a>
			</p>
			<hr/>
			<label for='incl-tag-input'>Enter list of tags to include in the search:</label>
			<input id='incl-tag-input' class='text-input long' placeholder='{{- $tagInputDesc -}}' title='{{- $tagInputDesc -}}'/>
			<a href='javascript:resetFields("incl-tags");' class='reset-button'>Reset</a>
		</fieldset>
		<fieldset id='excl-tags'>
			<legend>Exclude Tags</legend>
			<label for='exclude-tag'>Select a tag to add to the "avoid tag" list:</label>
			<p>
				<select id='exclude-tag' name='exclude-tag' class='select-box'>
					<option value=''>--Choose a tag--</option>
					{{- template "taglist" . -}}
				</select>
			</p><p>
				<a href='javascript:addTag(excl-tag-input);' class='tag-input'>Add tag to list</a>
				<a href='javascript:removeTag(excl-tag-input);' class='tag-input'>Remove tag from list</a>
			</p>
			<hr/>
			<label for='excl-tag-input'>Enter list of tags to avoid when searching:</label>
			<input id='excl-tag-input' class='text-input long' placeholder='{{- $tagInputDesc -}}' title='{{- $tagInputDesc -}}'/>
			<a href='javascript:resetFields("excl-tags");' class='reset-button'>Reset</a>
		</fieldset>
		{{/* Get all the dates on the site, truncating repetition */}}
		{{- define "datelist" -}}
			{{- $datesList := slice -}} {{/* Empty starter array / slice */}}
			{{- range .Site.RegularPages -}}
				{{- with .Date -}} {{/* Only get dates from pages with the date parameter set */}}
					{{/* Add formatted (YYYY-MM-DD) date to datesList */}}
					{{- $datesList = $datesList | append (.) -}}
				{{- end -}}
			{{- end -}}
			{{- $datesList = $datesList | uniq -}} {{/* Trim duplicate dates */}}
			{{- range $datesList -}}
				<option value='{{- .Format (`2006-01-02`) -}}'>{{- .Format (`Jan 02, 2006`) -}}</option>
			{{- end -}}
		{{- end -}}
		<fieldset id='dates'>
			<legend>Date</legend>
			<p>
				Find posts published <label for='before-date'>starting on the date</label>
				<select id='before-date' name='before-date' class='select-box date'>
					<option value=''>--Choose a date--</option>
					<option value=''>Any date</option>
					{{- template "datelist" . -}}
				</select>
				<label for='after-date'>up to and including the date</label>
				<select id='after-date' name='after-date' class='select-box date'>
					<option value=''>--Choose a date--</option>
					<option value=''>Any date</option>
					{{- template "datelist" . -}}
				</select>
			</p>
			<a href='javascript:resetFields("dates");' class='reset-button'>Reset</a>
		</fieldset>
		<fieldset id='words'>
			<legend>Word Count</legend>
			<p>Look for posts with:</p>
			<p><label>More than <input id='word-min' class='text-input number' type='number' placeholder='0' min='0' title='Enter a minimum word count (optional)'/> words</label></p>
			<p><label>Fewer than <input id='word-max' class='text-input number' type='number' placeholder='0' min='0' title='Enter a maximum word count (optional)'/> words</label></p>
			<p id='error-box-numbers' class='error-box hidden'><b>!!ERROR:</b> Word counts must be a number greater than or equal to 0!</p>
			<a href='javascript:resetFields("words");' class='reset-button'>Reset</a>
		</fieldset>
		<fieldset id='sort'>
			<legend>Results Order</legend>
			<p>Sort search results by:</p>
			<p><input type='radio' id='new-first' name='sort-rule' value='new-first' checked>
				<label for='new-first'>Newest first</label></p>
			<p><input type='radio' id='old-first' name='sort-rule' value='old-first'>
				<label for='new-first'>Oldest first</label></p>
			<a href='javascript:resetFields("sort");' class='reset-button'>Reset</a>
		</fieldset>
		<p class='search-buttons'>
			<a href='javascript:search();'>{{- $buttonName -}}</a>
			<a href='#search-input' id='search-adv-foot'>Return to Top</a>
			<a href='javascript:resetFields("everything");'>Reset All</a>
		</p>
	</div>
</form>
{{</ search.inline >}}	
	https://www.codingwithjesse.com/blog/submit-a-form-in-ie-with-enter/
	-So be sure to test this in IE7 mode - the multiple text fields here may prove to be an issue!
	(Might need to use input type='submit' buttons instead...)
<div id='results-container'></div>

