//********>
// DISQUS
//********>

// Implements Disqus comments for a given page
// Original source: https://disqus.com/admin/universalcode

var disqus_config = function () {
	this.page.url = '{{- .Permalink -}}' // URL of the target page
	this.page.identifier = '{{- .File.UniqueID -}}' // UID of the target page
};
function startDisqus() {
	// Remove "Load Comments" button, when used on the page
	var disqusButton = document.getElementById('disqus-loader');
	if (disqusButton) {	disqusButton.parentNode.removeChild(disqusButton); }
	if (["localhost", "127.0.0.1"].indexOf(window.location.hostname) != -1) {
		document.getElementById('disqus_thread').innerHTML = 'Disqus comments not available when website is previewed locally.';
		return;
	}
	var d = document, s = d.createElement('script'); 
	s.async = true;
	s.src = 'https://' + '{{ .Site.DisqusShortname }}' + '.disqus.com/embed.js';
	s.setAttribute('data-timestamp', +new Date());
	(d.head || d.body).appendChild(s);
}