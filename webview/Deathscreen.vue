<template>
    <div
        class="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-black text-white"
    >
        <div class="bg-black-900 absolute inset-0 animate-pulse opacity-10"></div>

        <div class="absolute right-4 top-4 space-y-2">
            <div class="rounded-xl bg-gray-800 p-4">https://rebar-ascended.dev</div>
            <div class="rounded-xl bg-gray-800 p-4">https://rebarv.com</div>
        </div>

        <img src="/images/logo.svg" alt="ASCENDED Logo" class="mb-8 h-auto w-full max-w-lg" />

        <h1 class="mb-8 animate-bounce text-6xl font-bold">UNCONSCIOUS</h1>

        <div class="relative mb-8 h-32 w-full max-w-3xl">
            <svg class="h-full w-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
                <path
                    :d="ecgPath"
                    fill="none"
                    stroke="#FF0000"
                    stroke-width="2"
                    :style="{ strokeDasharray: pathLength, strokeDashoffset: dashOffset }"
                />
            </svg>
        </div>

        <div class="mb-4 text-4xl font-bold">Until death: {{ formattedRemainingTime }}</div>

        <div class="mb-8 text-xl">{{ deathInfo }}</div>

        <div class="absolute bottom-4 right-4 text-2xl">{{ currentTime }}</div>
    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useEvents } from '@Composables/useEvents';
import { DEATH_EVENTS } from '../shared/events';
import { DEATH_CONFIG } from '../shared/config';

const events = useEvents();

const pathLength = ref(0);
const dashOffset = ref(0);

const createECGPath = () => {
    const segments = 8;
    const segmentWidth = 125;
    let path = `M0 80 `;

    for (let i = 0; i < segments; i++) {
        const startX = i * segmentWidth;
        const peakHeight = Math.random() * 80 + 30; // Random height between 50 and 80
        const peakWidth = Math.random() * 10 + 30; // Random width between 15 and 25
        const secondaryPeakHeight = Math.random() * 10 + 5; // Random height for secondary peak

        path += `L${startX} 80 `; // Baseline
        path += `L${startX + peakWidth * 0.2} ${100 - peakHeight * 0.3} `; // Initial rise
        path += `L${startX + peakWidth * 0.4} ${100 - peakHeight} `; // Sharp upward line
        path += `L${startX + peakWidth * 0.6} ${20} `; // Sharp downward line
        path += `L${startX + peakWidth * 0.8} ${80 + secondaryPeakHeight} `; // Secondary peak
        path += `L${startX + peakWidth} 80 `; // Back to baseline

        // Add some random noise
        for (let j = 1; j < 5; j++) {
            const noiseX = startX + peakWidth + (segmentWidth - peakWidth) * (j / 5);
            const noiseY = 80 + (Math.random() - 0.5) * 5;
            path += `L${noiseX} ${noiseY} `;
        }
    }

    path += `L1000 80`; // End with a baseline
    return path;
};

const ecgPath = ref(createECGPath());

const remainingTime = ref(DEATH_CONFIG.timeUntilDeath);
const formattedRemainingTime = computed(() => {
    const minutes = Math.floor(remainingTime.value / 60);
    const seconds = remainingTime.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const currentTime = ref('');
const deathInfo = ref('Random Information Text | Wait till you dead or a medic revives you.');

let animationFrame;
let countdownInterval;

onMounted(() => {
    const path = document.querySelector('path');
    pathLength.value = path.getTotalLength();
    dashOffset.value = pathLength.value;
    animateECG();

    countdownInterval = setInterval(() => {
        if (remainingTime.value > 0) {
            remainingTime.value--;
        } else {
            clearInterval(countdownInterval);
            events.emitServer(DEATH_EVENTS.ToServer.DIED);
        }
    }, 1000);

    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

onUnmounted(() => {
    cancelAnimationFrame(animationFrame);
    clearInterval(countdownInterval);
});

function animateECG() {
    dashOffset.value -= 2;
    if (dashOffset.value <= 0) {
        dashOffset.value = pathLength.value;
        ecgPath.value = createECGPath();
    }
    animationFrame = requestAnimationFrame(animateECG);
}

function updateCurrentTime() {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString();
}
</script>

<style>
@keyframes bounce {
    0%,
    100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
        transform: translateY(0);
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
}
.animate-bounce {
    animation: bounce 2s infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 0.1;
    }
    50% {
        opacity: 0.3;
    }
}
.animate-pulse {
    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
