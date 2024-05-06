//********>
// ERROR BOX SCRIPT
//********>

// Handles writing to, and showing, error boxes (on settings page and pagination partials)

/* msg = the message to display (may include HTML, variables, etc.) */

function setError(msg) {
	// Get the settings error box
	var errorBox = document.getElementById('error-box');
	// If msg is null, skip the rest
	if (!msg) { errorBox.className = 'error-box hidden'; return null; }
	// Otherwise, write the message to the box and show it
	errorBox.innerHTML = msg;
	errorBox.className = 'error-box';
}