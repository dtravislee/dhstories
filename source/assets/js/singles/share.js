//********>
// SHARE.JS
//********>

// Alters links on share.html to match the originating post
// Share.html can usually only be accessed via other pages with a "share this" link
// Data is carried between pages via the URL hash

//********>
// GLOBAL VARIABLES
//********>

/* Site variables */
// siteURL = the website's base URL, e.g. dtravislee.com
// siteTitle = the site's title, e.g. D. Travis Lee
// siteDesc = the site's description, set via _index.md

/* Target variables - set by the page the user came from */
// targetPath = the target's URL path, relative to siteURL
// targetURL = the target post's URL
//	Note that this is a combination of siteURL and targetPath
// targetTitle = the target post's title.
// targetDesc = the target post's description

/* Share texts - the content of the share page itself */
// shareText = the share page's body text, containing the share links.

/* Indices - index numbers of the target URL, title, and description */
// pathIndex = string index of the target post's path, denoted by #p= in targetFragment
// titleIndex = string index of the target post's title, denoted by &t= in targetFragment
// descIndex = string index of the target post's description, denoted by &d= in targetFragment
var siteURL, siteTitle, siteDesc,
	targetFilename, targetURL, targetTitle, targetDesc,
	shareText,
	pathIndex, titleIndex, descIndex;
// Initial site variable assignments; see also share.md
siteURL = '{{- $.Site.BaseURL -}}';
siteTitle = '{{- $.Site.Params.title -}}';
siteDesc = '{{- $.Site.Params.description -}}';

//********>
// TARGET GETTER
//********>

// Gets the target post's URL, title, or description, based on an input index
// Index = the start point for getting the target, one of pathIndex, titleIndex, or descIndex
function getTargetFromIndex(index) {
	
	// Ensure the input index is valid, i.e. positive integer
	if (index > -1) {
		// Grab the window's hash
		var hash = window.location.hash;
		// Look for the next stop point after the given index
		// Stop points are demarcated by '&' characters in the URL hash
		var nextStop = hash.indexOf('&', index+1);
		// If no stop point is found found, set the stop point to the end of the hash
		if (nextStop <= -1) { nextStop = hash.length }
		// Return the targeted slice
		// We add 3 to the targeted index to skip over demarcating characters,
		//	namely &p=, &t=, and &d= (all 3 characters long)
		return hash.slice(index+3, nextStop);
	}
	else { return '' } // Return an empty string if input is invalid
}

//********>
// LINK UPDATER
//********>

// Note that this script is placed at the end of the page, so should run only once DOM is loaded
// Therefore, window.onload is implied! (Without needing the actual event listener)

// Once the page is loaded, get the indices of the target's URL, title, and description
pathIndex = window.location.hash.indexOf('&p=');
titleIndex = window.location.hash.indexOf('&t=');
descIndex = window.location.hash.indexOf('&d=');
// Plus the page's content, which we will update with new share links
shareText = document.getElementById('content').innerHTML;

// If we have the path index... (This is our bare minimum for the share function)
if (pathIndex > -1) {
	
	// Start by updating the URL in the share text
	
	// Set the target path via getTargetFromIndex
	// (Target filename = target's URL relative to the base)
	targetPath = getTargetFromIndex(pathIndex);
	// Set the target URL by concatinating the target page's path with the site's base URL
	targetURL = siteURL.concat(getTargetFromIndex(pathIndex));
	// Replace the site URL in shareText with the new target URL
	shareText = shareText.replace(new RegExp(siteURL, 'g'), targetURL);
	
	// Next, we set the title.
	
	// Check if we have the target's title in the hash (denoted by '&t=')
	if (titleIndex > -1) {
		// And if so, grab it via getTargetFromIndex(),
		//	and ensure any URI encoding is decoded for regular text display
		//	(For showing the title to the user, telling them which page they are sharing)
		targetTitle = decodeURI(getTargetFromIndex(titleIndex));
	}
	// Otherwise, use the target's path name to make a title...
	else {
		/* Change filename spacing to proper spacing
			(For example, swapping dashes and underscores for bona fide space characters.)
			Note that there may be differences between this title and the original
				E.g. if the original title uses punctuation, dash, underscores, etc. 
			So the ideal is to include a title in the URL hash (see single.html) */
		targetTitle = targetPath.replace(/([-_]|%20)/g, ' ');
		// Run a quaint for loop on a split-over-spaces of the title to apply a title case style
		//	We don't want just lowercase titles, after all.
		var tempTitle = targetTitle.split(' ');
		for (var i = 0; i < tempTitle.length; i++) {
			// Get the uppercase version of the first character and append the other characters to it
			tempTitle[i] = tempTitle[i].charAt(0).toUpperCase() + tempTitle[i].slice(1);
		}
		// And once we title case the array, put it back together with the spaces we took out
		targetTitle = tempTitle.join(' ');
	}
	// Cap this off with another replace of the old title with the new, target post's title
	shareText = shareText.replace(new RegExp(siteTitle, 'g'), targetTitle);
	
	// Finally, we set the description, if one is present
	// If it isn't present, we use the default (homepage) description
	//	rather than mess with anything complicated (like the title section above)
	if (descIndex > -1) {
		shareText = shareText.replace(new RegExp(siteDesc, 'g'), getTargetFromIndex(descIndex));
	}
	
	// With all of shareText updated, we can replace the content HTML with shareText contents
	document.getElementById('content').innerHTML = shareText;
}