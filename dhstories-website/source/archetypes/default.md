+++
### Front Matter

###### Dates (YYYY-MM-DD) - For ordering posts and displaying in content lists.
date = {{ (time.AsTime .Date).Format (`2006-01-02`) }}

###### Last Modified (YYYY-MM-DD) - When the content was last edited. (Optional - If omitted, will show no edited date)
lastmod = ""

###### Title (string) - Required.
title = "{{ .Name | humanize | title }}"

###### Description (string) - For subtitle and social media metadata. (Optional - If omitted, will hide subtitle and use only auto-summary for social media metadata.)
description = ""

###### Tags (string array) - Tags for the content. Included in social media.
tags = [{{ range (sort .Site.Taxonomies.tags) }}"{{ .Page.Title }}", {{ end }}]

###### Hide Footer (bool) - Whether to show the footer at the end of this post.
hideFooter = false

###### Comments Links (url string) - Full URL to a comments page for this post.
commentLink = ""

###### Disable Disqus (bool) - Disables disqus comments, e.g. if linked comments are preferred.
disableDisqus = ""

###### Draft (bool) - Whether the post is a draft and should not be rendered.
draft = true

+++

Body text for this item will go here.

Begin headers at level 2, using two hash symbols (##).

You can add a table of contents via the shortcode `{{< toc >}}`.

For a complete markdown reference, see [this guide](https://www.markdownguide.org/tools/hugo/).