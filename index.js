import React, { Component } from "react";
import PropTypes from "prop-types";
import "./init.css";

const getVideoComponent = config =>
    class Video extends Component {
        static propTypes: Object = {
            block: PropTypes.object,
            contentState: PropTypes.object
        };

        state: Object = {
            hovered: false
        };
        toggleHovered: Function = (): void => {
            const hovered = !this.state.hovered;
            this.setState({
                hovered
            });
        };
        render(): Object {
            const { block, contentState } = this.props;
            const entity = contentState.getEntity(block.getEntityAt(0));
            const props = entity.getData();

            return (
                <span
                    onMouseEnter={this.toggleHovered}
                    onMouseLeave={this.toggleHovered}
                    className={"rdw-video-alignment"}
                >
                    <span className="rdw-video-vidoewrapper">
                        <Renderer {...props} />
                    </span>
                </span>
            );
        }
    };

export function Renderer({src, poster}){
    return (
        <div className="rag rag-video" data-role="article-video">
            <video 
                // controls
                preload="auto"
                // autoPlay={true}
                webkit-playsinline="true"
                playsInline={true}
                x-webkit-airplay="allow"
                x5-video-player-type="h5"
                x5-video-player-fullscreen="true"
                x5-video-orientation="portraint"
                data-src={src}
                >
                <p className='rag-video-not-support'>
                    系统不支持h5视频播放
                </p>
            </video>
            {/* <img className="rag-video-poster" src={"https://shop.io.mi-img.com/app/shop/img?id=shop_78fd392088b1567ac8f42c02173787b6.png&w=800&h=1000"} onError={e=>e.target.parentNode.removeChild(e.target)}/> */}
            <div className="rag-video-state play">
                <div className="rag-video-loading">加载中</div>
                <div className="rag-video-play-btn">
                    <div className="rag-video-play-icon"></div>
                </div>
                <div className="rag-video-error">加载失败，请刷新重试</div>
            </div>
            <div className="rag-video-controls">
                <div className="rag-video-play-btn">
                    <div className="rag-video-play-icon"></div>
                    <div className="rag-video-stop-icon"></div>
                </div>
                <div className="rag-video-current">00:00</div>
                <div className="rag-video-progress">
                    <div className="rag-video-progress-track"/>
                    <div className="rag-video-progress-buffer"/>
                    <div className="rag-video-progress-all">
                        <div className="rag-video-progress-ball-wrapper">
                            <div className="rag-video-progress-ball"/>
                        </div>
                    </div>
                </div>
                <div className="rag-video-total">00:00</div>
                <div className="rag-video-fullscreen">全屏</div>
            </div>
        </div>
    )
}

export default getVideoComponent;
