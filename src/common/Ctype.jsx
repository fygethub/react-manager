export default {
    type: {
        text: 2,
        img: 1,
    },
    movable: {
        move: 0,
        umMove: 1,
    },
    len: {
        small: 100,
        middle: 300,
        large: 750
    },
    background: {
        white: 0,
        transparent: 1,
    },
    default: {
        text: {
            text: '😁',
            align: 1,
            fontColor: '#000',
            fontFamily: '宋体',
            fontSize: 16,
            x: 0,
            y: 0,
        },
        img: {
            url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1505142403472&di=90bf32ecd992782f6214ff21d108cf12&imgtype=0&src=http%3A%2F%2Fimg.25pp.com%2Fuploadfile%2Fapp%2Ficon%2F20160913%2F1473727464582764.jpg',
            x: 0,
            y: 0,
        }
    },
    state: {
        on: 2,
        off: 1,
    },
    align: {
        left: 1,
        center: 2,
        right: 3,
    },
    italic: {
        normal: 0,
        italic: 1,
    },
    bold: {
        bold: 1,
        normal: 0,
    },
    nick: {
        type: '类型',
        movable: '可移动',
        w: '宽',
        h: '高',
        align: '对齐',
        background: '背景',
        text: '内容',
        fontColor: '颜色',
        fontSize: '字大小',
        fontFamily: '字体',
        x: 'x',
        y: 'y',
        bold: '加粗',
        italic: '倾斜',
        zIndex: '层级',
    }
};
