define(function (require, exports) {

    exports.socialInit = function () {
        // 点赞
        $(document).on('click', '.sns-attr .sns_like.undone', function (e) {
            if (!checkLogin()) return false;
            // 自身
            var _this = this;
            var item_id = $(this).attr("data-item_id");
            var type = $(this).attr("data-type");
            var data = {type: type, item_id: item_id};
            // 发送请求
            requestApi('/home/api/social/like', data, function (res) {
                if (res.result == 1) {
                    var count = parseInt($(_this).attr('data-count')) + 1;
                    setStatusAndCount('like', 'add', item_id, type, count);
                    StatusTip($(_this), '+1', true);
                }
            });

            e.stopImmediatePropagation();
        });

        // 取消赞
        $(document).on('click', '.sns-attr .sns_like.done', function (e) {
            if (!checkLogin()) return false;

            var _this = this;
            var item_id = $(this).attr("data-item_id");
            var type = $(this).attr("data-type");
            var data = {type: type, item_id: item_id};

            // 发送请求
            requestApi('/home/api/social/like', data, function (res) {
                if (res.result == 1) {
                    var count = parseInt($(_this).attr('data-count')) - 1;
                    setStatusAndCount('like', 'cancel', item_id, type, count);
                    StatusTip($(_this), '-1', false);
                }
            });

            e.stopImmediatePropagation();
        });


        // 收藏
        $(document).on('click', '.sns-attr .sns_favorite.undone', function (e) {
            if (!checkLogin()) return false;

            var _this = this;
            var item_id = $(this).attr("data-item_id");
            var type = $(this).attr("data-type");
            var data = {type: type, item_id: item_id};

            // 发送请求
            requestApi('/home/api/social/collect', data, function (res) {
                if (res.result == 1) {
                    var count = parseInt($(_this).attr('data-count')) + 1;
                    setStatusAndCount('favorite', 'add', item_id, type, count);
                    StatusTip($(_this), '+1', true);
                }
            });

            e.stopImmediatePropagation();
        });


        // 取消收藏
        $(document).on('click', '.sns-attr .sns_favorite.done', function (e) {
            if (!checkLogin()) return false;

            var _this = this;
            var item_id = $(this).attr("data-item_id");
            var type = $(this).attr("data-type");
            var data = {type: type, item_id: item_id};

            // 发送请求
            requestApi('/home/api/social/collect', data, function (res) {
                if (res.result == 1) {
                    var count = parseInt($(_this).attr('data-count')) - 1;

                    setStatusAndCount('favorite', 'cancel', item_id, type, count);
                    StatusTip($(_this), '-1', false);
                }
            });

            e.stopImmediatePropagation();
        });
        //收藏或取消收藏2
        $(document).on('click', '.collect', function (e) {
            if (!checkLogin()) return false;
            var type = $(this).attr('data-type');
            var id = $(this).attr('data-id');
            // 发送请求
            requestApi('/home/api/social/collect', {item_id: id, type: type}, function (res) {
                if (res.result == 1) {
                    if ($(this).hasClass("active")) {
                        $(this).addClass("active");
                    } else {
                        $(this).removeClass("active");
                    }
                }
            }, true, true);

            e.stopImmediatePropagation();

        });
    };

    // 设置数量和状态
    function setStatusAndCount(social_type, status, item_id, type, count) {

        var title = [];
        title['like_add'] = '取消赞';
        title['like_cancel'] = '赞';
        title['favorite_add'] = '取消收藏';
        title['favorite_cancel'] = '收藏';

        var item_type_id = type + '-' + item_id;
        var obj = $('.sns-attr .sns_' + social_type + '[data-item_type_id="' + item_type_id + '"]');

        // 设置基本属性
        obj.attr('title', title[social_type + '_' + status])
            .attr('data-count', count)
            .find('.count').html(count);

        // 设置样式
        if (status == "add") {
            obj.addClass('done').removeClass('undone');
        } else {
            obj.addClass('undone').removeClass('done');

        }
    }

    function StatusTip(__this, text, isPlus) {
        if (isPlus) {
            var label = "<label class='tip_tip' style='position:absolute;width:0;font-size:15px;top: -45px;'>" + text + "</label>";
            __this.append(label);
            //   __this.find('i').animate({'fontSize': '20px'}, 500);
            $('.tip_tip').animate({'width': '20px', 'left': '0px', 'top': '-20px', 'opacity': '0.5', 'fontSize': '10px'}, 500);

            setTimeout(function () {
                //  __this.find('i').animate({'fontSize': '16px'}, 100);
                $('.tip_tip').animate({'width': '0px'}, 100).remove();
            }, 500);
        } else {
            var label = "<label class='tip_tip' style='position:absolute;width:0;font-size:15px;top: 0;'>" + text + "</label>";
            __this.append(label);
            // __this.find('i').animate({'fontSize': '20px'}, 500);
            $('.tip_tip').animate({'width': '20px', 'left': '0px', top: '-45px', 'opacity': '0.5', 'fontSize': '10px'}, 500);

            setTimeout(function () {
                //  __this.find('i').animate({'fontSize': '16px'}, 100);
                $('.tip_tip').animate({'width': '0'}, 100).remove();
            }, 500);
        }

    }

});