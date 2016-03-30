/*
 * 	 自定义分享功能
 @author : yanue
 @site : http://yanue.net/
 @time : 2012.09.25

 使用方法：
 var shareParas = {
 'item_id': item_id,
 'type': "product",
 'elem': ".shareAll",//分享dom
 'pics': sharePic,//图片地址数组
 'title': obj.attr("data-title"),//分享标题
 'desc': '' //分享描述
 };
 seajs.use('app/app.share', function(share) {
 share.shareInit(shareParas);
 });
 */
define(function (require, exports) {
    var appShare = {}, options = {};

    appShare.share = {
        // 初始化
        'init': function (param) {
            options.title = "创客港  - " + (param.title || '创客港') + ' @创客港';
            options.desc = "创客港  - " + (param.desc || param.title || '创客港') + ' @创客港';
            options.url = param.url || location.href;
            options.pics = param.pics || [];
            options.comment = param.comment || '';
            options.iconbg = '/static/home/images/base/share.png';
            options.type = param.type;
            options.item_id = param.item_id;

            var htm = '<span class="share-btn"><em class="share_tip"></em>';
            htm += ' <a name="wbshare" class="share_icon" type="icon" id="wbshare" data-name="新浪微博" title="分享到新浪微博" href="javascript:;"></a>';
            htm += ' <a name="tqshare" class="share_icon" type="icon" id="tqshare" data-name="腾讯微博" title="分享到腾讯微博" href="javascript:;"></a>';
            htm += ' <a name="rrshare" class="share_icon" type="icon" id="rrshare" data-name="人人网" title="分享到人人网" href="javascript:;"></a>';
            htm += ' <a name="qqshare" class="share_icon" type="icon" id="qqshare" data-name="qq空间" title="分享到qq空间" href="javascript:;"></a>';
            // htm += ' <a name="dbshare" class="share_icon" type="icon" id="dbshare" data-name="豆瓣" title="分享到豆瓣" href="javascript:;"></a>';
            //	htm += ' <a name="kxshare" class="share_icon" type="icon" id="kxshare" title="分享到开心网" href="javascript:;"></a>';
            //htm += ' <a name="taoshare" class="share_icon" type="icon" id="taoshare" data-name="淘宝网"  title="分享到淘宝网" href="javascript:;"></a>';
            //	htm += ' <a name="bdshare" class="share_icon" type="icon" id="bdshare" title="分享到百度空间" href="javascript:;"></a>';
//            htm += ' <a name="t163share" class="share_icon" type="icon" id="t163share" title="分享到网易微博" href="javascript:;"></a>';
//            htm += ' <a name="shshare" class="share_icon" type="icon" id="shshare" title="分享到搜狐" href="javascript:;"></a>';
            htm += '</span>';
            // 加载分享css
            // 在页面中加入
            $(param.elem).html(htm);
            // 循环执行对应方法
            $(param.elem).on('click', 'a', function () {
                var obj = $(this).attr('name');
                var site = $(this).attr('data-name');

                // 添加数据统计
                if (false) {
                    requestApi('/api/favorite/share', {
                        'item_id': options.item_id,
                        "type": options.type,
                        site: site,
                        url: options.url,
                        title: options.title
                    });
                }

                eval("appShare.share." + obj + "()");// eval妙用啊
            });
        },


        // 新浪微博
        'wbshare': function (param) {
            var submitUrl = 'http://service.weibo.com/share/share.php';
            var wbShareparam = {
                url: options.url,
                type: '3',
                appkey: '207042031',
                title: options.desc,
                pic: options.pics[0],
                ralateUid: '@looklo',
                language: 'zh-cn',
                rnd: new Date().valueOf()
            };
            this._openUrl(wbShareparam, submitUrl);
            return false;
        },

        // 人人网
        /* 'rrshare': function (param) {
         var rrShareParam = {
         url: options.url, // 默认为header中的Referer,如果分享失败可以调整此值为resourceUrl试试
         title: options.title,
         content: options.desc,
         image_src: options.pics
         };
         var submitUrl = 'http://www.connect.renren.com/sharer.do';
         this._openUrl(rrShareParam, submitUrl);
         return false;
         },*/
        'rrshare': function (param) {
            var rrShareParam = {
                url: options.url, // 默认为header中的Referer,如果分享失败可以调整此值为resourceUrl试试
                title: options.title,
                content: options.desc,
                images: options.pics.join("|")
            };
            var submitUrl = 'http://widget.renren.com/dialog/share';
            this._openUrl(rrShareParam, submitUrl);
            return false;
        },

        // qq空间
        'qqshare': function (param) {
            var qqShareparam = {
                url: options.url,
                desc: options.desc,
                summary: '创客港 - 创客港', /* 分享摘要(可选) */
                title: options.title,
                site: '创客港', /* 分享来源 如：腾讯网(可选) */
                pics: options.pics ? options.pics[0] : '' /*qq空间只能分享一张,多了出错*/
            };
            var submitUrl = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey';
            this._openUrl(qqShareparam, submitUrl);
            return false;
        },

        // 腾讯微博
        'tqshare': function (param) {
            var tqShareparam = {
                c: 'share',
                a: 'index',
                url: options.url,
                desc: options.desc,
                title: options.title,
                site: '创客港', /* 分享来源 如：腾讯网(可选) */
                pic: options.pics[0], /* 分享图片的路径(可选) */
                appkey: '801242612'
            };
            var submitUrl = 'http://share.v.t.qq.com/index.php';
            this._openUrl(tqShareparam, submitUrl);
            return false;
        },

        // 淘宝
        'taoshare': function (param) {
            var tqShareparam = {
                url: location.href,
                desc: options.desc,
                title: options.title,
                site: '创客港', /* 分享来源 如：腾讯网(可选) */
                pics: options.pics, /* 分享图片的路径(可选) */
                appkey: '21180828'

            };
            var submitUrl = 'http://share.jianghu.taobao.com/share/addShare.htm';
            this._openUrl(tqShareparam, submitUrl);
            return false;
        },

        // 百度
        'bdshare': function (param) {
            var tqShareparam = {
                url: location.href,
                content: options.desc,
                title: options.title,
                linkid: 'yansueh',
                pics: options.pics, /* 分享图片的路径(可选) */
                appkey: ''
            };
            var submitUrl = 'http://hi.baidu.com/pub/show/share';
            this._openUrl(tqShareparam, submitUrl);
            return false;
        },

        // 豆瓣网
        'dbshare': function () {
            var tqShareparam = {
                href: options.url,
                desc: options.desc,
                name: options.title,
                linkid: 'looklo',
                image: options.pics[0],
                appkey: '0e1f49fc92bcafab2a5dddf5b8360f01'
            };
            var submitUrl = 'http://shuo.douban.com/!service/share';
            this._openUrl(tqShareparam, submitUrl);
            return false;
        },

        // 开心网
        'kxshare': function () {
            var shareparam = {
                url: options.url,
                content: options.desc,
                style: 11,
                time: new Date().valueOf(),
                sig: '',
                pic: options.pics
            };
            var submitUrl = 'http://www.kaixin001.com/rest/records.php';
            this._openUrl(shareparam, submitUrl);
            return false;
        },

        // 网易微博
        't163share': function () {
            var shareparam = {
                info: options.desc,
                source: options.url,
                images: options.pics
            };
            var submitUrl = 'http://t.163.com/article/user/checkLogin.do';
            this._openUrl(shareparam, submitUrl);
            return false;
        },

        // 搜狐微博
        'shshare': function () {
            var shareparam = {
                url: options.url,
                title: options.title,
                content: options.desc,
                pic: options.pics
            };
            var submitUrl = 'http://t.sohu.com/third/post.jsp';
            this._openUrl(shareparam, submitUrl);
            return false;
        },

        // 公用打开窗口
        '_openUrl': function (shareparam, submitUrl) {
            var temp = [];
            for (var p in shareparam) {
                temp
                    .push(p + '='
                        + encodeURIComponent(shareparam[p] || ''));
            }
            var url = submitUrl + "?" + temp.join('&');
            var wa = 'width=700,height=650,left=0,top=0,resizable=yes,scrollbars=1';

            window.open(url, 'zuoke', wa);

        }

        // end
    };

    exports.shareInit = function (param) {
        appShare.share.init(param);
    }
});