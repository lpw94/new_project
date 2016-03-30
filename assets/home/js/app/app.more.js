/**
 *  加载更多
 * created ykuang 2015-10-30
 */
define(function (require, exports) {
    require("/assets/home/js/jquery/jquery.min.js");
    require("/assets/home/js/jquery/jquery.more.js");
    require("/assets/home/js/jquery/jquery.lazyload.js");
    require("/assets/home/js/tools/baguetteBox.js");

    var spinner_code = "<div style='text-align:center; margin:10px;'><img src='/assets/home/images/loader.gif' />  数据加载中...</div>";
    var Item_Wrap_Elem = ".group_center01";
    var Item_Elem = '.topic-item';
    $("img").lazyload();
    function Fresh() {

    }

    Fresh.prototype = {
        more: function (url, params) {
            this.url = url;
            $(Item_Wrap_Elem).more(
                {
                    'address': url,
                    'params': params,
                    'spinner_code': spinner_code,
                    'template': Item_Elem
                }
            );
            $(window).scroll(function () {
                // alert($(Item_Elem).length);
                if ($(Item_Elem).length > 0) {
                    if ($(window).scrollTop() == $(document).height() - $(window).height()) {
                        $('.get_more').click();
                        //console.log(12)
                    }
                }
            });

        }
    };

    exports.more = function (url, params) {
        var last_key = '';
        var last_change = ''; //
        // 默认执行一次
        getList();


        // 搜索
        $('.searchForm').on('click', '.search-btn', function (e) {
            getList();
            last_change = 'search';
            e.stopImmediatePropagation();
        }).on('blur', '.key', function (e) {
            getList();
            last_change = 'search';

            e.stopImmediatePropagation();
        }).on('keydown', function (e) {
            // enter 键
            if (e.which == 13) {
                getList();
                last_change = 'search';
            }
            e.stopImmediatePropagation();
        });

        // 清除搜索
        $(document).on('click', '.search_clean', function (e) {
            $('.searchForm .key').val('');
            last_change = 'search';

            getList();
            e.stopImmediatePropagation();
        });

        // 左侧过滤
        $('.mfilters').on('change', '.filter', function (e) {
            getList();
            last_change = 'filter';

            e.stopImmediatePropagation();
        });

        var options = {"key": ""};

        // 获取列表
        function getList() {
            // 过滤选项
            $('.mfilters .filter').each(function () {
                var val = $(this).val();
                var opt = $(this).attr('name');
                var str = '{"' + opt + '":"' + val + '"}';
                options = $.extend(options, JSON.parse(str));
            });
            // 搜索关键字
            var key = $.trim($('.searchForm .key').val());
            // 搜索改变时
            if (last_key == key && last_change == 'search') {
                return;
            }
            last_key = key;
            var str = '{"key":"' + key + '"}';
            options = $.extend(options, JSON.parse(str));
            if (params) {
                options = $.extend(options, params);
            }
            // 重新加载
            exports.reload(url, options);
        }
    };

    // 重新过滤
    exports.reload = function (url, params) {
        $(Item_Wrap_Elem).html(" <div class='topic-item single_item'></div><a href='javascript:;' class='get_more'></a>");
        var fresh = new Fresh();
        fresh.more(url, params);
    }
});