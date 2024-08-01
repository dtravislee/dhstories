+++
### Front Matter
###### Title - Required.
title = "Settings"

###### Description (string) - For subtitle and social media metadata. (Optional - If omitted, will hide subtitle and use only auto-summary for social media metadata.)
description = "Visual adjustments for your reading comfort"

###### Hide Metadata (bool) - Whether to hide metadata for this post (except for description and title)
hideMeta = true

#### Layout - Layout to use for this content
layout = "settings"
+++

{{< settings.inline >}}

<noscript>JavaScript must be enabled to change site theme settings!</noscript>

{{/* Settings Box */}}
{{/* Intermediary function between settings.md and inputbox.html */}}
{{/* Sets the .checked parameter for inputbox based on whether the ID matches any of the default parameters set in config.toml. This allows users to set the default theme / settings via config.toml */}}
{{/* Requires dict as input: */}}
{{/* dict `type` "inputType" `group` "groupName" `label` "boxLabel" `id` "boxId" `context` . */}}
{{- define `settingsbox` -}}
	{{- $isChecked := false -}}
	{{- range .context.Site.Params.themes -}}
		{{- if eq . $.id -}}
			{{- $isChecked = true -}}
			{{- break -}}
		{{- end -}}
	{{- end -}}
	{{- partial `inputbox` (dict `type` .type `group` .group `label` .label `id` .id `checked` $isChecked) -}}
{{- end -}}

{{- $containerName := `-container` -}}
<form class='js-only' action='javascript:updateSettings();'>
	<fieldset>
		<legend>Theme</legend>
		{{- template `settingsbox` (dict `type` "radio" `group` "theme" `label` "Light colours" `id` "light" `context` .) -}}
		{{- template `settingsbox` (dict `type` "radio" `group` "theme" `label` "Dark colours" `id` "dark" `context` .) -}}
	</fieldset>
	<fieldset>
		<legend>Main font</legend>
		{{- template `settingsbox` (dict `type` "radio" `group` "font" `label` "Serif" `id` "serif" `context` .) -}}
		{{- template `settingsbox` (dict `type` "radio" `group` "font" `label` "Sans-serif" `id` "sans" `context` .) -}}
		{{- template `settingsbox` (dict `type` "radio" `group` "font" `label` "Monospace" `id` "mono" `context` .) -}}
	</fieldset>
	<fieldset>
		<legend>Title font</legend>
		{{- template `settingsbox` (dict `type` "radio" `group` "title-font" `label` "Same as main font" `id` "same" `context` .) -}}
		{{- template `settingsbox` (dict `type` "radio" `group` "title-font" `label` "Serif" `id` "title-serif" `context` .) -}}
		{{- template `settingsbox` (dict `type` "radio" `group` "title-font" `label` "Sans-serif" `id` "title-sans" `context` .) -}}
		{{- template `settingsbox` (dict `type` "radio" `group` "title-font" `label` "Monospace" `id` "title-mono" `context` .) -}}
	</fieldset>
	<fieldset>
		<legend>Text size</legend>
		<p><label for='size'>{{- `Select a font size:` -}}</label></p>
		<select id='size' name='size' class='select-box'>
			{{- $fontSizes := seq 200 -10 50 -}}
			{{- range $fontSizes -}}
				<option id='s{{- . -}}' value='s{{- . -}}' {{- if eq . 100 -}}selected{{- end -}}>{{- . -}}%</option>
			{{- end -}}
		</select>
	</fieldset>
	<fieldset>
		<legend>Text alignment</legend>
		{{- template `settingsbox` (dict `type` "radio" `group` "align" `label` "Left-align" `id` "left" `context` .) -}}
		{{- template `settingsbox` (dict `type` "radio" `group` "align" `label` "Justify" `id` "justify" `context` .) -}}
		{{- template `settingsbox` (dict `type` "radio" `group` "align" `label` "Right-align" `id` "right" `context` .) -}}		
	</fieldset>
	<fieldset>
		<legend>Line spacing</legend>
		<p><label for='line'>{{- `Select a line height:` -}}</label></p>
		<select id='line' name='line' class='select-box'>
			{{- $lineSizes := seq 200 -10 100 -}}
			{{- range $lineSizes -}}
				<option id='l{{- . -}}' value='l{{- . -}}' {{- if eq . 130 -}}selected{{- end -}}>
					{{- div (. | float) 100 -}}
					{{- if eq . 100 -}}{{- ` line (single-spaced)` -}}
					{{- else -}}{{- ` lines` -}}{{- end -}}
					{{- if eq . 200 -}}{{- ` (double-spaced)` -}}{{- end -}}
				</option>
			{{- end -}}
		</select>
	</fieldset>
	<fieldset>
	<legend>Cookie consent</legend>
		<div id='cookie-notice'>
			<p><b>Note:</b> By checking the "I consent" box, you agree to let <i>Dragonhouse Stories</i> (dhstories.com) write and read three "cookies"—small text files—to and from your device. These three cookies:</p>
			<ol>
				<li>Track your acceptance of this notice,</i>
				<li>Store your current theme preferences for use throughout the site, and</li>
				<li>Save your previous theme preferences if you want to revert changes made.</li>
			</ol>
			<p>These cookies are maintained on your current device, and only your current device, until you choose to remove them.</p>
			{{- partial `inputbox` (dict `type` "checkbox" `group` "cookie-consent" `label` "<b>I consent to the above cookie policy for <i>Dragonhouse Stories</i></b>" `id` "cookie-consent" `checked` false) -}}
			<p id='cookie-error' class='hidden'>Cookies must be accepted before applying settings.</p>
		</div>
		{{/* Consent accepted HTML */}}
		<div id='accepted-consent' style='display:none;' aria-hidden=true>
			<p>Cookies for <i>Dragonhouse Stories</i> have been accepted on this device.</p><p>If you would like to withdraw any given consent, erase these cookies from your device, and reset your reading settings, click: <a role='button' href='javascript:resetSettings()'><span>reset all settings</span></a>.</p>
		</div>
	</fieldset>
	<p id='storage-error' class='hidden'>ERROR: Unable to save settings. You may have cookies and/or local storage disabled in your browser!</p>
	<p id='settings-ok' class='hidden'> Settings OK! Returning to previous page... <a href='javascript:undoSettings();'><span>Undo</span></a></p>
	<p class='large-form-buttons'>
		<a role='button' href='javascript:updateSettings();' class='form-button large' title='Apply the current settings and return to the previous page' aria-label='Apply and return to last page'><span>Apply</span></a>
		<a role='button' href='javascript:previewSettings();' class='form-button large' title='Demonstrate the current settings in a preview box below'><span>Preview</span></a>
		<a role='button' href='javascript:cancelSettings();' class='form-button large' title='Discard the current settings and return to the previous page' aria-label='Cancel and return to last page'><span>Cancel</span></a>
		<a role='button' href='javascript:undoSettings();' class='form-button large' title='Revert to your earlier settings'><span>Undo</span></a>
	</p>
</form>
{{</ settings.inline >}}

<div id='preview-box' class='preview-box hidden'>

{{< markdownify >}}

## Preview

Here is a preview of your settings!

Here is a test with **some bold text**

And a test with _some italic text_

And a test with ~~some strikethrough text~~

1. An ordered list example
2. Which contains a few
3. Different items

- And an unordered list
- Using some more items
- To give a good example

Some <a><span>links</span></a> and `inline code` alongside a big code block:

```
This is some code
One may see
On their journey
```

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| This is     | Which works | even if |
| An example      | as one      |  they don't |
| Of a table | may expect      |    show often |

An example of a section break

---

We may have a definition list
: As such

> And at last  
> We have  
> A block quote  

{{</ markdownify >}}
</div>