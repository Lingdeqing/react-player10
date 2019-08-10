
export function supportH5Video() {
    const video = document.createElement('video');
    if (!!video.canPlayType) {
        const h264Test = video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
        return h264Test  === 'probably';
    }
    else {
        return false;
    }
}