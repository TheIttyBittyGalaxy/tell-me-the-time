const clockElement = document.getElementById("clock");
const nextElement = document.getElementById("next");
const infoBarInner = document.getElementById("info-bar-inner");
const intervalInput = document.getElementById("interval-input");
const speakInput = document.getElementById("speak");

const audio = {
	hour: [],
	minute: [],
};

let readingTime = false;

let lastMinute = -1;
let nextMinute = 0;

let hasBegun = false;

const as12hr = h => ((h + 11) % 12) + 1;
const pad = x => x.toString().padStart(2, "0");

function setClock(e, h, m) {
	const time = e.querySelector(".time");
	const ampm = e.querySelector(".am-pm");
	m = m.toString().padStart(2, 0);

	time.innerText = as12hr(h) + ":" + pad(m);
	ampm.innerText = h > 12 ? "PM" : "AM";
}

function readTime(h, m) {
	readingTime = true;
	console.log(`Read time: ${h}:${pad(m)}`);
	speakInput.classList.add("active");

	const hourAudio = audio.hour[as12hr(h)];
	const minAudio = audio.minute[m];

	hourAudio.play();
	setTimeout(() => {
		minAudio.play();
		setTimeout(() => {
			readingTime = false;
			speakInput.classList.remove("active");
		}, minAudio.duration * 1000);
	}, hourAudio.duration * 1000 - 10);
}

function update(now) {
	now = now || new Date();
	const h = now.getHours();
	const m = now.getMinutes();

	// Update clock
	setClock(clockElement, h, m);

	// Update next
	const f = intervalInput.value;
	nextMinute = ((Math.floor(m / f) + 1) * f) % 60;

	setClock(nextElement, h, nextMinute);

	if (lastMinute != m && m % f == 0 && !readingTime) {
		readTime(h, m);
	}

	lastMinute = m;
}

// Load audio
for (let i = 1; i <= 12; i++) {
	audio.hour[i] = new Audio();
	audio.hour[i].src = `audio/hour-${pad(i)}.wav`;
}

for (let i = 0; i <= 59; i++) {
	audio.minute[i] = new Audio();
	audio.minute[i].src = `audio/min-${pad(i)}.wav`;
}

// Inputs
speakInput.addEventListener("click", () => {
	const now = new Date();
	readTime(now.getHours(), now.getMinutes());
});

intervalInput.addEventListener("change", () => {
	update(null);

	if (hasBegun) return;
	hasBegun = true;

	const now = new Date();
	readTime(now.getHours(), now.getMinutes());
	document.body.classList.remove("opening");

	setInterval(() => {
		const now = new Date();

		let msSinceLast = now.getSeconds() * 1000 + now.getMilliseconds();
		infoBarInner.style.width = msSinceLast / 600 + "%";

		if (now.getMinutes() != lastMinute) update(now);
	}, 1000 / 30);
});

intervalInput.value = null;
