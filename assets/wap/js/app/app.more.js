/**
 *  加载更多
 * created ykuang 2015-10-30
 */
define(function (require, exports) {
    var base = require("app.base");
    require("jquery/jquery.more.js");
    require("jquery/jquery.lazyload.js");

    var spinner_code = "<li style='text-align:center; margin:10px;'><img src='/assets/home/images/loader.gif' />  数据加载中...</li>";
    var Item_Wrap_Elem = "#dataWrap";
    var Item_Elem = '.item';
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

    function chooseCity() {
        // 八大城市选择
        $('.mMenu').on('click', '.city', function (e) {
                var city_id = $(this).attr('data-id');
                var obj = $('.department[data-city="' + city_id + '"]');
                var len = obj.find('.department_id').length;
                if (len == 0) {
                    requestApi('/home/api/area/getDepartment', {city_id: city_id}, function (res) {
                        if (res.result == 1) {
                            console.log(res.data);
                            var str = '<dd class="department_id choose" data-type="department_id" data-city_id="' + city_id + '" data-id="0"><a href="javascript:;">不限</a></dd>';
                            for (var i = 0; i < res.data.length; i++) {
                                var item = res.data[i];
                                str += '<dd class="department_id choose" data-type="department_id" data-id="' + item['id'] + '"><a href="javascript:;" >' + item.name + '</a></dd>';
                            }
                            obj.html(str);
                        }
                    });
                }

                $('.department').hide();
                obj.fadeIn();
                $('.country').removeClass('on');
                $('.country[data-id="' + city_id + '"]').addClass('on');

                e.stopImmediatePropagation();
            })
            // 省市选择
            .on('click', '.province', function (e) {
                var province_id = $(this).attr('data-id');
                var obj = $('.city[data-province="' + province_id + '"]');
                var len = obj.find('.city_id').length;
                if (len == 0) {
                    requestApi('/home/api/area/getCities', {province_id: province_id}, function (res) {
                        if (res.result == 1) {
                            var str = '<dd class="city_id choose" data-type="city_id" data-province_id="' + province_id + '" data-id="0"><a href="javascript:;">不限</a></dd>';
                            for (var i = 0; i < res.data.length; i++) {
                                var item = res.data[i];
                                str += '<dd class="city_id choose" data-type="city_id" data-id="' + item['id'] + '"><a href="javascript:;" >' + item.short_name + '</a></dd>';
                            }
                            obj.html(str);
                        }
                    });
                }

                $('.city').hide();
                obj.fadeIn();
                $('.country').removeClass('on');
                $('.country[data-id="' + province_id + '"]').addClass('on');

                e.stopImmediatePropagation();
            });
    }

    function filterUI() {
        chooseCity();

        //筛选下拉菜单
        var tmp_city = '';
        var tmp_str = '';
        $('.mMenu').on('click', '.items', function (e) {
            $('.filter-list').hide();

            var type = $(this).attr('data-type');
            var _dom = $('ul[data-type="' + type + '"]');
            if ($(this).hasClass('on')) {
                $(this).removeClass('on');
                _dom.hide();
            } else {
                _dom.fadeIn();
                $(this).addClass('on').siblings('.items').removeClass('on');
                // 选择中心
                if (type == 'department_id') {
                    var city_id = $('.mMenu input[name="city_id"]').val();
                    if (city_id != 0 && tmp_city != city_id) {
                        tmp_str = '<li class="choose" data-type="department_id" data-city_id="' + city_id + '" data-id="0">该城市暂无服务中心</li>';
                        requestApi('/home/api/area/getDepartment', {city_id: city_id}, function (res) {
                            if (res.result == 1) {
                                if (res.data.length > 0) {
                                    tmp_str = '<li class="choose" data-type="department_id" data-city_id="' + city_id + '" data-id="0"><a href="javascript:;">不限</a><span class="right"><i class="icon icon-check"></i></span></li>';
                                }
                                for (var i = 0; i < res.data.length; i++) {
                                    var item = res.data[i];
                                    tmp_str += '<li class="choose" data-type="department_id" data-id="' + item['id'] + '"><a href="javascript:;" >' + item.name + '</a><span class="right"><i class="icon icon-check"></i></span></li>';
                                }
                                $('.filter-department').html(tmp_str);
                            }
                        });
                        tmp_city = city_id;
                    } else {
                        //$('.filter-department').html(tmp_str);
                    }
                }
            }
            //$('.filter-list[data-type="' + type + '"]').show();
            e.stopImmediatePropagation();
        });

        // 点击选中情况
        $('.filter-list').on('click', '.choose', function (e) {
            var id = $(this).attr('data-id');
            var type = $(this).attr('data-type');

            // 选择不限中心
            if (type == 'department_id' && id == 0) {
                $('.mMenu input.filter[name="city_id"]').val($(this).attr('data-city_id')).change();
            }

            // 选择不限城市
            if (type == 'city_id' && id == 0) {
                $('.mMenu input.filter[name="province_id"]').val($(this).attr('data-province_id')).change();
            }

            $(this).addClass('active');
            $(this).siblings('.choose').removeClass('active');
            $('.mMenu .items[data-type="' + type + '"]').trigger('click');
            $('.mMenu input.filter[name="' + type + '"]').val(id).change();
            e.stopImmediatePropagation();
        });

        $(document).on('click', '.searchBtn', function (e) {
            $('.searchForm').fadeIn();
            $(this).hide();
            e.stopImmediatePropagation();
        });

        $(document).on('click', '.cancelBtn', function (e) {
            $('.searchForm').hide();
            $('.searchBtn').fadeIn();
            e.stopImmediatePropagation();
        });

    }

    exports.more = function (url, params) {
        var last_key = '';
        var last_change = ''; //

        // 过滤
        filterUI();
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
        $('.mMenu').on('change', '.filter', function (e) {
            getList();
            last_change = 'filter';

            e.stopImmediatePropagation();
        });

        var options = {"key": ""};

        // 获取列表
        function getList() {
            // 过滤选项
            $('.filter').each(function () {
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
        $(Item_Wrap_Elem).html(" <li class='topic-item item'></li><li href='javascript:;' class='get_more'></li>");
        var fresh = new Fresh();
        fresh.more(url, params);
    }
});