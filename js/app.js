const Scroller = (() => {
	//#region private
	const targetAnchorSelector = "#order";
	//#endregion
	return {
		//#region public
		init: () => {
			document.addEventListener("click", (event) => {
				const link = event.target.closest("a[href]");
				if (!link) return;

				const href = link.getAttribute("href");

				if (href === "/") {
					event.preventDefault();
					document.querySelector(targetAnchorSelector)?.scrollIntoView({
						behavior: "smooth",
					});
				} else if (href.startsWith("#")) {
					event.preventDefault();
					const target = document.querySelector(href);
					if (target) {
						target.scrollIntoView({ behavior: "smooth" });
					}
				}
			});
		},
		//#endregion
	};
})();

const Dates = (() => {
	//#region private

	const daysCount = 1;

	const startDateSelector = ".date-1";
	const endDateSelector = ".date-0";

	const startDateList = document.querySelectorAll(startDateSelector);
	const endDateList = document.querySelectorAll(endDateSelector);

	const endDateTimestamp = new Date().getTime();
	const startDateTimestamp = endDateTimestamp - daysCount * 24 * 3600 * 1000;

	const startDate = new Date(startDateTimestamp);
	const endDate = new Date(endDateTimestamp);

	const startDateValue = `${startDate.getDate().toString().padStart(2, 0)}.${(
		startDate.getMonth() + 1
	)
		.toString()
		.padStart(2, 0)}.${startDate.getFullYear()}`;

	const endDateValue = `${endDate.getDate().toString().padStart(2, 0)}.${(
		endDate.getMonth() + 1
	)
		.toString()
		.padStart(2, 0)}.${endDate.getFullYear()}`;

	const swapValues = () => {
		startDateList.forEach((entry) => {
			entry.innerHTML = startDateValue;
		});
		endDateList.forEach((entry) => {
			entry.innerHTML = endDateValue;
		});
	};

	//#endregion
	return {
		//#region public
		init: () => {
			swapValues();
		},
		//#endregion
	};
})();

const Carousel = (() => {
	//#region private
	const carouselSelector = ".js-carousel";
	//#endregion

	return {
		//#region public
		init: () => {
			$(carouselSelector).slick({
				slidesToShow: 1,
				slidesToScroll: 1,
				dots: true,
				prevArrow: ".owl-prev",
				nextArrow: ".owl-next",
			});
		},
		//#endregion
	};
})();

const FAQ = (() => {
	//#region private
	const accordionSelector = ".js-faq";
	const buttonSelector = ".question";
	const shown = "shown";

	const accordionList = document.querySelectorAll(accordionSelector);

	//#endregion

	return {
		//#region public
		init: () => {
			accordionList.forEach((accordion) => {
				accordion.addEventListener("click", (e) => {
					const target = e.target.closest(buttonSelector);
					if (!target) return;

					console.log(target.nextElementSibling);

					target.nextElementSibling.classList.toggle(shown);
				});
			});
		},
		//#endregion
	};
})();

window.addEventListener("DOMContentLoaded", () => {
	Scroller.init();
	Dates.init();
	Carousel.init();
	FAQ.init();
});
 