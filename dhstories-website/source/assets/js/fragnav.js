//********>
// FRAGMENT-NAVIGATION.JS
//********>

// Allows navigation via the URI fragment (e.g. to-top links) without disrupting the fragment
// Effective for search and settings pages, which use the URI fragment to store data between pages
//	(E.g. the search query, or the page the user came from when inputting settings)

/* HASH NAVIGATOR */
/* Navigates to an element with a given ID */
/* Called "hash nav" for the "hashtag" symbol in the URI fragment */
/* Params:
	id = string - target element's ID attribute
		Optional - if excluded, navigates to the top of the page (#)
	scrollOnly = boolean - whether to scroll to the location without adding to the browser history
		Optional - Good for when navigation is done automatically on page load */

function hashNav(id, scrollOnly) {
	// Get the current fragment in the URI
	// We remove the leading # via substr because it will be added again
	//	when we navigate to our destination
	var currentFragment = window.location.hash.substr(1);
	// Also store the current core URI elements
	var currentURI = window.location.origin + window.location.pathname;
	
	/* Fallback to a blank string of id is undefined by the method call */
	if (!id) { id = ""; }
	/* And re-add the # character otherwise */
	else { id = "#" + id; }
	
	/* Check that a current fragment exists. If so... */
	if (currentFragment) {
		// If scrollOnly is set, relocate to target location WITHOUT adding to browser history
		if (scrollOnly) { window.location.replace(window.location.href + id); }
		// Otherwise, relocate to the target location and let the browser add to its history
		else { window.location.hash = id; }
		// Reset the fragment to its original value
		//	and override the navigation event 
		// (so clicking "back" will not break the app or require multiple clicks)
		window.location.replace(currentURI + "#" + currentFragment);
	}
	/* Otherwise, just navigate to the target location as-is */
	else {
			window.location.assign(currentURI + id);
	}	
}

/* TO TOP */
/* Alias of hashNav() that navigates to the top of the page */

function toTop() { hashNav(); }

/* SKIP TO MAIN */
/* Alias of hashNav() that navigates to the main content section */

function skipToMain() { hashNav("main"); }