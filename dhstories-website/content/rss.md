+++
### Front Matter

###### Title (string) - Required.
title = "RSS Feeds"

###### Description (string) - For subtitle and social media metadata. (Optional - If omitted, will hide subtitle and use only auto-summary for social media metadata.)
description = "For your subscription needs"

###### Hide Metadata (bool) - Whether to hide metadata for this post (except for description and title)
hideMeta = true

#### Hide Footer (bool) - Whether to show the footer at the end of this post.
hideFooter = true
+++

If you're looking for notifications on new posts, you've come to the right place.

To subscribe to a feed, you will need an RSS feed reader, such as [Inoreader](https://www.inoreader.com/) or [Feeder](https://feeder.co/).

You can subscribe to all content via the "feed for all posts" link below. You can also stay up to date with new tags as they are added, or follow specific tags to receive updates for content you prefer.

{{< rss.inline >}}
{{/* RSS SHORTCODE */}} 
{{/* Gets RSS feeds for sections and taxonomies based on inputs */}}
{{/* With some help from: https://pakstech.com/blog/hugo-rss/ */}}

{{- define `rss-list` -}}
	<ul>
		{{/* Range through all sections or tags... */}}
		{{- range $value := .Target -}}
			{{/* Get RSS output formats... */}}
			{{- with $value.Page.OutputFormats.Get "rss" -}}
				<li>
					{{/* Then link to the RSS output using the page's title. */}}
					<a href="{{- .Permalink -}}"><span>{{- $value.Page.Title -}}</span></a>
					{{/* For section lists only... */}}
					{{- if $value.Page.IsSection -}}
						{{/* See if it has other sections... */}}
						{{- with $value.Sections -}}
							{{/* And if it does, repeat! */}}
							{{- template `rss-list` (dict `Target` .) -}}
						{{- end -}}
					{{- end -}}
				</li>
			{{- end -}}
		{{- end -}}
	</ul>
{{- end -}}

{{/* Get RSS feed for all site posts. */}}
{{- $home := .Site.GetPage `/` -}}
{{- with $home.Page.OutputFormats.Get "rss" -}}<p><a href="{{- .Permalink -}}"><span>{{- `Feed for all posts` -}}</span></a></p>{{- end -}}
{{/* Range through all taxonomies present in the site, listing their members. */}}
{{ range $taxonomyname, $taxonomy := .Site.Taxonomies }}
	{{- $taxon := $.Site.GetPage $taxonomyname -}}
	{{- with $taxon.Page.OutputFormats.Get "rss" -}}<p><a href="{{- .Permalink -}}"><span>{{- `Feed for all ` -}}{{- $taxonomyname -}}</span></a></p>{{- end -}}
	{{- template `rss-list` (dict `Target` $taxonomy) -}}
{{- end -}}
{{< /rss.inline >}}