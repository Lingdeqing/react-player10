import React from 'react';
import classnames from "classnames";
import enableInlineVideo from "iphone-inline-video";
import styles from "./style.module.scss";
import { exitFullscreen, onFullscreenChange } from "../../base/utils/fullscreen";
import {
    isIosApp, isApp, isAndroidApp
    // , isAndroidWx
} from "../../base/utils/ua";
import { supportH5Video } from "../../base/utils/video";
import { formatMinute } from "../../base/utils/time";
import Clickable from "../../base/components/react/Clickable";
import Progress from "../Progress";

class Video extends React.Component {
    el = null;  // 根节点
    video = null;   // 视频元素
    hasSlide = false;    // 是否滑动屏幕
    startSlide = false; // 是否开始滑动屏幕
    slideDir = null;    // 滑动方向
    touchStart = null;  // 触摸开始位置
    stateStart = null;  // 触摸开始时的状态
    touchtProgress = 0;    // 触摸设置的进度
    slideTarget = 'center';   // 滑动的节点 center: 屏幕 bottom: 底部
    static defaultProps = {
        src: 'https://video.youpin.mi-img.com/daren/7153936692c7a12b6d61c0a7e8ffc868.mp4',
        poster: 'https://s1.mi-img.com/mfsv2/avatar/s008/p01FwHWzbKPW/CkQnrN7fWymjO2.jpg',
        // src: '',
        // poster: '',
        onPlay: null
    }
    state = {
        fullscreen: false,  // 是否全屏
        fill: false,    // 是否充满屏幕
        occurError: false,
        isLoading: false,
        notStart: true, // 未开始播放视频
        playing: false, // 是否正在播放
        ended: false,   // 是否播放结束
        progress: 0,    // 播放进度
        buffered: [],   // 缓存的块
        videoMeta: {
            total: formatMinute(0),
            current: formatMinute(0)
        },
        hideControl: false,
        hidePoster: false,
        supportH5Video: supportH5Video(),
        suportFullscreen: true,
    }

    constructor(props) {
        super(props);
        this.handleAndroidBack();
    }

    componentDidMount() {
        // 视频初始化
        if (isIosApp) {
            // ios设置在行内
            enableInlineVideo(this.video);
        } else {
            // 视频初始化
            this.video.setAttribute('src', this.props.src);
        }

        // 获取视频时长
        this.video.addEventListener('loadedmetadata', () => {
            this.setState({
                videoMeta: {
                    ...this.state.videoMeta,
                    total: formatMinute(1000 * this.video.duration)
                }
            })
        });

        // 获取视频当前时间和播放进度
        this.video.addEventListener('timeupdate', () => {
            this.onTimeUpdate();

            // ios app 无法触发playing事件
            // if(isIosApp){
            //     this.hideLoading();
            // }
        });

        // 播放结束
        this.video.addEventListener('ended', this.onEnded)

        this.video.addEventListener('loadstart', () => {
            // alert(1);
        })

        this.video.addEventListener('error', () => {
            // alert(3);
        })

        this.video.addEventListener('progress', () => {
            this.setState({
                buffered: this.video.buffered
            })
        })

        // this.video.addEventListener('seeking', () => {
        //     this.setState({
        //         isLoading: true
        //     })
        // })

        // this.video.addEventListener('seeked', () => {
        //     this.setState({
        //         isLoading: false
        //     })
        // })

        if (!isIosApp) {
            this.video.addEventListener('waiting', this.showLoading);
            this.video.addEventListener('playing', this.hideLoading);
        }

        // 全屏初始化
        this.initZoom();
    }

    handleAndroidBack = () => {
        if (!isAndroidApp) return;
        // 视频全屏，安卓中点击返回键时，不返回上一个页面
        window.addEventListener('popstate', () => {
            if (this.state.fullscreen) {  // 全屏状态返回时 退出全屏
                this.setState({
                    fill: false,
                    fullscreen: false
                })
            }
        });
    }

    showLoading = () => {
        if (this.state.playing) {
            this.setState({
                isLoading: true
            })
        }
    }

    hideLoading = () => {
        if (this.state.playing) {
            this.setState({
                isLoading: false
            })
        }
    }

    onEnded = () => {
        this.setState({
            playing: false,
            ended: true,
            hideControl: false
        })
    }

    onTimeUpdate = () => {

        // 更新current
        this.setState({
            videoMeta: {
                ...this.state.videoMeta,
                current: formatMinute(this.video.currentTime * 1000)
            }
        })

        // 判断是否播放结束
        if (this.video.currentTime >= this.video.duration) {
            this.onEnded();
        }

        // let log = document.getElementById('log');
        // if (!log) {
        //     log = document.createElement('div');
        //     log.id = 'log'
        //     document.body.appendChild(log)
        // }
        // this.counter = this.counter ? this.counter + 1 : 1;
        // log.innerHTML = '进度' + this.counter + ', ' + formatMinute(this.video.currentTime * 1000)

        // 正在滑动时 不更新进度
        if (!this.hasSlide) {
            this.setState({
                progress: Math.min(100 * this.video.currentTime / this.video.duration, 100)
            })
        }
    }

    onClickVideo = () => {
        const { playing, hideControl } = this.state;
        if (!playing) {
            this.setState({
                hideControl: false
            })
        } else {
            this.setState({
                hideControl: !hideControl
            })
        }
    }

    onTouchStart = (e) => {
        if (this.state.notStart) return;
        this.hasSlide = false;
        this.startSlide = true;
        // 此处不能直接写成: this.touchStart = e.touches[0]。否则iOS9因为引用同一个对象会导致上下划不动。也不能直接解构，因为这就不是一个能解构的玩意！
        this.touchStart = { pageX: e.touches[0].pageX, pageY: e.touches[0].pageY };
        this.slideDir = null;
        this.stateStart = { ...this.state };
        this.touchtProgress = this.state.progress;
    }

    onTouchMove = (e) => {
        if (!this.startSlide) return;
        this.hasSlide = true;
        const touch = e.changedTouches[0];

        const deltaX = touch.pageX - this.touchStart.pageX;
        const deltaY = touch.pageY - this.touchStart.pageY;

        const onSlideLR = () => {
            // 防止与外部水平滑动事件冲突
            e.stopPropagation();
            e.preventDefault();

            // 调整进度条
            let percent = 0;    // 滑过的百分比
            if (this.slideTarget === 'center') {  // 屏幕中间滑动
                percent = 100 * deltaX / this.video.clientWidth;
            } else {    // 底部控制条滑动
                percent = 100 * deltaX / this.progress.clientWidth;
            }
            this.touchtProgress = this.stateStart.progress + percent;
            this.setState({
                progress: this.touchtProgress,
                hideControl: false
            })

        };

        if (this.slideDir || Math.abs(deltaY) > Math.abs(deltaX)) {
            // 垂直滑动
            if (this.slideDir === '-') {
                // 先水平滑再垂直滑,  就当是水平滑了
                onSlideLR();
            } else {
                this.slideDir = '|';
            }
        } else {
            // 水平滑动
            this.slideDir = '-';
            onSlideLR();
        }
    }

    onTouchEnd = (e) => {
        if (!this.hasSlide) return;

        if (this.slideDir === '-') {
            // 水平方向滑动
            let current = this.video.duration * this.touchtProgress / 100;
            current = current < 0 ? 0 : (current > this.video.duration ? this.video.duration : current);
            this.video.currentTime = current;

            // timeupdate事件会有延迟，手动触发，提前刷新界面
            this.onTimeUpdate();

            if (this.state.playing) {
                // ios app 可能会停住
                if (isIosApp) {
                    // ios app 可能会停住
                    if (this.video.paused) {
                        this.video.play();
                    }
                    // ios app 无法触发waiting事件 需要手动显示加载中
                    // this.showLoading();
                }
                this.setState({
                    // hideControl: this.stateStart.hideControl
                    hideControl: false
                })
            }
        }

        // reset
        this.hasSlide = false;
        this.startSlide = false;
        this.touchStart = null;
        this.slideDir = null;
        this.stateStart = null;
    }

    onDragStart = (e) => {
        this.slideTarget = 'bottom';
        this.onTouchStart(e);
    }
    onDrag = (e) => {
        this.onTouchMove(e);
    }
    onDragEnd = (e) => {
        this.onTouchEnd(e);
        this.slideTarget = 'center';
    }

    play = (e) => {
        if (this.state.hideControl) return;
        e.stopPropagation();
        e.preventDefault();

        this.setState({
            notStart: false,
            playing: true,
            ended: false,
            hideControl: true,
            hidePoster: true
        });
        this.video.play();
        this.props.onPlay && this.props.onPlay({
            src: this.props.src,
            video: this.video
        });

        // ios app 无法触发waiting事件 需要手动显示加载中
        // if(isIosApp){
        //     this.showLoading();
        // }
    }

    onStop = (e) => {
        if (this.state.hideControl) return;
        e.stopPropagation();
        e.preventDefault();
        this.stop();
    }

    stop = () => {
        this.setState({
            playing: false,
            hideControl: false
        });
        this.video.pause();
    }

    onZoomChange = () => {
        this.setState({
            fullscreen: !this.state.fullscreen
        })
    }
    initZoom = () => {
        if (!isApp) { // app外
            var fullscreenWrapper = this.el.requestFullscreen || this.el.webkitRequestFullscreen || this.el.webkitEnterFullscreen;
            var fullscreenVideo = this.video.requestFullscreen || this.video.webkitRequestFullscreen || this.video.webkitEnterFullscreen;
            if (!fullscreenWrapper && !fullscreenVideo) {   // 无法全屏
                this.setState({
                    suportFullscreen: false
                });
            } else {
                onFullscreenChange(this.onZoomChange);
            }
        }
    }
    toggleFullscreen = () => {
        if (this.state.fullscreen) {
            this.setState({
                fill: false,
            })
            // 安卓退出一个历史记录
            if (isAndroidApp) {
                window.history.back();
            }
        } else {
            this.setState({
                fill: true
            })
            // 安卓推入一个历史记录
            if (isAndroidApp) {
                window.history.pushState(null, null, window.location.href);
            }
        }
        this.onZoomChange();
    }
    handleZoom = () => {
        if (this.state.hideControl) return;
        if (isApp) {    // app内直接充满屏幕
            this.toggleFullscreen();
        } else {    // app外
            if (this.state.fullscreen) {
                exitFullscreen();
            } else {
                const fullscreenWrapper = this.el.requestFullscreen || this.el.webkitRequestFullscreen || this.el.webkitEnterFullscreen;
                const fullscreenVideo = this.video.requestFullscreen || this.video.webkitRequestFullscreen || this.video.webkitEnterFullscreen;
                if (fullscreenWrapper) {
                    fullscreenWrapper.call(this.el);
                } else if (fullscreenVideo) {
                    fullscreenVideo.call(this.video);
                }

            }
        }
    }


    render() {
        const { src, poster } = this.props;
        const { hidePoster, supportH5Video, fullscreen, fill } = this.state;
        const notSupport = <div className={styles.notSupport}>
            系统不支持h5视频播放
        </div>;
        let video = <video
            ref={r => this.video = r}
            controls={false}
            preload="auto"
            autoPlay={false}
            webkit-playsinline="true"
            playsInline={true}
            x-webkit-airplay="allow"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="true"
            x5-video-orientation="portraint"
            data-src={src}
        >
            {notSupport}
        </video>
        if (isIosApp) {
            // src 未设置显示传入undefined，从而设置一个没有src的video防止出现src=""的情形，这种情况iosApp会出现一个默认的错误的播放器样式
            video = <video ref={r => this.video = r} playsinline src={src || undefined}>{notSupport}</video>;
        }
        // https://juejin.im/entry/5a50effb6fb9a01c9e45c787
        // if(isAndroidWx){
        //     video = <video ref={r => this.video = r} controls={false} preload x5-video-player-type="h5-page" loop="loop"></video>
        // }
        return (
            <Clickable
                className={classnames(styles.video, { [styles.fullscreen]: fullscreen, [styles.fill]: fill })}
                data-role="article-video"
                onTap={this.onClickVideo}
                onTouchStart={this.onTouchStart}
                onTouchMove={this.onTouchMove}
                onTouchEnd={this.onTouchEnd}
                getEl={r => this.el = r}
            >
                {this.renderStyle()}
                {
                    !supportH5Video ? notSupport : (
                        <>
                            <div className={styles.videoWrapper}>
                                {video}
                            </div>
                            {
                                !hidePoster &&
                                <div className={styles.posterWrapper}>
                                    <img
                                        src={poster}
                                        onError={e => e.target.parentNode.removeChild(e.target)}
                                        alt="" />
                                </div>
                            }
                            {/* 加个遮罩 是因为ios app点击视频 点击事件无法冒泡到根节点 */}
                            <div className={styles.mask}>
                                {this.renderCenter()}
                            </div>
                            {
                                this.renderBottom()
                            }
                        </>
                    )
                }
            </Clickable>
        )
    }

    renderStyle() {
        const {fullscreen} = this.state;
        if (!isIosApp || !fullscreen) return null;
        return <style>{
            `*{
                -webkit-overflow-scrolling: ${fullscreen ? 'auto' : 'touch'} !important;
            }
            `
        }</style>
    }

    renderCenter() {
        const { ended, playing, occurError, isLoading, hideControl } = this.state;
        if (occurError) {
            return <div className={styles.error}>加载失败，请点击重试</div>;
        }

        if (isLoading) {
            return <div className={styles.loading}></div>;
        }

        if (ended) {
            return <Clickable className={classnames(styles.replay, { [styles.hide]: hideControl })} onTap={this.play} />;
        }

        if (playing) {
            return <Clickable className={classnames(styles.stop, { [styles.hide]: hideControl })} onTap={this.onStop} />;
        } else {
            return <Clickable className={classnames(styles.play, { [styles.hide]: hideControl })} onTap={this.play} />;
        }
    }

    renderBottom() {
        const { videoMeta, progress, buffered, hideControl, notStart, suportFullscreen } = this.state;
        return (
            <div className={styles.bottomWrapper}
                onTouchStart={e => e.stopPropagation()}
                onTouchMove={e => e.stopPropagation()}
                onTouchEnd={e => e.stopPropagation()}>
                <div className={classnames(styles.bottom, { [styles.hide]: hideControl, [styles.notStart]: notStart })}>
                    <div className={styles.currentTime}>{videoMeta.current}</div>
                    <Progress
                        buffered={buffered}
                        current={progress}
                        onDragStart={this.onDragStart}
                        onDrag={this.onDrag}
                        onDragEnd={this.onDragEnd}
                        progressRef={r => this.progress = r}
                        className={styles.progress}
                    />
                    <div className={styles.totalTime}>{videoMeta.total}</div>
                    {
                        suportFullscreen &&
                        <Clickable className={styles.zoomBtn} onTap={this.handleZoom} >
                            <div className={styles.zoomIcon} />
                        </Clickable>
                    }
                </div>
            </div>
        );
    }
}

export default Video;
