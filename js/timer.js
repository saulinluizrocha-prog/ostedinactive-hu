//init timer for promo action
function Timer() {
	var $timers = document.querySelectorAll(".timer"),
		date = new Date(),
		dateOffset = date.getTimezoneOffset() * 60 * 1000,
		tomorrowDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

	tomorrowDate.setHours(0);
	tomorrowDate.setMinutes(0);

	var timeLeft = tomorrowDate - date + dateOffset;

	step();
	startTimer();

	function setTime(milliseconds) {
		var hours = formatDigit(new Date(milliseconds).getHours()),
			minutes = formatDigit(new Date(milliseconds).getMinutes());

		for (var i = 0; i < $timers.length; i++) {
			$timers[i].querySelector(".hours").textContent = hours;
			$timers[i].querySelector(".minutes").textContent = minutes;
		}
	}

	function formatDigit(digit) {
		if (digit >= 10) {
			return digit;
		} else {
			return "0" + digit;
		}
	}

	var interval;

	function step() {
		if (timeLeft == dateOffset) {
			clearInterval(interval);
		} else {
			timeLeft -= 1000;
			setTime(timeLeft);
		}
	}

	function startTimer() {
		interval = setInterval(step, 1000);
	}
}
Timer();
 