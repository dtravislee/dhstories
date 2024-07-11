//********>
// TO-TOP.JS
//********>

// Allows to-top link to jump to the top of the page without changing the URI fragment
// Effective for search and settings pages, which use the URI fragment to store data between pages
//	(E.g. the search query, or the page the user came from when inputting settings)

// The current fragment in the URI
// We remove the leading # via substr because it will be added again
//	when we navigate to "#"
var currentFragment = window.location.hash.substr(1);

function toTop() {
	/* Check that a current fragment exists. If so... */
	if (currentFragment) {
		// Relocate to the top of the page by navigating to #
		window.location.hash = "#";
		// Reset the fragment to its original value
		//	and override the "#" navigation event (so clicking "back" will not break the app)
		window.location.replace(window.location.href + currentFragment);
	}
	else {
			window.location.assign(window.location.origin + window.location.pathname + "#");
	}	
}	