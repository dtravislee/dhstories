+++
### Front Matter
###### Title - Required.
title = "RSS Feeds"

###### Description (string) - For social media and page listings.
###### Optional - Will use pretext or content summary if not set.
description = "For your subscription needs"

#### Hide Footer - Whether to show the footer at the end of this post.
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
					<a href="{{- .Permalink -}}">{{- $value.Page.Title -}}</a>
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
{{- with $home.Page.OutputFormats.Get "rss" -}}<p><a href="{{- .Permalink -}}">{{- `Feed for all posts` -}}</a></p>{{- end -}}
{{/* Range through all taxonomies present in the site, listing their members. */}}
{{ range $taxonomyname, $taxonomy := .Site.Taxonomies }}
	{{- $taxon := $.Site.GetPage $taxonomyname -}}
	{{- with $taxon.Page.OutputFormats.Get "rss" -}}<p><a href="{{- .Permalink -}}">{{- `Feed for all ` -}}{{- $taxonomyname -}}</a></p>{{- end -}}
	{{- template `rss-list` (dict `Target` $taxonomy) -}}
{{- end -}}
{{< /rss.inline >}}