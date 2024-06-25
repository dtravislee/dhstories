+++
### Front Matter

###### Dates (YYYY-MM-DD) - For ordering posts and displaying in content lists.
date = {{ (time.AsTime .Date).Format (`2006-01-02`) }}

###### Last Modified (YYYY-MM-DD) - When the content was last edited. (Optional - If omitted, will show no edited date)
lastmod = ""

###### Title (string) - Required.
title = "{{ .Name | humanize | title }}"

###### Description (string) - For subtitle and social media metadata. If omitted, will remove subtitle and use auto-summary for social media metadata.
description = ""

###### Tags (string array) - Tags for the content. Included in social media.
tags = [{{ range (sort .Site.Taxonomies.tags) }}"{{ .Page.Title }}", {{ end }}]

###### Hide Footer (bool) - Whether to hide the post footer (not the site footer!)
hideFooter = false

###### Comments Links (url string) - Full URL to a comments page for this post.
commentLink = ""

###### Draft (bool) - Whether the post is a draft and should not be rendered.
draft = true

+++

Body text for this item will go here.

Begin headers at level 2, using two hash symbols (##).

You can add a table of contents via the `< toc >` shortcode. For more on shortcodes, [see here](https://gohugo.io/content-management/shortcodes/).

{{< comment >}}
You can also hide content from the parser through this hand-made shortcode! Good for taking top-secret notes.
See /layouts/shortcodes/ for more info (and to check out the markdownify shortcode, which can help when mixing HTML and markdown content).
{{</ comment >}}

For a complete markdown reference, see [this guide](https://www.markdownguide.org/tools/hugo/).