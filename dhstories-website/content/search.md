+++
### Front Matter
###### Title - Required.
title = "Search"

###### Description (string) - For social media and page listings.
###### Optional - Will use pretext or content summary if not set.
description = "A simple way to find your favourites"

#### Layout - Layout to use for this content
layout = "search"

+++

<noscript>JavaScript must be enabled to search the site!</noscript>

{{< search.inline >}}
{{- $buttonName := "Begin Search" -}}
<form class='js-only' action='javascript:search();'>
	<input id='search-input' class='text-input' placeholder='Enter a search query and click "{{- $buttonName -}}"' title='Enter a search query and click "{{- $buttonName -}}"'/>
	Can enclose phrases in quotation marks for exact matches, exclude keywords via appending a dash to the beginning, or use regex by surrounding keywords in forward slashes (/).
	<p id='error-box' class='error-box hidden'></p>
	<a href='javascript:search();'>{{- $buttonName -}}</a>
	<a href='javascript:openAdvanced();'>Advanced Options</a>
	<fieldset id='advanced' class='hidden'>
		<legend>Advanced Search</legend>
	</fieldset>
	
	Search in: Checklist
	
	Include tags: select list + add / remove (remove will find the tag from the list and remove it)
		Plus a text line, full width, that contains the list of tags
			with a default saying something like "add tags here, separated by commas"
	
	Exclude tags: 
	
	Before: and after: (use select lists, pulling applicable dates from all posts
		these are inclusive of the date, too)
	
	<select name="pets" id="pet-select">
  <option value="">--Please choose an option--</option>
  <option value="dog">Dog</option>
  <option value="cat">Cat</option>
  <option value="hamster">Hamster</option>
  <option value="parrot">Parrot</option>
  <option value="spider">Spider</option>
  <option value="goldfish">Goldfish</option>
</select>
	
</form>

<div id='results-container'></div>
{{</ search.inline >}}
