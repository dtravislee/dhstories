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
	<p id='error-box' class='error-box hidden'></p>
	<a href='javascript:search();'>{{- $buttonName -}}</a>
</form>

<div id='results-container'></div>
{{</ search.inline >}}
