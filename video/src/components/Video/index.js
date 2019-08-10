import React from 'react';
import classnames from "classnames";
import enableInlineVideo from "iphone-inline-video";
import styles from "./style.module.scss";
import { iOS } from "../../base/utils/ua";
import { supportH5Video } from "../../base/utils/video";
import { formatMinute } from "../../base/utils/time";
import Clickable from "../../base/components/react/Clickable";
import Progress from "../Progress";

class Video extends React.Component {
    el = null;
    static defaultProps = {
        src: 'https://video.youpin.mi-img.com/daren/7153936692c7a12b6d61c0a7e8ffc868.mp4',
        poster: 'https://s1.mi-img.com/mfsv2/avatar/s008/p01FwHWzbKPW/CkQnrN7fWymjO2.jpg',
        editor: false,
    }
    state = {
        occurError: false,
        isLoading: false,
        playing: false,
        progress: 0,    // 播放进度
        buffered: [],   // 缓存的块
        videoMeta: {
            total: formatMinute(0),
            current: formatMinute(0)
        },
        hideControl: false,
        supportH5Video: supportH5Video()
    }

    componentDidMount() {
        // 视频初始化
        if (iOS) {
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
            const progress = Math.min(100 * this.video.currentTime / this.video.duration, 100);
            this.setState({
                progress,
                videoMeta: {
                    ...this.state.videoMeta,
                    current: formatMinute(this.video.currentTime * 1000)
                }
            })
        });

        this.video.addEventListener('loadstart', () => {
            // alert(1);
        })

        this.video.addEventListener('loadeddata', () => {
            // alert(2);
        })

        this.video.addEventListener('error', () => {
            // alert(3);
        })

        this.video.addEventListener('progress', () => {
            this.setState({
                buffered: this.video.buffered
            })
        })
        // .on('ended', function () {
        //     self.setStatus('ended');
        // }).on('play', function () {
        //     self.setStatus('playing');
        // }).on('pause', function () {
        //     self.setStatus('stopped');
        // }).on('timeupdate', function () {
        //     self.updateProgress();
        // })
    }

    onClickVideo = () => {
        const {playing, hideControl} = this.state;
        if(!playing){
            this.setState({
                hideControl: false
            })
        } else {
            this.setState({
                hideControl: !hideControl
            })
        }
    }

    play = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({
            playing: true,
            hideControl: true
        });
        this.video.play();
    }

    stop = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({
            playing: false,
            hideControl: false
        });
        this.video.pause();
    }


    render() {
        const { src, poster, maxWidth } = this.props;
        const { hideControl, supportH5Video } = this.state;
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
        if (iOS) {
            // src 未设置显示传入undefined，从而设置一个没有src的video防止出现src=""的情形，这种情况iosApp会出现一个默认的错误的播放器样式
            video = <video ref={r => this.video = r} playsinline src={src || undefined}>{notSupport}</video>;
        }
        return (
            <Clickable
                className={styles.video}
                data-zoom="inline"
                data-status="not-start"
                data-role="article-video"
                onTap={this.onClickVideo}>
                {
                    !supportH5Video ? notSupport : (
                        <>
                            <div className={styles.videoWrapper}>
                                {video}
                            </div>
                            {/* <div className={styles.posterWrapper}>
                                <img
                                    src={poster}
                                    onError={e => e.target.parentNode.removeChild(e.target)}
                                    alt="" />
                            </div> */}
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

    renderCenter() {
        const { playing, occurError, isLoading, hideControl } = this.state;
        if (occurError) {
            return <div className={styles.error}>加载失败，请点击重试</div>;
        }

        if (isLoading) {
            return <div className={styles.loading}></div>;
        }

        if(hideControl){
            return null;
        }

        if (playing) {
            return <Clickable className={styles.stop} onTap={this.stop} />;
        } else {
            return <Clickable className={styles.play} onTap={this.play} />;
        }
    }

    renderBottom() {
        const { videoMeta, progress, buffered, hideControl } = this.state;
        return (
            <div className={styles.bottomWrapper}>
                <div className={classnames(styles.bottom, { [styles.hide]: hideControl })}>
                    <div className={styles.currentTime}>{videoMeta.current}</div>
                    <Progress buffered={buffered} current={progress} />
                    <div className={styles.totalTime}>{videoMeta.total}</div>
                    <div className={styles.zoomBtn}></div>
                </div>
            </div>
        );
    }
}

export default Video;
