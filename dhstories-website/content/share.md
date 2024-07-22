+++
### Front Matter

###### Title - Required.
title = "Share Post"

###### Description (string) - For subtitle and social media metadata. (Optional - If omitted, will hide subtitle and use only auto-summary for social media metadata.)
description = "Links for sharing works on this site"

###### Hide Metadata (bool) - Whether to hide metadata for this post (except for description and title)
hideMeta = true

#### Layout - Layout to use for this content
layout = "share"
+++

{{< share.inline >}}
{{/* SHARE LINKS */}}
{{/* Creates share links with URL hash + some site settings e.g. base URL */}}
{{/* Takes URL fragment to replace titles and URLs via JavaScript */}}
{{/* Without JavaScript, this simply shows share links for the homepage */}}
{{/*	and hides share buttons on posts */}}

{{- $url := $.Site.BaseURL -}}
{{- $title := $.Site.Params.title -}}
{{- $desc := $.Site.Params.description -}}

<p>Share "{{- $title -}}" to:</p>
<ul>
	<li><a href='https://www.blogger.com/blog-this.g?u={{- $url -}}&n={{- $title -}}&t={{- $desc -}}&hellip;' target='_blank'><span>{{- `Blogger` -}}</span></a></li>
	<li><a href='https://digg.com/submit?url={{- $url -}}&title={{- $title -}}' target='_blank'><span>{{- `Digg` -}}</span></a></li>
	<li><a href='mailto:?subject={{- $title -}}%20%3A%20{{- $url -}}&amp;body={{- $desc -}}&hellip;%0D%0ARead More%3A%20{{- $url -}}'><span>{{- `Email` -}}</span></a></li>
	<li><a href='https://www.facebook.com/sharer/sharer.php?u={{- $url -}}&quote={{- $title -}}' target='_blank'><span>{{- `Facebook` -}}</span></a></li>
	<li><a href='https://news.ycombinator.com/submitlink?u={{- $url -}}&t={{- $title -}}' target='_blank'><span>{{- `HackerNews` -}}</span></a></li>
	<li><a href='https://www.linkedin.com/shareArticle?mini=true&amp;url={{- $url -}}&amp;title={{- $title -}}&amp;summary={{- $desc -}}&hellip;&amp;source={{- $url -}}' target='_blank'><span>{{- `LinkedIn` -}}</span></a></li>
	<li><a href='https://mix.com/add?url={{- $url -}}' target='_blank'><span>{{- `Mix` -}}</span></a></li>
	<li><a href='https://pinterest.com/pin/create/button/?url={{- $url -}}&amp;description={{- $desc -}}' target='_blank'><span>{{- `Pinterest` -}}</span></a></li>
	<li><a href='https://reddit.com/submit/?url={{- $url -}}&amp;resubmit=true&amp;title={{- $title -}}' target='_blank'><span>{{- `Reddit` -}}</span></a></li>
	<li><a href='http://www.stumbleupon.com/submit?url={{- $url -}}&title={{- $title -}}' target='_blank'><span>{{- `StumbleUpon` -}}</span></a></li>
	<li><a href='https://telegram.me/share/url?text={{- $title -}}%0D%0A{{- $desc -}}&hellip;&amp;url={{- $url -}}' target='_blank'><span>{{- `Telegram` -}}</span></a></li>
	<li><a href='https://www.tumblr.com/widgets/share/tool?canonicalUrl={{- $url -}}&title={{- $title -}}&caption={{- $desc -}}' target='_blank'><span>{{- `Tumblr` -}}</span></a></li>
	<li><a href='https://twitter.com/intent/tweet/?text={{- $title -}}&amp;url={{- $url -}}&via=dtravislee' target='_blank'><span>{{- `Twitter / X.com` -}}</span></a></li>
	<li><a href='https://vk.com/share.php?url={{- $url -}}' target='_blank'><span>{{- `VK` -}}</span></a></li>
	<li><a href='whatsapp://send?text={{- $title -}}%0D%0A{{- $desc -}}&hellip;%0D%0ASource%20{{- $url -}}'><span>{{- `WhatsApp` -}}</span></a></li>
	<li><a href='https://www.xing.com/app/user?op=share&url={{- $url -}}' target='_blank'><span>{{- `Xing` -}}</span></a></li>
</ul>
{{< /share.inline >}}
