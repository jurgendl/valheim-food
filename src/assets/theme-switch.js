$(".darkmode").click(function () {
	$("body").toggleClass("dark");
	if ($("body").hasClass("dark")) {
		document.getElementById("theme").href = "assets/darkly.bootstrap.min.css";
		$(".no-thead-dark")
			.removeClass("no-thead-dark")
			.addClass("thead-dark");
		$(".no-table-dark")
			.removeClass("no-table-dark")
			.addClass("table-dark");
	} else {
		document.getElementById("theme").href = "assets/original.bootstrap.min.css";
		$(".thead-dark")
			.removeClass("thead-dark")
			.addClass("no-thead-dark");
		$(".table-dark")
			.removeClass("table-dark")
			.addClass("no-table-dark");
	}
});
