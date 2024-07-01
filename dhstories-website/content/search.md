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
<form class='js-only' action='javascript:search();'>
	<label for='search-input' >Enter keywords to search and click "{{- $buttonName -}}":</label>
	<input type='text' id='search-input' class='text-input long'/>
	<p class='search-tip'>
		{{- $regexNote := "Regex on Wikipedia - opens in new tab" -}}
		<b>Tip:</b> For exact matches, enclose phrases in <code>"quotation marks"</code>. Exclude keywords by adding a dash to the beginning of a <code>-keyword</code>. Enable regex by surrounding expressions with <code>/forward slashes/</code>.</p>
	<p id='error-box' class='error-box hidden'></p>
	<p class='search-buttons'>
		<a role='button' href='javascript:search();' class='search-button'>{{- $buttonName -}}</a>
		<a role='button' href='javascript:toggleAdvanced();' class='search-button' id='search-adv'>Advanced Options</a>
	</p>
	
{{/* --- */}}
{{/* Advanced options */}}
{{/* --- */}}	

	{{/* inputbox: takes box type (checked or radio), id, checkbox name, label, and checked status as inputs (in dict format) */}}
	{{/* dict `type` "inputType" `group` "groupName" `label` "boxLabel" `id` "boxId" `checked` true/false */}}
	{{- define `inputbox` -}}
		<div id='{{- .id -}}-container'>
			<input type='{{- .type -}}' id='{{- .id -}}' name='{{- .group -}}' value='{{- .id -}}' {{- if .checked -}}{{- ` checked` -}}{{- end -}}>
			<label for='{{- .id -}}'>{{- .label -}}</label>
		</div>
	{{- end -}}

	<div id='advanced-opt' class=''>
		<h2>Advanced Search</h2>
		<fieldset>
			<legend>Search in</legend>
			<p>Look for the search query in:</p>
			{{- partial `inputbox` (dict `type` "checkbox" `group` "search-loc" `label` "Title" `id` "loc-title" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "checkbox" `group` "search-loc" `label` "Subtitle" `id` "loc-desc" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "checkbox" `group` "search-loc" `label` "Date" `id` "loc-date" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "checkbox" `group` "search-loc" `label` "Edited date" `id` "loc-edited" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "checkbox" `group` "search-loc" `label` "URL" `id` "loc-link" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "checkbox" `group` "search-loc" `label` "Tags" `id` "loc-tags" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "checkbox" `group` "search-loc" `label` "Content" `id` "loc-text" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "checkbox" `group` "search-loc" `label` "Read time" `id` "loc-time" `checked` true) -}}
			<p>
				<a aria-role='button' class='search-button advanced' href='javascript:locAll();'>Select all fields</a>
				<a aria-role='button' class='search-button advanced' href='javascript:locNone();'>Deselect all fields</a>
			</p>
		</fieldset>
			{{/* Create tags list */}}
			{{- define "taglist" -}}
				{{ range (sort $.Site.Taxonomies.tags) }}
					{{ with .Page }}
						{{- $urlSafeTitle := .RelPermalink | path.BaseName -}}
						{{- partial `inputbox` (dict `type` "checkbox" `group` .Type `label` .Title `id` $urlSafeTitle `checked` true) -}}
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
				<a aria-role='button' class='search-button advanced' href='javascript:locAll();'>Select all tags</a>
				<a aria-role='button' class='search-button advanced' href='javascript:locNone();'>Deselect all tags</a>
			</p>
			<a href='javascript:resetFields("tags");' class='reset-button'>Reset Tags</a>
		</fieldset>
		{{/* Date picker: takes id and Hugo context as inputs (in dict format) */}}
		{{/* dict `id` "Id" (usually "before" or "after") `context` . */}}
		{{- define "datepicker" -}}
			{{- $days := seq 31 1 -}}
			{{- $months := seq 12 1 -}}
			{{- $years := seq (add (time.Now.Year) 1) (sub (int .context.Site.Params.startYear) 1) -}}
				{{/* Add a little breadth in the year counter to account for user misinterpretations */}}
			<select aria-labelledby='{{- .id -}}-day-label' id='{{- .id -}}-day' name='{{- .id -}}' class='select-box date'>
				{{- range $days -}}
					<option value='{{- . -}}'>{{- . -}}</option>
				{{- end -}}
				<option value=''>Any</option>
				<option id='{{- .id -}}-day-label' value='' selected>Select day</option>
			</select>
			<select aria-labelledby='{{- .id -}}-month-label' id='{{- .id -}}-month' name='{{- .id -}}' class='select-box date'>
				{{- range $months -}}
					<option value='{{- . -}}'>{{- dateFormat "January" (printf "2006-%02d-02" . ) -}}</option>
				{{- end -}}
				<option value=''>Any</option>
				<option id='{{- .id -}}-month-label' value='' selected>Select month</option>
			</select>
			<select aria-labelledby='{{- .id -}}-month-label' id='{{- .id -}}-year' name='{{- .id -}}' class='select-box date'>
				{{- range $years -}}
					<option value='{{- . -}}'>{{- . -}}</option>
				{{- end -}}
				<option value=''>Any</option>
				<option id='{{- .id -}}-year-label' value='' selected>Select year</option>
			</select>
		{{- end -}}
		<fieldset id='dates'>
			<legend>Date</legend>
			<p>Find posts published before the date:</p>
			<div>{{- template `datepicker` (dict `id` "before" `context` .) -}}</div>
			<p>Find posts published after the date:</p>
			<div>{{- template `datepicker` (dict `id` "after" `context` .) -}}</div>
			<a href='javascript:resetFields("dates");' class='reset-button'>Reset Dates</a>
		</fieldset>
		{{- define "readtimelist" -}}
			{{- $readtimes := slice -}} {{/* Empty starter array / slice */}}
			{{- range .Site.RegularPages -}}
				{{- if .Date -}} {{/* Only get readtimes from pages with the date parameter set */}}
					{{- $readtimes = $readtimes | append (.ReadingTime) -}}
				{{- end -}}
			{{- end -}}
			{{- $maxTime := math.Max $readtimes -}}
			{{- $increment := 5 -}}
			{{- $wordsPerMin := 200 -}}{{/* See: https://gohugo.io/methods/page/readingtime/ */}}
			{{/* We round down to simulate FuzzyWordCount's rounding */}}
			{{- $readtimeList := seq $increment $increment $maxTime -}}
			{{/* Outputs */}}
			{{- range (collections.Reverse $readtimeList) -}}
				<option value='{{- . -}}'>{{- . -}}{{- ` minutes` -}}{{- ` (around ` -}}{{- mul . $wordsPerMin -}}{{- ` words)` -}}</option>
			{{- end -}}
			<option value='' selected>Any length</option>
		{{- end -}}
		<fieldset id='words'>
			<legend>Read time</legend>
			<p><label for='readtime-more'>Look for posts longer than: </label><select id='readtime-more' name='readtime-more' class='select-box words'>{{- template "readtimelist" . -}}</select></p>
			<p><label for='readtime-less'>Look for posts shorter than: </label><select id='readtime-less' name='readtime-less' class='select-box words'>{{- template "readtimelist" . -}}</select></p>
			<a href='javascript:resetFields("words");' class='reset-button'>Reset Read Times</a>
		</fieldset>
		<fieldset id='sort'>
			<legend>Results order</legend>
			<p>Sort search results by:</p>
			{{- partial `inputbox` (dict `type` "radio" `group` "sort-rule" `label` "Newest first" `id` "new-first" `checked` true) -}}
			{{- partial `inputbox` (dict `type` "radio" `group` "sort-rule" `label` "Oldest first" `id` "old-first" `checked` false) -}}
			<a href='javascript:resetFields("sort");' class='reset-button'>Reset Results Order</a>
		</fieldset>
		<p class='search-buttons'>
			<a role='button' href='javascript:search();' class='search-button'>{{- $buttonName -}}</a>
			<a role='button' href='javascript:toggleAdvanced();' class='search-button' >Close Advanced Options</a>
			<a role='button' href='javascript:resetFields("everything");' class='search-button'>Reset All</a>
		</p>
	</div>
</form>
{{</ search.inline >}}
<div id='results-container'></div>