import React from 'react';
import classnames from "classnames";
import styles from "./style.module.scss";

class Progress extends React.Component {
    static defaultProps = {
        buffered: [],  // 缓冲好的进度
        current: 0,  // 当前播放进度
        onDragStart: null,
        onDrag: null,
        onDragEnd: null,
        progressRef: null, // 获取
        className: ''
    }

    render() {
        let {
            // buffered, 
            current,
            onDragStart,
            onDrag,
            onDragEnd,
            progressRef,
            className } = this.props;
        current = current < 0 ? 0 : current;
        current = current > 100 ? 100 : current;
        return (
            <div className={classnames(styles.progress, className)} ref={progressRef}>
                <div className={styles.track} />
                {/* <div className={styles.buffer} style={{width: `${buffer}%`}}/> */}
                <div className={styles.all} style={{ width: `${current}%` }}>
                    <div className={styles.ballWrapper}
                        onTouchStart={onDragStart}
                        onTouchMove={onDrag}
                        onTouchEnd={onDragEnd}
                    >
                        <div className={styles.ball} />
                    </div>
                </div>
            </div>
        )
    }
}

export default Progress;
