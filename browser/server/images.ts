export const goalImg = (color: string) => {
  const img = new Image();
  const imgStr = window.btoa(`<svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg"  width="800px" height="800px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve"><g><path fill="${color}" d="M56,56H8v-1.07l12-6.855V32c0-7.496,4.492-15.586,12-21.992C39.508,16.414,44,24.504,44,32v16.074 l11.824,6.754c0.062,0.039,0.121,0.078,0.176,0.117V56z"/><g><path fill="%23394240" d="M60,48l-8-4.57c0-4.027,0-8.047,0-11.43c0-12-8-24-20-32C20,8,12,20,12,32c0,3.383,0,7.402,0,11.43L4,48 c-2.426,1.27-4,2.977-4,5.188V60c0,2.211,1.789,4,4,4h56c2.211,0,4-1.789,4-4v-6.812C64,50.977,62.125,49.375,60,48z M56,56H8 v-1.07l12-6.855V32c0-7.496,4.492-15.586,12-21.992C39.508,16.414,44,24.504,44,32v16.074l11.824,6.754 c0.062,0.039,0.121,0.078,0.176,0.117V56z"/><circle fill="%23394240" cx="32" cy="28" r="4"/></g></g></svg>`);
  img.src = `data:image/svg+xml;charset=utf-8;base64, ${imgStr}`;
  return img;
}

export const cursorImg = (color: string) => {
  const img = new Image();
  const imgStr = window.btoa(`<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.2607 12.4008C19.3774 11.2626 20.4357 10.6935 20.7035 10.0084C20.9359 9.41393 20.8705 8.74423 20.5276 8.20587C20.1324 7.58551 18.984 7.23176 16.6872 6.52425L8.00612 3.85014C6.06819 3.25318 5.09923 2.95471 4.45846 3.19669C3.90068 3.40733 3.46597 3.85584 3.27285 4.41993C3.051 5.06794 3.3796 6.02711 4.03681 7.94545L6.94793 16.4429C7.75632 18.8025 8.16052 19.9824 8.80519 20.3574C9.36428 20.6826 10.0461 20.7174 10.6354 20.4507C11.3149 20.1432 11.837 19.0106 12.8813 16.7454L13.6528 15.0719C13.819 14.7113 13.9021 14.531 14.0159 14.3736C14.1168 14.2338 14.2354 14.1078 14.3686 13.9984C14.5188 13.8752 14.6936 13.7812 15.0433 13.5932L17.2607 12.4008Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
  img.src = `data:image/svg+xml;charset=utf-8;base64, ${imgStr}`;
  return img;
}

export const arrowImg = (color: string) => {
  const img = new Image();
  const imgStr = window.btoa(`<svg width="800px" height="800px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" stroke="#000OOO" stroke-width="3"><title>arrow-block-up-solid</title><g id="Layer_2" data-name="Layer 2"><g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="${color}"/></g><g id="Q3_icons" data-name="Q3 icons"><path d="M24,4a2.2,2.2,0,0,0-1.5.6L4.6,24.1A2,2,0,0,0,6,27.6H16.1V40a2,2,0,0,0,2,2H29.9a2,2,0,0,0,2-2V27.6H42a2,2,0,0,0,1.4-3.5L25.5,4.6A2.2,2.2,0,0,0,24,4Z"/></g></g></svg>`);
  img.src = `data:image/svg+xml;charset=utf-8;base64, ${imgStr}`;
  return img;
}