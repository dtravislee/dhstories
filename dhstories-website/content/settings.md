+++
### Front Matter
###### Title - Required.
title = "Settings"

###### Description (string) - For subtitle and social media metadata. (Optional - If omitted, will hide subtitle and use only auto-summary for social media metadata.)
description = "Visual adjustments for your reading comfort"

#### Layout - Layout to use for this content
layout = "settings"
+++

<noscript>JavaScript must be enabled to change site theme settings!</noscript>

{{< settings.inline >}}
{{- $containerName := `-container` -}}
<form class='js-only' action='javascript:updateSettings();'>
	<fieldset>
		<legend>Theme</legend>
		{{- $theme1Name := `light` -}}
		<div id='{{- $theme1Name -}}{{- $containerName -}}'>
			<input type='radio' id='{{- $theme1Name -}}' name='theme' value='{{- $theme1Name -}}' checked>
			<label for='{{- $theme1Name -}}'>{{- $theme1Name | title }} colours</label>
		</div>
		{{- $theme2Name := `dark` -}}
		<div id='{{- $theme2Name -}}{{- $containerName -}}'>
			<input type='radio' id='{{- $theme2Name -}}' name='theme' value='{{- $theme2Name -}}'>
			<label for='{{- $theme2Name -}}'>{{- $theme2Name | title }} colours</label>
		</div>
	</fieldset>
	<fieldset>
		<legend>Font Style</legend>
		{{- $font1Name := `serif` -}}
		<div id='{{- $font1Name -}}{{- $containerName -}}'>
			<input type='radio' id='{{- $font1Name -}}' name='font' value='{{- $font1Name -}}' checked>
			<label for='{{- $font1Name -}}'>Serif</label>
		</div>
		{{- $font2Name := `sans` -}}
		<div id='{{- $font2Name -}}{{- $containerName -}}'>
			<input type='radio' id='{{- $font2Name -}}' name='font' value='{{- $font2Name -}}'>
			<label for='{{- $font2Name -}}'>Sans Serif</label>
		</div>
		{{- $font3Name := `mono` -}}
		<div id='{{- $font3Name -}}{{- $containerName -}}'>
			<input type='radio' id='{{- $font3Name -}}' name='font' value='{{- $font3Name -}}'>
			<label for='{{- $font3Name -}}'>Monospace</label>
		</div>
	</fieldset>
	<fieldset>
		<legend>Font Size</legend>
		<label for='size'>{{- `Select a font size:` -}}</label>
		<select id='size' name='size' class='select-box'>
			{{- $fontSizes := seq 200 -10 50 -}}
			{{- range $fontSizes -}}
				<option id='s{{- . -}}' value='s{{- . -}}' {{- if eq . 100 -}}selected{{- end -}}>{{- . -}}%</option>
			{{- end -}}
		</select>
	</fieldset>
	<fieldset>
		<legend>Text Alignment</legend>
		{{- $align1Name := `left` -}}
		<div id='{{- $align1Name -}}{{- $containerName -}}'>
			<input type='radio' id='{{- $align1Name -}}' name='align' value='{{- $align1Name -}}' checked>
			<label for='{{- $align1Name -}}'>Left-Align</label>
		</div>
		{{- $align2Name := `justify` -}}
		<div id='{{- $align2Name -}}{{- $containerName -}}'>
			<input type='radio' id='{{- $align2Name -}}' name='align' value='{{- $align2Name -}}'>
			<label for='{{- $align2Name -}}'>Justify</label>
		</div>
		{{- $align3Name := `right` -}}
		<div id='{{- $align3Name -}}{{- $containerName -}}'>
			<input type='radio' id='{{- $align3Name -}}' name='align' value='{{- $align3Name -}}'>
			<label for='{{- $align3Name -}}'>Right-Align</label>
		</div>			
	</fieldset>
	<fieldset>
		<legend>Line Spacing</legend>
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
	<legend>Cookie Consent</legend>
		<span id='cookie-notice'><input id='cookie-consent' class='checkbox' type='checkbox'/><label for='cookie-consent'><b>Note:</b> By checking this box, you agree to let <i>Dragonhouse Stories</i> (dhstories.com) write and read two "cookies"—small text files—to and from your device. These two cookies, respectively, track your acceptance of this notice and store your theme preferences for use throughout the site. They are maintained on your current device, and only your current device, until you choose to remove them.</label></span>
	</fieldset>
	<span class='settings-buttons' id='preview-stop'>
		<a href='javascript:updateSettings();' class='go' role='button' title='Apply the current settings and return to the previous page'>Apply</a>
		<a href='javascript:previewSettings();' class='demo' role='button' title='Demonstrate the current settings in a preview box'>Preview</a>
		<a href='javascript:cancelSettings();' class='cancel' role='button' title='Discard the current settings and return to the previous page'>Cancel</a>
	</span>
</form>
{{</ settings.inline >}}

<p id='error-box' class='error-box hidden'></p>

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