+++
### Front Matter

###### Title (string) - Required.
title = "{{ .Name | humanize | title }}"

###### Description (string) - For subtitle and social media metadata. (Optional - If omitted, will hide subtitle and use only auto-summary for social media metadata.)
description = ""

#### Hide Footer (bool) - Whether to hide the footer at the end of this post.
hideFooter = true

###### Disable Disqus (bool) - Disables disqus comments, e.g. if linked comments are preferred.
disableDisqus = true

###### Draft (bool) - Whether the post is a draft and should not be rendered.
draft = true

+++

Body text for this item will go here.

Begin headers at level 2, using two hash symbols (##).

You can add a table of contents via the `< toc >` shortcode. For more on shortcodes, [see here](https://gohugo.io/content-management/shortcodes/).

For a complete markdown reference, see [this guide](https://www.markdownguide.org/tools/hugo/).