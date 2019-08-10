import React from 'react';
import styles from "./style.module.scss";

class Progress extends React.Component {
    static defaultProps = {
        buffered: [],  // 缓冲好的进度
        current: 0,  // 当前播放进度
    }

    render() {
        const {buffered, current } = this.props;
        console.log(buffered);
        return (
            <div className={styles.progress}>
                <div className={styles.track}/>
                {/* <div className={styles.buffer} style={{width: `${buffer}%`}}/> */}
                <div className={styles.all} style={{width: `${current}%`}}>
                    <div className={styles.ballWrapper}>
                        <div className={styles.ball} />
                    </div>
                </div>
            </div>
        )
    }
}

export default Progress;
