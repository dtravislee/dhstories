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

<form class='js-only' action='javascript:updateSettings();'>
	<fieldset>
		<legend>Site Colours</legend>
		<div>
			<input type='radio' id='lightmode' name='theme' value='lightmode'>
			<label for='lightmode'>Light Theme</label>
		</div>
		<div>
			<input type='radio' id='darkmode' name='theme' value='darkmode'>
			<label for='darkmode'>Dark Theme</label>
		</div>
		<div>
			<input type='radio' id='autocolour' name='theme' value='autocolour' checked>
			<label for='autocolour'>Automatic</label>
		</div>
	</fieldset>
	<fieldset>
		<legend>Font Style</legend>
		<div>
			<input type='radio' id='serif' name='font' value='serif' checked>
			<label for='serif'>Serif</label>
		</div>
		<div>
			<input type='radio' id='sans' name='font' value='sans'>
			<label for='sans'>Sans Serif</label>
		</div>
		<div>
			<input type='radio' id='mono' name='font' value='mono'>
			<label for='mono'>Monospace</label>
		</div>
	</fieldset>
	<fieldset>
		<legend>Font Size</legend>
		<div>
			<input type='radio' id='s200' name='size' value='s200'>
			<label for='s200'>200%</label>
		</div>
		<div>
			<input type='radio' id='s175' name='size' value='s175'>
			<label for='s175'>175%</label>
		</div>
		<div>
			<input type='radio' id='s150' name='size' value='s150'>
			<label for='s150'>150%</label>
		</div>
		<div>
			<input type='radio' id='s125' name='size' value='s125'>
			<label for='s125'>125%</label>
		</div>
		<div>
			<input type='radio' id='s100' name='size' value='s100' checked>
			<label for='s100'>100%</label>
		</div>
		<div>
			<input type='radio' id='s075' name='size' value='s075'>
			<label for='s075'>75%</label>
		</div>	
		<div>
			<input type='radio' id='s050' name='size' value='s050'>
			<label for='s050'>50%</label>
		</div>			
	</fieldset>
	<fieldset>
		<legend>Text Alignment</legend>
		<div>
			<input type='radio' id='left' name='align' value='left' checked>
			<label for='left'>Left-Align</label>
		</div>
		<div>
			<input type='radio' id='justify' name='align' value='justify'>
			<label for='justify'>Justify</label>
		</div>
		<div>
			<input type='radio' id='right' name='align' value='right'>
			<label for='right'>Right-Align</label>
		</div>			
	</fieldset>
	<fieldset>
		<legend>Line Spacing</legend>
		<div>
			<input type='radio' id='l200' name='line' value='l200'>
			<label for='l200'>Double</label>
		</div>
		<div>
			<input type='radio' id='l175' name='line' value='l175'>
			<label for='l175'>1.75 lines</label>
		</div>
		<div>
			<input type='radio' id='l150' name='line' value='l150'>
			<label for='l150'>1.5 lines</label>
		</div>
		<div>
			<input type='radio' id='l125' name='line' value='l125' checked>
			<label for='l125'>1.25 lines</label>
		</div>
		<div>
			<input type='radio' id='l115' name='line' value='l115'>
			<label for='l125'>1.15 lines</label>
		</div>	
		<div>
			<input type='radio' id='l100' name='line' value='l100'>
			<label for='l100'>Single</label>
		</div>		
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