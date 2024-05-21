//********>
// JS SHOW
//********>

// Shows elements that require Javascript
// These elements are normally hidden, so this script removes the CSS rules that hide them
// Does this by removing the style rule (in a separate <style> tag)

var hider = document.getElementById("js-hide");
hider.parentNode.removeChild(hider);