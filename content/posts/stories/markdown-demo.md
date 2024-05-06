+++
### Front Matter

###### Date - For ordering posts. No visual presence.
###### If excluded: 
###### 1. the post will not show up in content lists 
###### 2. next/previous navigation will not be generated
###### 3. metadata will not display on the page
date = 2016-09-09

###### Last Modified - When the content was last edited. Update as necessary.
lastmod = 2016-09-09

###### Title - Required.
title = "Markdown Demo example"

description = "this is a test description"

###### Draft - True if this page is still being worked on and should not be accessible
draft = false

+++

Some test opening text! <a href="http://google.ca">Testing</a> [I'm an inline-style link](https://www.google.com)

And here's some more.

{{< toc >}}

## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Here's a simple footnote,[^1] and here's a longer one.[^bignote]

[^1]: This is the first footnote.

[^bignote]: Here's one with multiple paragraphs and code.

    Indent paragraphs to include them in the footnote.

    `{ my code }`

    as many paragraphs as you like.

Emphasis, aka italics, with *asterisks* or _underscores_.

Strong emphasis, aka bold, with **asterisks** or __underscores__.

Combined emphasis with **asterisks and _underscores_**.

Strikethrough uses two tildes. ~~Scratch this.~~

1. First ordered list item
2. Another item
   * Unordered sub-list. 
1. Actual numbers don't matter, just that it's a number
   1. Ordered sub-list
4. And another item.

   You can have properly indented paragraphs within list items. Notice the blank line above, and the leading spaces (at least one, but we'll use three here to also align the raw Markdown).

   To have a line break without a paragraph, you will need to use two trailing spaces.
   Note that this line is separate, but within the same paragraph.  
   (This is contrary to the typical GFM line break behaviour, where trailing spaces are not required.)

* Unordered list can use asterisks
- Or minuses
+ Or pluses
+ Though they make separate lists

This is a test  

This is another test

[I'm an inline-style link](https://www.google.com)

[I'm an inline-style link with title](https://www.google.com "Google's Homepage")

[I'm a reference-style link][Arbitrary case-insensitive reference text]

[I'm a relative reference to a repository file](../blob/master/LICENSE)

Or leave it empty and use the [link text itself].

URLs and URLs in angle brackets will automatically get turned into links.
http://www.example.com or <http://www.example.com> and sometimes 
example.com (but not on Github, for example).

Some text to show that the reference links can follow later.

[arbitrary case-insensitive reference text]: https://www.mozilla.org
[link text itself]: http://www.reddit.com

Here's our logo (hover to see the title text):

Inline-style: 
![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 1")

Reference-style: 
![alt text][logo]

[logo]: https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 2"

Inline `code` has `back-ticks around` it.

```
<div class="js-only">
	<form id="PageSearch" name="Page-Search" role="search" title="Search posts" action="javascript://#" onSubmit="searchSubmit()">
		<label for="SearchInput">Search:</label>
		<input type="text" id="SearchInput" placeholder="Enter search term..." title="Enter search term and press 'Go'" autocomplete="on">
		<button type="submit" id="SearchSubmit">Go</button>
	</form>
	<div id="Results"></div>
</div>
```

```javascript
var s = "JavaScript syntax highlighting";
alert(s);
```
 
```
No language indicated, so no syntax highlighting. 
But let's throw in a <b>tag</b>.
```

Colons can be used to align columns.

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

There must be at least 3 dashes separating each header cell.
The outer pipes (|) are optional, and you don't need to make the 
raw Markdown line up prettily. You can also use inline Markdown.

Markdown | Less | Pretty
--- | --- | ---
*Still* | `renders` | **nicely**
1 | 2 | 3

> Blockquotes are very handy in email to emulate reply text.
> This line is part of the same quote.

Quote break.

> This is a very long line that will still be quoted properly when it wraps. Oh boy let's keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can *put* **Markdown** into a blockquote.

<dl>
  <dt>Definition list</dt>
  <dt>are existing</dt>
  <dd>Is something people use sometimes.</dd>

  <dt>Markdown in HTML</dt>
  <dd>Does *not* work **very** well. 
  
  Use HTML <em>tags</em>.</dd>
</dl>

And here is a markdown
: definition list

Three or more...

---

Hyphens

<b><hr></b>

Asterisks

___

Underscores

Here's a line for us to start with.

This line is separated from the one above by two newlines, so it will be a *separate paragraph*.

This line is also a separate paragraph, but...
This line is only separated by a single newline, so it's a separate line in the *same paragraph*.