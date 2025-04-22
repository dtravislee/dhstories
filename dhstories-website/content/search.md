+++
### Front Matter

###### Title (string) - Required.
title = "Search"

###### Description (string) - For subtitle and social media metadata. (Optional - If omitted, will hide subtitle and use only auto-summary for social media metadata.)
description = "A simple way to find your favourites"

###### Hide Metadata (bool) - Whether to hide metadata for this post (except for description and title)
hideMeta = true

#### Layout (string) - Layout to use for this content
layout = "search"
+++

<noscript>JavaScript must be enabled to search the site!</noscript>

{{< search.inline >}}

{{- $buttonName := "Begin Search" -}}

{{/* --- */}}
{{/* Base search */}}
{{/* --- */}}
<form class='js-only' action='javascript:startSearch();'>
	<label for='search-input' >Enter keywords to search and click "{{- $buttonName -}}":</label>
	<input type='text' id='search-input' class='text-input long'/>
	<p class='search-tip'>
		<b>Tip:</b> For exact matches, enclose phrases in <code>"quotation marks"</code>. Exclude keywords by adding a dash to the beginning of a <code>-keyword</code>. Enable regex by surrounding expressions with <code>/forward slashes/</code>.
	</p>
	<p class='large-form-buttons'>
		<a role='button' href='javascript:startSearch();' class='form-button' title='Start the search'><span>{{- $buttonName -}}</span></a>
		<a role='button' id='top-advanced-button' href='javascript:showAdvanced();' class='form-button' id='search-adv' title='Open advanced search options'><span>Advanced Options</span></a>
		<a id='reset-search-top' role='button' href='javascript:resetSearch();' class='form-button hidden'><span>Reset Search</span></a>
	</p>
	
{{/* --- */}}
{{/* Advanced options */}}
{{/* --- */}}	

	<div id='advanced-opt' class='hidden'>
		<h2>Advanced Search</h2>
		<fieldset>
			<legend>Search in</legend>
			<p>Look for the search query in:</p>
			{{- partial `inputbox` (dict `type` "checkbox" `group` "fields" `label` "Title" `id` "loc-title" `value` "title" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "checkbox" `group` "fields" `label` "Subtitle" `id` "loc-description" `value` "description" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "checkbox" `group` "fields" `label` "Date" `id` "loc-date" `value` "date" `checked` true) -}} {{/* Also searches for edited dates */}}
			{{- partial `inputbox` (dict `type` "checkbox" `group` "fields" `label` "Tags" `id` "loc-tags" `value` "tags" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "checkbox" `group` "fields" `label` "URL" `id` "loc-url" `value` "url" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "checkbox" `group` "fields" `label` "Read time" `id` "loc-readtime" `value` "readtime" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "checkbox" `group` "fields" `label` "Word count" `id` "loc-words" `value` "words" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "checkbox" `group` "fields" `label` "Text (beware spoilers!)" `id` "loc-content" `value` "content" `checked` false) -}}
			<p>
				<a aria-role='button' class='form-button' href='javascript:checkboxAll("fields", true);'><span>Select all fields</span></a>
				<a aria-role='button' class='form-button' href='javascript:checkboxAll("fields", false);'><span>Deselect all fields</span></a>
			</p>
		</fieldset>
		{{/* Create tags list */}}
		{{- define "taglist" -}}
			{{ range (sort $.Site.Taxonomies.tags) }}
				{{ with .Page }}
					{{- $urlSafeTitle := .RelPermalink | path.BaseName -}}
					{{- partial `inputbox` (dict `type` "checkbox" `group` "tags" `label` .Title `id` $urlSafeTitle `value` .Title `checked` true) -}}
				{{- end -}}
			{{- end -}}
		{{- end -}}
		<fieldset>
			<legend>Tags</legend>
			<p>Look for results in the following categories:</p>
			<div class='tag-container'>
				{{- template "taglist" . -}}
			</div>
			<p>
				<a aria-role='button' class='form-button' href='javascript:checkboxAll("tags", true);'><span>Select all tags</span></a>
				<a aria-role='button' class='form-button' href='javascript:checkboxAll("tags", false);'><span>Deselect all tags</span></a>
			</p>
		</fieldset>
		{{/* Date picker: takes id and Hugo context as inputs (in dict format) */}}
		{{/* dict `id` "Id" (usually "before" or "after") `context` . */}}
		{{- define "datepicker" -}}
			{{- $monthMax := 12 -}}
			{{- $days := seq 31 1 -}}
			{{- $months := seq 11 0 -}} {{/* Start months at 0 because Javascript is silly */}}
			{{- $dateYears := slice -}}
			{{- range .context.Site.RegularPages -}}
				{{- if .Date -}}
					{{- $dateYears = $dateYears | append (.Date | dateFormat "2006") -}}
				{{- end -}}
			{{- end -}}
			{{- $earliestYear := math.Min $dateYears -}}
			{{- $latestYear := math.Max $dateYears -}}
			{{- $years := seq $latestYear $earliestYear -}}
			<select aria-label='Select day' id='{{- .id -}}-day' name='{{- .id -}}' class='date'>
				{{- range $days -}}
					<option value='{{- . -}}'
						{{/* Pre-select day 1 if this is "after" a date,
							or day 31 if this is "before" a date */}}
						{{- if or 
							(and (eq $.id "before") (eq . 31))
							(and (eq $.id "after") (eq . 1)) -}}
							{{- ` selected` -}}
						{{- end -}}
						>{{- . -}}</option>
				{{- end -}}
			</select>
			<select aria-label='Select month' id='{{- .id -}}-month' name='{{- .id -}}' class='date'>
				{{- range $months -}}
					<option value='{{- . -}}'
						{{/* Pre-select month 0 (January) if this is "after" a date,
							or month 11 (December) if this is "before" a date */}}
						{{- if or 
							(and (eq $.id "before") (eq . 11))
							(and (eq $.id "after") (eq . 0)) -}}
							{{- ` selected` -}}
						{{- end -}}
					{{/* Add 1 to the month format, since Javascript uses a 0-index and Hugo a 1-index */}}
					>{{- dateFormat "January" (printf "2006-%02d-02" (add . 1) ) -}}</option>
				{{- end -}}
			</select>
			<select aria-label='Select year' id='{{- .id -}}-year' name='{{- .id -}}' class='date'>
				{{- range $years -}}
					<option value='{{- . -}}'
					{{/* Pre-select the earliest year if this is "after" a date,
							or the latest year if this is "before" a date */}}
						{{- if or 
							(and (eq $.id "before") (eq . (int $latestYear)))
							(and (eq $.id "after") (eq . (int $earliestYear))) -}}
							{{- ` selected` -}}
						{{- end -}}
					>{{- . -}}</option>
				{{- end -}}
			</select>
		{{- end -}}
		<fieldset>
			<legend>Date</legend>
			<p>Find posts published on or before the date:</p>
			<div class='input'>{{- template `datepicker` (dict `id` "before" `context` .) -}}</div>
			<p class='reset'><a href='javascript:resetSelectors("before");'><span>Reset "before date"</span></a></p>
			<p>Find posts published on or after the date:</p>
			<div class='input'>{{- template `datepicker` (dict `id` "after" `context` .) -}}</div>
			<p class='reset'><a href='javascript:resetSelectors("after");'><span>Reset "after date"</span></a></p>
			<p class='search-tip'>Note: Invalid dates will round down, e.g. 31 November -> 30 November</p>
		</fieldset>
		{{- define "readtimelist" -}}
			{{- $readtimes := slice -}} {{/* Empty starter array / slice */}}
			{{- range .context.Site.RegularPages -}}
				{{- if .Date -}} {{/* Only get readtimes from pages with the date parameter set */}}
					{{- $readtimes = $readtimes | append (.ReadingTime) -}}
				{{- end -}}
			{{- end -}}
			{{- $increment := 3 -}}
			{{/* Max time is bumped by one increment to overestimate - same as date year */}}
			{{- $maxTime := add $increment (math.Max $readtimes) | int -}}
			{{- $wordsPerMin := 200 -}}{{/* See: https://gohugo.io/methods/page/readingtime/ */}}
			{{/* We round down to simulate FuzzyWordCount's rounding */}}
			{{- $readtimeList := slice 1 | append (seq $increment $increment $maxTime) -}}
			{{/* Outputs */}}
			{{- range (collections.Reverse $readtimeList) -}}
				<option value='{{- . -}}'
					{{- if or 
						(and (eq $.type "less") (eq . $maxTime)) 
						(and (eq $.type "more") (eq . 1)) -}}
							{{- ` selected` -}}
					{{- end -}}
				>
					{{- . -}}{{- ` minute` -}}{{- if ne . 1 -}}{{- `s` -}}{{- end -}}
					{{- ` (around ` -}}{{- mul . $wordsPerMin -}}{{- ` words)` -}}
				</option>
			{{- end -}}
		{{- end -}}
		<fieldset>
			<legend>Read time</legend>
			<p><label for='readtime-more'>Look for posts longer than: </label></p>
			<select id='readtime-more' name='readtime' class='words'>{{- template "readtimelist" (dict `type` "more" `context` .) -}}</select>
			<p><label for='readtime-less'>Look for posts shorter than: </label></p>
			<select id='readtime-less' name='readtime' class='words'>{{- template "readtimelist" (dict `type` "less" `context` .) -}}</select>
			<p class='reset'><a href='javascript:resetSelectors("readtime");'><span>Reset "read times"</span></a></p>
		</fieldset>
		<fieldset id='sort'>
			<legend>Results order</legend>
			<p>Sort search results by:</p>
			{{- partial `inputbox` (dict `type` "radio" `group` "sort-rule" `label` "Newest first" `id` "new-first" `value` "0" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "radio" `group` "sort-rule" `label` "Oldest first" `id` "old-first" `value` "1" `checked` false) -}}
		</fieldset>
		<p id='reset-advanced'><a role='button' href='javascript:resetAllAdvanced();' class='form-button'><span>Reset all options</span></a></p>
		<p class='large-form-buttons'>
			<a role='button' href='javascript:startSearch();' class='form-button'><span>{{- $buttonName -}}</span></a>
			<a role='button' id='bottom-advanced-button' href='javascript:hideAdvanced();' class='form-button'><span>Hide Advanced Options</span></a>
			<a role='button' href='javascript:resetSearch();' class='form-button'><span>Reset Search</span></a>
		</p>
	</div>
</form>
{{</ search.inline >}}
<div id='results-container' aria-live='polite'></div>
<div id='load-more-container' class='large-form-buttons hidden'>
<p id='load-more' class='hidden'><a role='button' href='javascript:doSearch();'><span>Load more</span></a></p>
<p id='end-results' class='hidden'>End of results</p>
<p id='no-results' class='hidden'>No results found</p>
</div>