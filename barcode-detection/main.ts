/**
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import { detectBarcodes } from '../src/detectors/barcode.js';
import { Card } from '../src/elements/card/card.js';
import { DotLoader } from '../src/elements/dot-loader/dot-loader.js';
import { NoSupportCard } from '../src/elements/no-support-card/no-support-card.js';
import { OnboardingCard } from '../src/elements/onboarding-card/onboarding-card.js';
import { StreamCapture } from '../src/elements/stream-capture/stream-capture.js';
import { supportsEnvironmentCamera } from '../src/utils/environment-camera.js';
import { DEBUG_LEVEL, log } from '../src/utils/logger.js';
import { vibrate } from '../src/utils/vibrate.js';

const detectedBarcodes = new Set<string>();

// Register custom elements.
customElements.define(StreamCapture.defaultTagName, StreamCapture);
customElements.define(NoSupportCard.defaultTagName, NoSupportCard);
customElements.define(Card.defaultTagName, Card);

// Register events.
window.addEventListener(StreamCapture.frameEvent, onCaptureFrame);

// While the onboarding begins, attempt a fake detection. If the polyfill is
// necessary, or the detection fails, we should find out.
const attemptDetection = detectBarcodes(new ImageData(1, 1));

/**
 * Starts the user onboarding.
 */
export async function initialize() {
  const onboarding = document.querySelector(OnboardingCard.defaultTagName);
  if (!onboarding) {
    beginDetection();
    return;
  }

  // When onboarding is finished, start the stream and remove the loader.
  onboarding.addEventListener(OnboardingCard.onboardingFinishedEvent, () => {
    onboarding.remove();
    beginDetection();
  });
}

/**
 * Initializes the main behavior.
 */
async function beginDetection() {
  try {
    // Wait for the faked detection to resolve.
    await attemptDetection;

    // Create the stream.
    await createStreamCapture();
  } catch (e) {
    log(e.message, DEBUG_LEVEL.ERROR, 'Barcode detection');
    showNoSupportCard();
  }
}

let hintTimeout: number;
/**
 * Creates the stream an initializes capture.
 */
async function createStreamCapture() {
  const capture = new StreamCapture();
  capture.captureRate = 600;
  capture.captureScale = 0.8;
  capture.addEventListener(StreamCapture.closeEvent, () => {
    capture.remove();
  });

  const streamOpts = {
    video: {
      facingMode: 'environment'
    }
  };

  // Attempt to get access to the user's camera.
  try {
    const stream = await navigator.mediaDevices.getUserMedia(streamOpts);
    const devices = await navigator.mediaDevices.enumerateDevices();

    const hasEnvCamera = await supportsEnvironmentCamera(devices);
    capture.flipped = !hasEnvCamera;
    capture.start(stream);

    document.body.appendChild(capture);

    hintTimeout = setTimeout(() => {
      capture.showOverlay('Make sure the barcode is inside the box.');
    }, window.PerceptionToolkit.config.hintTimeout || 5000) as unknown as number;
  } catch (e) {
    // User has denied or there are no cameras.
    console.log(e);
  }
}

/**
 * Processes the image data captured by the StreamCapture class, and hands off
 * the image data to the barcode detector for processing.
 *
 * @param evt The Custom Event containing the captured frame data.
 */
async function onCaptureFrame(evt: Event) {
  const { detail } = evt as CustomEvent<{imgData: ImageData}>;
  const { imgData } = detail;
  const barcodes = await detectBarcodes(imgData);

  for (const barcode of barcodes) {
    if (detectedBarcodes.has(barcode.rawValue)) {
      continue;
    }

    // Prevent multiple markers for the same barcode.
    detectedBarcodes.add(barcode.rawValue);

    vibrate(200);

    // Hide the hint if it's shown. Cancel it if it's pending.
    clearTimeout(hintTimeout);
    (evt.target as StreamCapture).hideOverlay();

    // Create a card for every found barcode.
    const card = new Card();
    card.src = barcode.rawValue;

    const container = createContainerIfRequired();
    container.appendChild(card);
  }

  // Hide the loader if there is one.
  const loader = document.querySelector(DotLoader.defaultTagName);
  if (!loader) {
    return;
  }

  loader.remove();
}

function showNoSupportCard() {
  const noSupport = new NoSupportCard();
  document.body.appendChild(noSupport);
}

function createContainerIfRequired() {
  let detectedBarcodesContainer = document.querySelector('#container');

  if (!detectedBarcodesContainer) {
    detectedBarcodesContainer = document.createElement('div');
    detectedBarcodesContainer.id = 'container';
    document.body.appendChild(detectedBarcodesContainer);
  }

  return detectedBarcodesContainer;
}
