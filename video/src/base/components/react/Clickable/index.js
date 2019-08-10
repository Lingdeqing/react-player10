import React from "react";
import classnames from "classnames";
// import $ from "zepto";
import { isMobile } from "../../../utils/ua";
import styles from "./style.module.scss";

export default class Clickable extends React.Component {
    $el = null;
    $mask = null;
    touchStart = null;
    touchStartTime = 0;
    touchMove = false;

    handleClick = (e) => {
        // e.stopPropagation();
        // e.preventDefault();
        const { onTap } = this.props;
        onTap && onTap(e);
    }

    onTouchStart = (e) => {
        // 此处不能直接写成: this.touchStart = e.touches[0]。否则iOS9因为引用同一个对象会导致上下划不动。也不能直接解构，因为这就不是一个能解构的玩意！
        this.touchStart = { pageX: e.touches[0].pageX, pageY: e.touches[0].pageY };
        this.touchStartTime = Date.now();
        this.touchMove = false;

        const { onTouchStart } = this.props;
        onTouchStart && onTouchStart(e);
    }

    onTouchMove = (e) => {
        this.touchMove = true;

        const { onTouchMove } = this.props;
        onTouchMove && onTouchMove(e);
    }

    onTouchEnd = (e) => {
        if (!this.touchMove) {
            // this.useMask();
            this.handleClick(e);
        }

        const { onTouchEnd } = this.props;
        onTouchEnd && onTouchEnd(e);
    }

    useMask = () => {
        // if(!this.$mask){
        //     const $p = this.$el.parent();
        //     this.$mask = $('<div style="position:absolute;">');
        //     this.$el.before(this.$mask);
        //     if($p.css('position') === 'static'){
        //         $p.css('position', 'relative');
        //     }
        //     if(this.$el.css('position') === 'static'){
        //         this.$el.css('position', 'relative');
        //     }
        // }

        // const offset = this.$el.position();
        // this.$mask.css({
        //     left: offset.left,
        //     top: offset.top,
        //     width: this.$el.width(),
        //     height: this.$el.height(),
        // })
        // this.$mask.show();
    }

    getTagAttr = (keys) => {
        return Object.keys(this.props)
            .filter((key) => keys.indexOf(key) === -1)
            .reduce((attrs, key) => {
                attrs[key] = this.props[key];
                return attrs;
            }, {});
    }

    render() {
        const { children, className, tagName = 'div' } = this.props;
        const Tag = tagName;
        if (isMobile) {
            return (
                <Tag {...this.getTagAttr(["onTap", "onTouchStart", "onTouchMove", "onTouchend", "className"])}
                    className={classnames(styles.clickable, className)}
                    onTouchStart={this.onTouchStart}
                    onTouchMove={this.onTouchMove}
                    onTouchEnd={this.onTouchEnd}>
                    {children}
                </Tag>
            )
        }
        return (
            <Tag {...this.getTagAttr(["onTap", "className"])}
                className={classnames(styles.clickable, className)}
                onClick={this.handleClick}>
                {children}
            </Tag>
        )
    }
}

export function FastLink(props) {
    const { to, onTap, history } = props;
    const jump = () => {
        onTap && onTap();
        history.push(to);
    }
    return <Clickable onTap={jump} {...props} />
}
