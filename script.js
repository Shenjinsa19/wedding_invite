const openBtn = document.getElementById("openBtn");
const opening = document.getElementById("opening");
const main = document.getElementById("main");
const music = document.getElementById("weddingMusic");
const musicBtn = document.getElementById("musicBtn");

const heartBubbleSettings = [
    [5, 28, 22, -4, -26],
    [13, 18, 19, -13, 24],
    [22, 34, 25, -8, -18],
    [31, 22, 20, -17, 31],
    [40, 16, 24, -2, -22],
    [49, 30, 21, -11, 20],
    [58, 20, 26, -19, -30],
    [67, 36, 23, -6, 25],
    [76, 19, 20, -15, -20],
    [85, 29, 25, -9, 28],
    [94, 17, 22, -21, -25],
    [3, 24, 27, -18, 20],
    [55, 15, 19, -5, -18],
    [91, 23, 24, -12, 22]
];

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const heartBubbles = document.getElementById("heartBubbles");

    heartBubbleSettings.forEach(([left, size, duration, delay, drift]) => {
        const bubble = document.createElement("span");
        const heart = document.createElement("span");
        bubble.className = "heart-bubble";
        heart.className = "heart-bubble-symbol";
        heart.textContent = "♡";
        bubble.style.setProperty("--bubble-left", `${left}%`);
        bubble.style.setProperty("--bubble-size", `${size}px`);
        bubble.style.setProperty("--bubble-duration", `${duration}s`);
        bubble.style.setProperty("--bubble-delay", `${delay}s`);
        bubble.style.setProperty("--bubble-drift", `${drift}px`);
        bubble.append(heart);
        heartBubbles.append(bubble);
    });
}

// Keep this date aligned with the date displayed in the invitation.
const weddingDate = new Date("2027-01-11T16:30:00+05:30").getTime();

function updateMusicButton(isPlaying, label) {
    document.getElementById("musicLabel").textContent = label;
    musicBtn.setAttribute("aria-label", isPlaying ? "Turn music off" : "Turn music on");
    musicBtn.setAttribute("aria-pressed", String(isPlaying));
}

async function playMusic() {
    try {
        await music.play();
        updateMusicButton(true, "ON");
    } catch (error) {
        updateMusicButton(false, "Music unavailable");
    }
}

openBtn.addEventListener("click", async () => {
    if (main.classList.contains("show")) {
        return;
    }

    opening.classList.add("hide");
    opening.setAttribute("aria-hidden", "true");
    main.inert = false;
    main.setAttribute("aria-hidden", "false");
    main.classList.add("show");
    document.body.classList.remove("locked");
    musicBtn.classList.add("active");
    musicBtn.focus({ preventScroll: true });

    await playMusic();
});

musicBtn.addEventListener("click", async () => {
    if (music.paused) {
        await playMusic();
    } else {
        music.pause();
        updateMusicButton(false, "OFF");
    }
});

music.addEventListener("error", () => {
    updateMusicButton(false, "Music unavailable");
});

const countdownIds = ["days", "hours", "minutes", "seconds"];

function updateCountdown() {
    const difference = weddingDate - Date.now();

    if (difference <= 0) {
        countdownIds.forEach((id) => {
            document.getElementById(id).textContent = "00";
        });
        clearInterval(countdownInterval);
        return;
    }

    const values = [
        Math.floor(difference / (1000 * 60 * 60 * 24)),
        Math.floor((difference / (1000 * 60 * 60)) % 24),
        Math.floor((difference / (1000 * 60)) % 60),
        Math.floor((difference / 1000) % 60)
    ];

    countdownIds.forEach((id, index) => {
        document.getElementById(id).textContent = String(values[index]).padStart(2, "0");
    });
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

const scratchCanvas = document.getElementById("scratchCanvas");
const scratchContext = scratchCanvas.getContext("2d", { willReadFrequently: true });
let scratching = false;

function paintScratchSurface() {
    const bounds = scratchCanvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    scratchCanvas.width = Math.round(bounds.width * pixelRatio);
    scratchCanvas.height = Math.round(bounds.height * pixelRatio);
    scratchContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const surface = scratchContext.createLinearGradient(0, 0, bounds.width, bounds.height);
    surface.addColorStop(0, "#fff3f6");
    surface.addColorStop(0.52, "#f7dce5");
    surface.addColorStop(1, "#e9bfcd");
    scratchContext.globalCompositeOperation = "source-over";
    scratchContext.fillStyle = surface;
    scratchContext.fillRect(0, 0, bounds.width, bounds.height);
    scratchContext.fillStyle = "#8c5a6c";
    scratchContext.textAlign = "center";
    scratchContext.font = "600 12px Montserrat, sans-serif";
    scratchContext.fillText("SCRATCH TO REVEAL", bounds.width / 2, bounds.height / 2 - 7);
    scratchContext.fillStyle = "#b56f86";
    scratchContext.font = "32px Georgia, serif";
    scratchContext.fillText("♥", bounds.width / 2, bounds.height / 2 + 29);
}

function scratchAt(event) {
    const bounds = scratchCanvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    scratchContext.globalCompositeOperation = "destination-out";
    scratchContext.beginPath();
    scratchContext.arc(x, y, 24, 0, Math.PI * 2);
    scratchContext.fill();
}

scratchCanvas.addEventListener("pointerdown", (event) => {
    scratching = true;
    scratchCanvas.setPointerCapture(event.pointerId);
    scratchAt(event);
});

scratchCanvas.addEventListener("pointermove", (event) => {
    if (scratching) scratchAt(event);
});

scratchCanvas.addEventListener("pointerup", () => {
    scratching = false;
    const pixels = scratchContext.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
    let transparentPixels = 0;
    const sampleStep = 4 * 24;
    for (let index = 3; index < pixels.length; index += sampleStep) {
        if (pixels[index] === 0) transparentPixels += 1;
    }
    if (transparentPixels / (pixels.length / sampleStep) > 0.3) {
        scratchCanvas.classList.add("revealed");
    }
});

paintScratchSurface();
window.addEventListener("resize", paintScratchSurface);

const previousPhoto = document.getElementById("previousPhoto");
const nextPhoto = document.getElementById("nextPhoto");
const galleryImage = document.getElementById("galleryImage");
const galleryCaption = document.getElementById("galleryCaption");
const galleryPhotos = [
    {
        src: "./images/aishu.jpeg",
        alt: "Shaffana Bibi",
        caption: "A beautiful beginning."
    },
    {
        src: "./images/diflin.jpeg",
        alt: "Difilin",
        caption: "A moment to treasure."
    },
    
];
let currentPhoto = 0;

function showPhoto(direction) {
    currentPhoto = (currentPhoto + direction + galleryPhotos.length) % galleryPhotos.length;
    galleryImage.src = galleryPhotos[currentPhoto].src;
    galleryImage.alt = galleryPhotos[currentPhoto].alt;
    galleryCaption.textContent = galleryPhotos[currentPhoto].caption;
}

previousPhoto.addEventListener("click", () => showPhoto(-1));
nextPhoto.addEventListener("click", () => showPhoto(1));

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealTargets = document.querySelectorAll(
        ".intro > *, .countdown-section > *, .events > *, .venue-content > *, .gallery-section > *"
    );
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.16 });

    revealTargets.forEach((target, index) => {
        target.classList.add("reveal");
        target.style.setProperty("--reveal-delay", `${(index % 4) * 90}ms`);
        revealObserver.observe(target);
    });
}
