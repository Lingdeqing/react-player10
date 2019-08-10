export function formatMinute(ms) {
    let s = Math.ceil(ms / 1000);
    let h = Math.floor(s / 60 / 60);
    let m = Math.floor((s - h * 60 * 60) / 60);
    s = Math.floor(s - h * 60 * 60 - m * 60);
    h = h <= 0 ? '' : `${h}:`;
    m = m < 10 ? `0${m}:` : `${m}:`;
    s = s < 10 ? `0${s}` : s;
    return h + m + s;
}