function detect(win) {
  setTimeout(() => {
    if (win.nomui) {
      win.postMessage(
        {
          name: "NOM_DETECTOR",
          nomUIDetected: true,
        },
      );
    } else {
      win.postMessage(
        {
          name: "NOM_DETECTOR",
          nomUIDetected: false,
        },
      );
    }
  }, 100);
}

if (document instanceof HTMLDocument) {
  const script = document.createElement("script");
  script.textContent = ";(" + detect.toString() + ")(window)";
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
}
