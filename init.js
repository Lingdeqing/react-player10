import { $, ua } from "youpin-lib10";
import "./init.css";

function formatMinute(ms){
    let s = Math.ceil(ms / 1000);
    let h = Math.floor(s / 60 / 60);
    let m = Math.floor((s - h * 60 * 60 ) / 60);
    s = Math.floor(s - h * 60 * 60 - m * 60);
    h = h <= 0 ? '' : `${h}:`;
    m = m < 10 ? `0${m}:`: `${m}:`;
    s = s < 10 ? `0${s}` : s;
    return h + m + s;
}

export function init(){
    $(function(){
        $('[data-role="article-video"]').each(function(){
            var $wrapper = $(this),
                wrapper = this,
                $state = $wrapper.find('.rag-video-state'),
                $play = $state.find('.rag-video-play-btn'),
                $control = $wrapper.find('.rag-video-controls'),
                $play2 = $control.find('.rag-video-play-btn'),
                $current = $control.find('.rag-video-current'),
                $progress = $control.find('.rag-video-progress'),
                $all = $control.find('.rag-video-progress-all'),
                $ball = $control.find('.rag-video-progress-ball-wrapper'),
                $buffer = $control.find('.rag-video-progress-buffer'),
                $total = $control.find('.rag-video-total'),
                $current = $control.find('.rag-video-current'),
                $fullscreen = $control.find('.rag-video-fullscreen'),
                $video = $wrapper.find('video'),
                video = $video[0],
                timer = null;
            
            var isPlaying = false, controlVisible = true;

            // 初始化总时间
            // $video.on('canplay', function(){

            // })
            // $video.on('loadstart', function(){

            // })
            $video.on('loadedmetadata', function(){
                console.log(video.duration)
                $total.html(formatMinute(1000*video.duration));
            })
            $video.attr('src', $video.data('src'));

            $play.on('click', play);
            $play2.on('click', play);
            $wrapper.on('click', showControl);
            $video.on('ended', function(){
                clearTimeout(timer);
                isPlaying = false;
                $state.addClass('play');
                $play2.removeClass('playing');
                $control.animate({
                    translateY: '0%'
                })
            })
            $video.on('progress', function(){
                drawBuffer();
            })

            function showControl(){
                if(isPlaying && !controlVisible){
                    $control.animate({
                        translateY: '0%'
                    })
                    hideControl();
                }
            }

            var isHideControl = false;
            function hideControl(){
                clearTimeout(timer);
                timer = setTimeout(function(){
                    controlVisible = false;
                    isHideControl = true;
                    $control.animate({
                        translateY: '100%'
                    }, function(){
                        isHideControl = false;
                    })
                }, 2000);
            }

            function play(e){
                if(isHideControl) return;
                clearTimeout(timer);
                e.stopPropagation();
                if(!isPlaying){
                    // 显示加载中
                    // 加载视频

                    // 播放成功 切换dom
                    $video[0].play();
                    isPlaying = true;
                    $state.removeClass('play');
                    $play2.addClass('playing');
                    hideControl();
                    drawProgress();
                } else {
                    $video[0].pause();
                    isPlaying = false;
                    $state.addClass('play');
                    $play2.removeClass('playing');
                }
            }

            // 绘制进度条和当前时刻
            var currentStr = '00:00';
            var progress = 0;
            function drawProgress(){
                var newCurrentStr = formatMinute(video.currentTime*1000);
                if(newCurrentStr !== currentStr){
                    $current.html(newCurrentStr);
                    currentStr = newCurrentStr;
                }
                progress = Math.min(100* video.currentTime / video.duration, 100);
                $all.width(progress + '%');
                
                if(isPlaying && !isDrag){
                    if(requestAnimationFrame){
                        requestAnimationFrame(drawProgress);
                    } else {
                        setTimeout(drawProgress, 20)
                    }
                }
            }

            // 绘制缓存
            drawBuffer();
            function drawBuffer(){
                var buffered = video.buffered;
                var last = 0;
                if(buffered.length > 0){
                    last = buffered.end(buffered.length - 1);
                }
                $buffer.width(Math.min(100, 100 * last / video.duration) + '%');
            }

            function setCurrent(offset){
                var newCurrent = Math.max(0, video.duration*offset/trackWidth);
                video.currentTime = Math.min(newCurrent, video.duration);
                drawProgress();
                drawBuffer();
            }
            // 点击快进和快退
            var trackWidth = $progress.width(), trackLeft = $progress.offset().left;
            $progress.on('click', function(e){
                setCurrent(e.pageX - trackLeft);
            })
            // 拖拽快进快退
            var touchStart = 0, isDrag = false, allStartWidth = 0;
            $ball.on('touchstart', function(e){
                clearTimeout(timer);
                isDrag = true;
                touchStart = e.touches[0].pageX;
                allStartWidth = $all.width();
            })
            document.addEventListener('touchmove', function(e){
                if(!isDrag) return;
                var touch = e.changedTouches[0];
                var deltaX = touch.pageX - touchStart;

                e.stopPropagation();
                e.preventDefault();
                
                var width = Math.min(Math.max(0, allStartWidth+deltaX), trackWidth);
                $all.width(width);
            }, {passive: false});
            $(document).on('touchend', function(){
                if(isDrag){
                    if(isPlaying){
                        hideControl();
                    }
                    touchStart = 0;
                    isDrag = false;
                    setCurrent($all.width());
                }
            })

            // 全屏
            // 如果是ios非app中
            // 其他使用原生全屏
            var fullscreenWrapper = wrapper.requestFullscreen || wrapper.webkitRequestFullscreen || wrapper.webkitEnterFullscreen;
            if(!fullscreenWrapper){
                var fullscreenVideo = video.requestFullscreen || video.webkitRequestFullscreen || video.webkitEnterFullscreen;
                if(!fullscreenVideo){
                    $fullscreen.remove();
                } else {
                    $fullscreen.on('click', function(){
                        fullscreenVideo.call(video);
                    })
                }
            } else {    // 模拟全屏
                var isFullScreen = false;
                if(ua.app){
                    $fullscreen.on('click', function(){
                        if(isFullScreen){
                            isFullScreen = false;
                            $fullscreen.html('全屏');
                            $wrapper.removeClass('fullscreen');
                        } else {
                            isFullScreen = true;
                            $fullscreen.html('退出')
                            $wrapper.addClass('fullscreen');
                        }
                    })
                } else {
                    $fullscreen.on('click', function(){
                        if(isFullScreen){
                            isFullScreen = false;
                            $fullscreen.html('全屏');
                            exitFullscreen();
                        } else {
                            isFullScreen = true;
                            $fullscreen.html('退出')
                            fullscreenWrapper.call(wrapper);
                        }
                    })
                }
            }

            function exitFullscreen() {
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
        })
    })
}

init();