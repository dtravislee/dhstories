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

<noscript>JavaScript must be enabled to change site theme settings!</noscript>

{{< settings.inline >}}

{{/* Radiobutton: takes id, radio group name, label, and checked status as inputs (in dict format) */}}
{{/* dict `type` "radio" `group` "groupName" `label` "buttonLabel" `id` "buttonId" `checked` true/false */}}
{{- define `radiobutton` -}}
	<div id='{{- .id -}}-container'>
		<input type='radio' id='{{- .id -}}' name='{{- .group -}}' value='{{- .id -}}' {{- if .checked -}}{{- ` checked` -}}{{- end -}}>
		<label for='{{- .id -}}'>{{- .label -}}</label>
	</div>
{{- end -}}

{{- $containerName := `-container` -}}
<form class='js-only' action='javascript:updateSettings();'>
	<fieldset>
		<legend>Theme</legend>
		{{- partial `inputbox` (dict `type` "radio" `group` "theme" `label` "Light colours" `id` "light" `checked` true) -}}
		{{- partial `inputbox` (dict `type` "radio" `group` "theme" `label` "Dark colours" `id` "dark" `checked` false) -}}
	</fieldset>
	<fieldset>
		<legend>Font style</legend>
		{{- partial `inputbox` (dict `type` "radio" `group` "font" `label` "Serif" `id` "serif" `checked` true) -}}
		{{- partial `inputbox` (dict `type` "radio" `group` "font" `label` "Sans-serif" `id` "sans" `checked` false) -}}
		{{- partial `inputbox` (dict `type` "radio" `group` "font" `label` "Monospace" `id` "mono" `checked` false) -}}
	</fieldset>
	<fieldset>
		<legend>Font size</legend>
		<label for='size'>{{- `Select a font size:` -}}</label>
		<select id='size' name='size' class='select-box'>
			{{- $fontSizes := seq 200 -10 50 -}}
			{{- range $fontSizes -}}
				<option id='s{{- . -}}' value='s{{- . -}}' {{- if eq . 100 -}}selected{{- end -}}>{{- . -}}%</option>
			{{- end -}}
		</select>
	</fieldset>
	<fieldset>
		<legend>Text alignment</legend>
		{{- partial `inputbox` (dict `type` "radio" `group` "align" `label` "Left-align" `id` "left" `checked` true) -}}
		{{- partial `inputbox` (dict `type` "radio" `group` "align" `label` "Justify" `id` "justify" `checked` false) -}}
		{{- partial `inputbox` (dict `type` "radio" `group` "align" `label` "Right-align" `id` "right" `checked` false) -}}		
	</fieldset>
	<fieldset>
		<legend>Line spacing</legend>
		<label for='line'>{{- `Select a line height:` -}}</label>
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
			<p><b>Note:</b> By checking the "I consent" box, you agree to let <i>Dragonhouse Stories</i> (dhstories.com) write and read two "cookies"—small text files—to and from your device. These two cookies, respectively, track your acceptance of this notice and store your theme preferences for use throughout the site. They are maintained on your current device, and only your current device, until you choose to remove them.</p>
			{{- partial `inputbox` (dict `type` "checkbox" `group` "cookie-consent" `label` "<b>I consent to the above cookie policy for <i>Dragonhouse Stories</i></b>" `id` "cookie-consent" `checked` false) -}}
		</div>
		{{/* Consent accepted HTML */}}
		<div id='accepted-consent' style='display:none;' aria-hidden=true>
			<p>Cookies for <i>Dragonhouse Stories</i> have been accepted on this device.</p><p>If you would like to withdraw any given consent, erase these cookies from your device, and reset your reading settings, click: <a role='button' href='javascript:resetSettings()'>reset all settings</a>.</p>
		</div>
	</fieldset>
	<p>
		<a role='button' href='javascript:updateSettings();' class='form-button large' title='Apply the current settings and return to the previous page'>Apply</a>
		<a role='button' href='javascript:previewSettings();' class='form-button large' title='Demonstrate the current settings in a preview box'>Preview</a>
		<a role='button' href='javascript:cancelSettings();' class='form-button large' title='Discard the current settings and return to the previous page'>Cancel</a>
	</p>
	
</form>
{{</ settings.inline >}}

<div id='alert-box' class='alert-box hidden'>
	<h2>Alert title</h2>
	<p>Alert body text</p>
	<div class='alert-buttons'>
		<a role='button' id='accept-alert' href='javascript:acceptAlert();'>OK</a>
		<a role='button' id='cancel-alert' href='javascript:cancelAlert();'>Cancel</a>
		<a role='button' id='close-alert' href='javascript:closeAlert();'>Close</a>
	</div>
</div>
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

Some <a>links</a> and `inline code` alongside a big code block:

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