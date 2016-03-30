/**
 <article class="comment" id="ProductComment"
 data-comment-list="product-462">
 <div class="reply-form fst-reply-form" style="">
 <p class="reply-txt">
 <textarea name="" class="reply-area"
 data-comment-content="product-462"
 placeholder="我也说两句"
 ></textarea>
 </p>

 <p class="reply-tool">
 <input type="submit" value="提交" class="btn btn-orange  btn-comment"
 data-item="462"
 data-type="product"
 >
 </p>

 <div class="clear"></div>
 </div>
 <section class="fst-box"></section>
 <div class="pagination" data-total="0"></div>
 </article>

 seajs.use("app/app.comment.js", function (api) {
    api.initialize();
 });

 */
define(function (require, exports) {
    var site_url = app.site_url;
    require('/assets/home/js/jquery/jquery.pagination');
    var base = require('app.base');

    // 设置分页
    exports.CommentPagination = function (item_id, type, target, limit) {
        limit = isNaN(parseInt(limit)) ? 8 : parseInt(limit);
        var total = $(".pagination").attr('data-total');
        // 创建分页
        $('.pagination').pagination(Math.ceil(total / limit), {
            num_edge_entries: 1, //边缘页数
            num_display_entries: 8, //主体页数
            items_per_page: 1, //每页显示1项
            link_to: 'javascript:;',
            prev_text: '上一页',
            next_text: '下一页',
            callback: function (page_index) {
                getList(item_id, type, target, page_index, limit);
            }
        });
    };
    /*ykuang*/
    exports.initComment = function () {

        exports.initialize();
        var type = $(".comment_box").attr('data-type');
        var item = $(".comment_box").attr('data-item');
        var showTarget = $('.comment[data-comment-list="' + type + '-' + item + '"]');
        var target = showTarget.find('.fst-box');
        getList(item, type, target, 0, 10);
        exports.CommentPagination(item, type, target);

    };
    //初始化控件，绑定各种事件
    exports.initialize = function (page_postion) {
        // 侧边栏 page_postion = 'aside'
        window.page_postion = page_postion;

        //获取评论列表事件
        $('.comment_box').on('click', '.list-comment', function (e) {
            var type = $(this).attr('data-type');
            var item = $(this).attr('data-item');
            var show = $(this).attr('data-show');
            var showTarget = $('.comment[data-comment-list="' + type + '-' + item + '"]');
            if (show == 1) {
                $(this).removeClass('current');
                showTarget.hide();
                $(this).attr('data-show', 0);
            } else {
                $(this).addClass('current');
                showTarget.fadeIn();
                $(this).attr('data-show', 1);
                var target = showTarget.find('.fst-box');
                var cType = $(this).attr('data-type');
                var fetched = $(this).attr('data-fetched');
                if (!fetched) {
                    getList(cType, item, target);
                }
                $(this).attr('data-fetched', 1);
            }
            e.stopImmediatePropagation();
        }).on('click', '.reply-btn', function (e) {
            //点击回复评论按钮事件
            $(".comment .sec-reply-form").hide();
            var id = $(this).attr('data-comment');
            var toUser = $(this).attr('data-to-nick');
            var toUid = $(this).attr('data-to-uid');
            var obj = $('.sec-reply-form[data-comment="' + id + '"]');
            var title = '回复 ' + toUser + ' : ';
            // 隐藏所有
            setReplyForm(obj, title, toUid, toUser);
            e.stopImmediatePropagation();
        }).on('click', '.btn-comment', function (e) {
            //发布评论事件
            if (!checkLogin()) return false;
            exports.postComment(this, e);
            e.stopImmediatePropagation();
        }).on('click', '.btn-reply', function (e) {
            //回复评论事件
            if (!checkLogin()) return false;
            exports.reply(this, e);
            e.stopImmediatePropagation();
        }).on('click', '.del-comment-btn', function (e) {
            //删除评论
            if (!checkLogin()) return false;
            var _obj = this;
            if (!confirm('您确定要删除此评论?')) return false;
            exports.delComment(_obj, e);
            e.stopImmediatePropagation();
        }).on('click', '.del-reply-btn', function (e) {
            //删除回复
            if (!checkLogin()) return false;
            var _obj = this;
            if (!confirm('您确定要删除此回复?')) return false;
            exports.delReply(_obj, e);
            e.stopImmediatePropagation();
        }).on('focus', '.fst-reply-form', function (e) {
            //评论输入框和回复输入框的样式改变
            $(this).parents().find('.sec-reply-form').hide();
            e.stopImmediatePropagation();
        }).on('blur', '.sec-reply-form', function (e) {
            e.stopImmediatePropagation();
            var content = $(this).find('.reply-area').val();
            if (!content) {
                $(this).hide();
            }
        });

    };

    function getList(item_id, type, target, page, limit) {
        var data = {
            item_id: item_id,
            type: type,
            page: page,
            limit: limit
        };
        requestApi('/home/api/comment/list', data, function (res) {
            if (res.result == 1) {
                var str = '';
                for (var i in res.data.list) {
                    var item = res.data.list[i];
                    var replyContent = '';
                    for (var j in item.reply_content) {
                        var row = item.reply_content[j];
                        console.log(row);

                        replyContent += renderReplyHtml(row.comment_id, row.id, row.to_user_name, row.to_user_id, row.user_name, row.user_avatar, row.content, row.time,row.user_id);
                    }
                    str += renderCommentHtml(item.id, item.user_id, item.user_name, item.user_avatar, item.content, item.time, replyContent, item.type, item);
                }
                target.html(str);
            }
        });
    };

    exports.postComment = function (btn, e) {
        var type = $(btn).attr('data-type');
        var item = $(btn).attr('data-item');
        var content = $('[data-comment-content="' + type + '-' + item + '"]').val();
        if (!content) {
            tip.showTip('err', "请说点什么吧", 3000);
            return;
        }
        var data = {
            type: type,
            item_id: item,
            content: content
        };
        var obj = $('.comment[data-comment-list="' + type + '-' + item + '"]').find('.fst-box');
        requestApi('/home/api/comment/add', data, function (res) {
            if (res.result == 1) {
                tip.showTip('ok', '评论成功', 2000);

                var row = res.data;
                var str = renderCommentHtml(row.id, row.user_id, row.user_name, row.user_avatar, row.content, "刚刚", '', row.type, item);
                obj.prepend(str);
                $(".reply-area").val("");
            }
        });

        e.stopImmediatePropagation();
    };

    exports.delComment = function (target, e) {
        var comment = $(target).attr('data-comment');
        var parentObj = $(target).parents('.sec-box[data-comment="' + comment + '"]');

        var type = $(target).attr('data-type');
        var item = $(target).attr('data-item');
        var data = {
            'comment_id': comment
        };
        requestApi('/home/api/comment/del', data, function (res) {
            if (res.result == 1) {
                tip.showTip('ok', '评论删除成功', 2000);
                hideRemoveDom(parentObj);
            }
        });

        e.stopImmediatePropagation();
    };

    exports.reply = function (target, e) {
        var comment = $(target).attr('data-comment');
        var toUid = $(target).attr('data-to-uid');
        var content = $('textarea[data-reply-content="' + comment + '"]').val();
        $('textarea[data-reply-content="' + comment + '"]').val('');

        var data = {
            comment_id: comment,
            to_user_id: toUid,
            from_user_id: app._uid,
            content: content
        };
        requestApi('/home/api/comment/reply', data, function (res) {
            if (res.result == 1) {
                tip.showTip('ok', '回复成功', 2000);
                var row = res.data;
                var str = renderReplyHtml(row.comment_id, row.id, row.to_user_name, row.to_user_id, row.user_name, row.user_avatar, row.content, "刚刚",row.user_id);
                $('.sec-reply[data-reply-list="' + comment + '"]').append(str);
                $('.sec-reply-form[data-comment="' + comment + '"]').hide();
            }
        });
        //e.stopImmediatePropagation();
    };

    exports.delReply = function (target, sortKey) {
        var replyId = $(target).attr('data-replyId');
        var parentObj = $(target).parents('.thr-box[data-replyId="' + replyId + '"]');
        var index = $('.del-reply-btn[data-replyId="' + replyId + '"]').index(target);
        var data = {};
        data = {
            'reply_id': replyId
        };

        requestApi('/home/api/comment/delReply', data, function (res) {
            if (res.result == 1) {
                tip.showTip('ok', '删除回复成功', 2000);
                hideRemoveDom(parentObj);
            }
        });
    };

    function setReplyForm(obj, title, toUid, toUser) {
        $(obj).find('textarea[data-reply-content]').attr('placeholder', title);
        $(obj).find('.btn-reply').attr('data-to-nick', toUser);
        $(obj).find('.btn-reply').attr('data-to-uid', toUid);
        $(obj).show().find('.reply-area').focus();
    }

    function hideRemoveDom(obj) {
        obj.fadeOut();
        setTimeout(function () {
            $(obj).remove();
        }, 1000)
    }

    function renderReplyHtml(commentId, replyId, toUNick, toUid, nick, avatar, content, time,fromUid) {
        //console.log(fromUid);
        var str = '<section class="thr-box" data-comment="' + commentId + '" data-replyId="' + replyId + '">';
        str += '<div class="avatar"><img src="' + avatar + '" alt=""/></div>';
        str += '<section class="thr-comments" data-comment="' + commentId + '">';
        str += '<p class="say01">';
        str += '    <a href="' + '/user/info/' + fromUid + '.html">' + nick + '</a>回复<a href="' + '/user/info/' + toUid + '.html">' + toUNick + '</a> :'    ;
        str += '</p>';
        str += '<p class="say">'+ content +'</p>';
        str += '<p>';
        str += '<span class="post-time">' + time + '</span> ';
        if (app._uid > 0 && toUid == app._uid) {
            str += '<a href="javascript:;" class="del-reply-btn" data-comment="' + commentId + '" data-replyId="' + replyId + '">删除</a> ';
        }
        str += '<a href="javascript:;" data-comment="' + commentId + '" class="reply-btn" data-to-uid="' + toUid + '" data-to-nick="' + nick + '">回复</a> ';
        str += '</p>';
        str += '</section>';
        str += '<div class="clear"></div>';
        str += '</section>';
        return str;
    }

    function renderCommentHtml(commentId, uid, nick, avatar, content, time, replyContent, type, item) {
        var str = '<section class="sec-box" data-comment="' + commentId + '">';
        str += '<div class="avatar"><img src="' + avatar + '" alt=""/></div>';
        str += '<article class="sec-comments" data-comment="' + commentId + '">';
        str += '<section class="sec-content">';
        str += '<p class="say02">';
        str += '    <a href="' + '/user/info/' + uid + '.html">' + nick + '</a> ' ;
        str += '</p>';
        str += '<p class="say">'+ content +'</p>';
        str += '<p>';
        str += '<span class="post-time">' + time + '</span> ';
        if (app._uid > 0 && uid == app._uid) {
            str += '<a href="javascript:;" class="del-comment-btn" data-comment="' + commentId + '" data-type="' + type + '" data-item="' + item + '">删除</a> ';
        }
        str += '<a href="javascript:;" class="reply-btn" data-comment="' + commentId + '" data-to-nick="' + nick + '" data-to-uid="' + uid + '">回复</a> ';
        str += '</p>';
        str += '</section>';
        str += '<article class="sec-reply" data-reply-list="' + commentId + '">' + replyContent + '</article>';
        str += '<div class="sec-reply-form reply-form" data-comment="' + commentId + '" style="display: none;">';
        str += '<p class="reply-txt"><textarea name="" class="reply-area" data-reply-content="' + commentId + '"  placeholder="我也说两句"></textarea></p>';
        str += '<p class="reply-tool"><input type="submit" value="回复" class="btn btn-small btn-warning btn-reply" data-to-uid="' + uid + '" data-to-nick="' + nick + '" data-comment="' + commentId + '"/></p>';
        str += '</div>';
        str += '</article>';
        str += '<div class="clear"></div>';
        str += '</section>';
        return str;
    }

});