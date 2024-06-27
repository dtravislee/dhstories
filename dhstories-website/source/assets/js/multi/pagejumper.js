{{- $paginator := .Scratch.Get `pages` -}}
{{- if gt $paginator.TotalPages 1 -}}{{- with $paginator -}}

//********>
// PAGEJUMPER.JS
//********>

// Implements JavaScript to jump to pagination pages per user input
// Only added to Hugo output if the paginator has more than 1 page to it

function goToPage() {
		// Get the value from the pagenum input
		var pagenum = document.getElementById('pagenum').value;
		// Then, get the URL of the last page in the paginator
		// ( We use the last page because it will always exist and have a page number.
		//	.Next and .Prev may not exist if we are already on the last / first pages
		//		and .First does not have a page number by default. 
		// 	This also ensures that this function is structure agnostic
		//		so the url could be /page/2 or /bagels/35 and it would work.)
		var pageHref = '{{- $.Site.BaseURL -}}{{- .Last.URL -}}';
		// Replace the page number with the new page number
		pageHref = pageHref.replace(/\/[0-9]\//, '/' + pagenum + '/');
		// Finally, navigate the user to the desired page
		window.location.assign(pageHref);
}
{{- end -}}{{- end -}}