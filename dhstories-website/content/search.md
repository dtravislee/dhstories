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
	</p>
	<div id='advanced-opt' class=''>
		<h2>Advanced Search</h2>
		<fieldset>
			<legend>Search In</legend>
			<div class='loc-col left-col'>
				<span class='loc-item'>
					<input type='checkbox' id='loc-title' name='search-loc' value='title'>
					<label for='loc-title'>Title</label>
				</span>
				<span class='loc-item'>
					<input type='checkbox' id='loc-date' name='search-loc' value='date'>
					<label for='loc-date'>Date</label>
				</span>
				<span class='loc-item'>
					<input type='checkbox' id='loc-edited' name='search-loc' value='edited'>
					<label for='loc-edited'>Edited Date</label>
				</span>
				<span class='loc-item'>
					<input type='checkbox' id='loc-link' name='search-loc' value='link'>
					<label for='loc-link'>URL</label>
				</span>
			</div>
			<div class='loc-col right-col'>
				<span class='loc-item'>
					<input type='checkbox' id='loc-tags' name='search-loc' value='tags'>
					<label for='loc-tags'>Tags</label>
				</span>
				<span class='loc-item'>
					<input type='checkbox' id='loc-desc' name='search-loc' value='desc'>
					<label for='loc-desc'>Description</label>
				</span>
				<span class='loc-item'>
					<input type='checkbox' id='loc-text' name='search-loc' value='text'>
					<label for='loc-text'>Content</label>
				</span>
				<span class='loc-item'>
					<input type='checkbox' id='loc-words' name='search-loc' value='words'>
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
		<fieldset id='tag-filter'>
			<legend>Filter Tags</legend>
			<select name='include-tag' class='tag-select tag-input'>{{- template "taglist" . -}}</select>
			<a href='javascript:inclTag(tag-input);' class='tag-input'>Include</a>
			<a href='javascript:exclTag(tag-input);' class='tag-input'>Exclude</a>
			<a href='javascript:removeTag(tag-input);' class='tag-input'>Remove</a>
			<input id='tag-input' class='text-input long' placeholder='{{- $tagInputDesc -}}' title='{{- $tagInputDesc -}}'/>
		</fieldset>
		<fieldset>
			<legend>Exclude Tags</legend>
			<select name='exclude-tag' class='tag-select tag-input'>{{- template "taglist" . -}}</select>
			<a href='javascript:addTag(excl-tag-input);' class='tag-input'>Add</a>
			<a href='javascript:removeTag(excl-tag-input);' class='tag-input'>Remove</a>
			<input id='excl-tag-input' class='text-input long' placeholder='{{- $tagInputDesc -}}' title='{{- $tagInputDesc -}}'/>
		</fieldset>
		<fieldset>
			<legend>Date</legend>
			Before:
			After:
			(use select lists, pulling applicable dates from all posts
		these are inclusive of the date, too)
		Be sure to include an N/A option! (Or "any")
		</fieldset>
		<fieldset>
			<legend>Word Count</legend>
			More than (input) words
			Fewer than (input) words
		</fieldset>
		<p class='search-buttons'>
			<a href='javascript:search();' class='search-go'>{{- $buttonName -}}</a>
			<a href='javascript:openAdvanced();' id='search-adv-foot'>Advanced Options</a>
		</p>
	</div>
	
	https://www.codingwithjesse.com/blog/submit-a-form-in-ie-with-enter/
	-So be sure to test this in IE7 mode - the multiple text fields here may prove to be an issue!
	(Might need to use input type='submit' buttons instead...)
	
	
</form>

<div id='results-container'></div>
{{</ search.inline >}}
