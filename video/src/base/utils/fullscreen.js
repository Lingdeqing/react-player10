export function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

export function onFullscreenChange(_handler){
    document.addEventListener('webkitfullscreenchange', _handler, false);
    document.addEventListener('mozfullscreenchange', _handler, false);
    document.addEventListener('fullscreenchange', _handler, false);
    document.addEventListener('MSFullscreenChange', _handler, false);
}