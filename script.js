const openBtn = document.getElementById("openBtn");
const opening = document.getElementById("opening");
const main = document.getElementById("main");
const music = document.getElementById("weddingMusic");
const musicBtn = document.getElementById("musicBtn");

const flowerPetalSettings = [
    [4, 9, 17, -14, -38, -80],
    [9, 13, 21, -5, 28, 110],
    [15, 8, 19, -18, -24, 170],
    [21, 15, 24, -11, 34, -130],
    [28, 10, 18, -2, -20, 90],
    [34, 12, 22, -16, 31, -160],
    [40, 7, 20, -8, -35, 140],
    [46, 14, 25, -20, 22, -100],
    [52, 9, 18, -4, 38, 180],
    [58, 11, 23, -13, -27, -150],
    [64, 8, 19, -7, 25, 120],
    [70, 16, 26, -21, -33, -170],
    [76, 10, 21, -1, 29, 95],
    [82, 13, 24, -15, -22, 155],
    [88, 8, 18, -9, 36, -120],
    [94, 12, 22, -19, -30, 140],
    [12, 7, 16, -12, 20, -90],
    [56, 7, 17, -6, -18, 75],
    [97, 9, 20, -17, 22, 130],
    [7, 11, 20, -10, 32, 125],
    [18, 8, 17, -16, -28, -145],
    [26, 13, 23, -20, 24, 160],
    [37, 9, 19, -3, -34, -110],
    [44, 12, 21, -14, 26, 135],
    [49, 8, 16, -7, -21, -95],
    [62, 14, 24, -18, 31, 175],
    [68, 9, 18, -5, -25, -140],
    [73, 12, 22, -12, 34, 105],
    [79, 8, 17, -1, -19, -125],
    [86, 11, 20, -15, 27, 150],
    [92, 7, 16, -8, -32, -90]
];

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const heartBubbles = document.getElementById("heartBubbles");

    flowerPetalSettings.forEach(([left, width, duration, delay, drift, rotation]) => {
        const petal = document.createElement("span");
        petal.className = "flower-petal";
        petal.style.setProperty("--petal-left", `${left}%`);
        petal.style.setProperty("--petal-width", `${width}px`);
        petal.style.setProperty("--petal-height", `${Math.round(width * 1.45)}px`);
        petal.style.setProperty("--petal-duration", `${duration}s`);
        petal.style.setProperty("--petal-delay", `${delay}s`);
        petal.style.setProperty("--petal-drift", `${drift}px`);
        petal.style.setProperty("--petal-rotation", `${rotation}deg`);
        heartBubbles.append(petal);
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
const galleryVideo = document.getElementById("galleryVideo");
const galleryVideoToggle = document.getElementById("galleryVideoToggle");
const galleryVideoToggleIcon = document.getElementById("galleryVideoToggleIcon");
const galleryVideoToggleLabel = document.getElementById("galleryVideoToggleLabel");
const galleryPhotos = [
    {
        src: "./images/couple_1.jpg",
        alt: "Shaffana Bibi",
        caption: "A beautiful beginning."
    },
    {
        src: "./images/couple_2.jpg",
        alt: "Difilin",
        caption: "A moment to treasure."
    },
    {
        src: "./images/couple_3.jpg",
        alt: "Difilin",
        caption: "A little piece of eternity."
    },
    {
        src: "./images/couple_4.jpg",
        alt: "Difilin",
        caption: "Our kind of magic."
    },
    {
        src: "./images/couple_5.jpg",
        alt: "Difilin",
        caption: "A love like poetry."
    },
    {
        src: "./images/couple_6.jpg",
        alt: "Difilin",
        caption: "A tale worth telling."
    }
];
let currentGalleryItem = 0;

function updateGalleryVideoButton(isPlaying) {
    galleryVideoToggleIcon.textContent = isPlaying ? "Ⅱ" : "▶";
    galleryVideoToggleLabel.textContent = isPlaying ? "Pause" : "Play";
    galleryVideoToggle.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} wedding video`);
}

function showGalleryItem(direction) {
    const itemCount = galleryPhotos.length + 1;
    currentGalleryItem = (currentGalleryItem + direction + itemCount) % itemCount;
    galleryVideo.pause();

    if (currentGalleryItem === 0) {
        galleryVideo.hidden = false;
        galleryImage.hidden = true;
        galleryVideoToggle.hidden = false;
        galleryCaption.textContent = "A promise wrapped in love";
        return;
    }

    const photo = galleryPhotos[currentGalleryItem - 1];
    galleryVideo.hidden = true;
    galleryImage.hidden = false;
    galleryVideoToggle.hidden = true;
    galleryImage.src = photo.src;
    galleryImage.alt = photo.alt;
    galleryCaption.textContent = photo.caption;
}

galleryVideoToggle.addEventListener("click", async () => {
    if (galleryVideo.paused) {
        try {
            await galleryVideo.play();
        } catch {
            galleryVideoToggleLabel.textContent = "Try again";
            galleryVideoToggle.setAttribute("aria-label", "Unable to play wedding video. Try again.");
        }
    } else {
        galleryVideo.pause();
    }
});

galleryVideo.addEventListener("play", () => updateGalleryVideoButton(true));
galleryVideo.addEventListener("pause", () => updateGalleryVideoButton(false));
galleryVideo.addEventListener("error", () => {
    galleryVideoToggleLabel.textContent = "Unavailable";
    galleryVideoToggle.setAttribute("aria-label", "Wedding video unavailable");
});

previousPhoto.addEventListener("click", () => showGalleryItem(-1));
nextPhoto.addEventListener("click", () => showGalleryItem(1));

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
