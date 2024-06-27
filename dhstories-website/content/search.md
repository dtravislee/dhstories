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
	<label for='search-input' >Enter keywords to search and click "{{- $buttonName -}}":</label>
	<input type='text' id='search-input' class='text-input long'/>
	<p class='search-tip'>
		{{- $regexNote := "Regex on Wikipedia - opens in new tab" -}}
		<b>Tip:</b> For exact matches, enclose phrases in <code>"quotation marks"</code>. Exclude keywords by adding a dash to the beginning of a <code>-keyword</code>. Enable regex by surrounding expressions with <code>/forward slashes/</code>.</p>
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
			<div class='loc-item'>
				<input type='checkbox' id='loc-title' name='search-loc' value='title' checked>
				<label for='loc-title'>Title</label>
			</div>
			<div class='loc-item'>
				<input type='checkbox' id='loc-date' name='search-loc' value='date' checked>
				<label for='loc-date'>Date</label>
			</div>
			<div class='loc-item'>
				<input type='checkbox' id='loc-edited' name='search-loc' value='edited' checked>
				<label for='loc-edited'>Edited Date</label>
			</div>
			<div class='loc-item'>
				<input type='checkbox' id='loc-link' name='search-loc' value='link' checked>
				<label for='loc-link'>URL</label>
			</div>
			<div class='loc-item'>
				<input type='checkbox' id='loc-tags' name='search-loc' value='tags' checked>
				<label for='loc-tags'>Tags</label>
			</div>
			<div class='loc-item'>
				<input type='checkbox' id='loc-desc' name='search-loc' value='desc' checked>
				<label for='loc-desc'>Description</label>
			</div>
			<div class='loc-item'>
				<input type='checkbox' id='loc-text' name='search-loc' value='text' checked>
				<label for='loc-text'>Content</label>
			</div>
			<div class='loc-item'>
				<input type='checkbox' id='loc-words' name='search-loc' value='words' checked>
				<label for='loc-words'>Word Count</label>
			</div>
			<div class='loc-item'>
				<a class='loc-button all' href='javascript:locAll();'>Select All</a>
				<a class='loc-button none' href='javascript:locNone();'>Select None</a>
			</div>
		</fieldset>
			{{/* Create tags list */}}
			{{- define "taglist" -}}
				<option value='' selected>--Choose a tag--</option>
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
			<label for='include-tag'>Select a tag to look for when searching:</label>
			<p>
				<select id='include-tag' name='include-tag' class='select-box'>
					{{- template "taglist" . -}}
				</select>
			</p><p>
				<a href='javascript:addTag(incl-tag-input);' class='tag-input'>Add tag to Include list</a>
				<a href='javascript:removeTag(incl-tag-input);' class='tag-input'>Remove tag from Include list</a>
			</p>
			<hr/>
			<label for='incl-tag-input'>Enter list of tags to include in the search, separated by commas<br/>(e.g. tag 1, tag 2):</label>
			<input type='text' id='incl-tag-input' class='text-input long' title='{{- $tagInputDesc -}}'/>
			<a href='javascript:resetFields("incl-tags");' class='reset-button'>Reset Include Tags</a>
		</fieldset>
		<fieldset id='excl-tags'>
			<legend>Exclude Tags</legend>
			<label for='exclude-tag'>Select a tag to avoid when searching:</label>
			<p>
				<select id='exclude-tag' name='exclude-tag' class='select-box'>
					{{- template "taglist" . -}}
				</select>
			</p><p>
				<a href='javascript:addTag(excl-tag-input);' class='tag-input'>Add tag to Exclude list</a>
				<a href='javascript:removeTag(excl-tag-input);' class='tag-input'>Remove tag from Exclude list</a>
			</p>
			<hr/>
			<label for='excl-tag-input'>Enter list of tags to avoid when searching, separated by commas<br/>(e.g. tag 1, tag 2):</label>
			<input type='text' id='excl-tag-input' class='text-input long' title='{{- $tagInputDesc -}}'/>
			<a href='javascript:resetFields("excl-tags");' class='reset-button'>Reset Excluded Tags</a>
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
			{{/* Outputs */}}
			<option value='' selected>Any date</option>
			{{- range $datesList -}}
				<option value='{{- .Format (`2006-01-02`) -}}'>{{- .Format (`Jan 02, 2006`) -}}</option>
			{{- end -}}
		{{- end -}}
		<fieldset id='dates'>
			<legend>Date</legend>
			<p>
				Find posts published <label for='before-date'>starting on the date</label>
				<select id='before-date' name='before-date' class='select-box date'>
					{{- template "datelist" . -}}
				</select>
				<label for='after-date'>up to and including the date</label>
				<select id='after-date' name='after-date' class='select-box date'>
					{{- template "datelist" . -}}
				</select>
			</p>
			<a href='javascript:resetFields("dates");' class='reset-button'>Reset Dates</a>
		</fieldset>
		{{- define "wordcountlist" -}}
			{{- $wordcounts := slice -}} {{/* Empty starter array / slice */}}
			{{- range .Site.RegularPages -}}
				{{- if .Date -}} {{/* Only get wordcounts from pages with the date parameter set */}}
					{{- $wordcounts = $wordcounts | append (.FuzzyWordCount) -}}
				{{- end -}}
			{{- end -}}
			{{/* Round to hundreds place e.g. 153 -> 100 */}}
			{{- $minWords := (math.Min $wordcounts) -}}
			{{- $maxWords := (math.Max $wordcounts) -}}
			{{- $wordcountList := (seq $minWords 200 $maxWords) -}}
			{{/* Outputs */}}
			<option value='' selected>Any</option>
			{{- range $wordcountList -}}
				<option value='{{- . -}}'>{{- . -}}{{- ` words` -}}</option>
			{{- end -}}
		{{- end -}}
		<fieldset id='words'>
			<legend>Word Count</legend>
			<p>Look for posts with:</p>
			<p><label for='wordcount-more'>More than this many words: </label><select id='wordcount-more' name='wordcount-more' class='select-box words'>{{- template "wordcountlist" . -}}</select></p>
			<p><label for='wordcount-less'>Fewer than this many words: </label><select id='wordcount-less' name='wordcount-less' class='select-box words'>{{- template "wordcountlist" . -}}</select></p>
			<a href='javascript:resetFields("words");' class='reset-button'>Reset Word Counts</a>
		</fieldset>
		<fieldset id='sort'>
			<legend>Results Order</legend>
			<p>Sort search results by:</p>
			<p><input type='radio' id='new-first' name='sort-rule' value='new-first' checked>
				<label for='new-first'>Newest first</label></p>
			<p><input type='radio' id='old-first' name='sort-rule' value='old-first'>
				<label for='new-first'>Oldest first</label></p>
			<a href='javascript:resetFields("sort");' class='reset-button'>Reset Results Order</a>
		</fieldset>
		<p class='search-buttons'>
			<a href='javascript:search();'>{{- $buttonName -}}</a>
			<a href='#search-input' id='search-adv-foot'>Return to Top</a>
			<a href='javascript:resetFields("everything");'>Reset All</a>
		</p>
	</div>
</form>
{{</ search.inline >}}
<div id='results-container'></div>

