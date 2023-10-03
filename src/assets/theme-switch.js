$(".darkmode").click(function () {
	$("body").toggleClass("dark");
	if ($("body").hasClass("dark")) {
		document.getElementById("theme").href = "assets/darkly.bootstrap.min.css";
	} else {
		document.getElementById("theme").href = "assets/original.bootstrap.min.css";
	}
});
