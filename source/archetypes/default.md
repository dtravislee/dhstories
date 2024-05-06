+++
### Front Matter

###### Date (YYYY-MM-DD) - For ordering posts and displaying in content lists.
date = {{ .Date }}

###### Last Modified (YYYY-MM-DD) - When the content was last edited. Update as necessary.
lastmod = {{ .Date }}

###### Title (string) - Required.
title = "{{ .Name | humanize | title }}"

###### Description (string) - For subtitle and social media metadata. (Optional - If omitted, will hide subtitle and use only auto-summary for social media metadata.)
description = ""

###### Tags (string array) - Tags for the content. Included in social media.
tags = [{{ range (sort .Site.Taxonomies.tags) }}"{{ .Page.Title }}", {{ end }}]

###### Hide Footer - Whether to show the footer at the end of this post.
hideFooter = false

###### Comments Links - Full URL to a comments page for this post
commentLink = ""

+++

Summary text.

{{< toc >}}

Text after TOC.