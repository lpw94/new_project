(function ($) {
    var target = null;
    var template = null;
    var lock = false;
    window.inAjaxProcess = false;
    var variables = {
        'last': 1,
        'page': 1,
        'pre_page': 0
    };
    var settings = {
        'amount': '10',
        'address': 'comments.php',
        'params': "",
        'format': 'json',
        'template': '.single_item',
        'trigger': '.get_more',
        'scroll': 'false',
        'offset': '100',
        'spinner_code': ''
    };

    var methods = {

        init: function (options) {
            variables.last = variables.page = 1;
            return this.each(function () {

                if (options) {
                    $.extend(settings, options);
                }
                template = $(this).children(settings.template).wrap('<div/>').parent();
                template.css('display', 'none');
                $(this).append('<div class="more_loader_spinner">' + settings.spinner_code + '</div>')
                $(this).children(settings.template).remove();
                target = $(this);
                if (settings.scroll == 'false') {
                    $(this).find(settings.trigger).bind('click.more', methods.get_data);
                    $(this).more('get_data');
                }
                else {
                    if ($(this).height() <= $(this).attr('scrollHeight')) {
                        target.more('get_data', settings.amount * 2);
                    }
                    $(this).bind('scroll.more', methods.check_scroll);
                }
            })
        },
        check_scroll: function () {
            if ((target.scrollTop() + target.height() + parseInt(settings.offset)) >= target.attr('scrollHeight') && lock == false) {
                target.more('get_data');
            }
        },
        debug: function () {
            var debug_string = '';
            $.each(variables, function (k, v) {
                debug_string += k + ' : ' + v + '\n';
            });
            alert(debug_string);
        },
        remove: function () {
            target.children(settings.trigger).unbind('.more');
            target.unbind('.more');
            target.children(settings.trigger).remove();
        },
        add_elements: function (data) {
            //alert('adding elements')

            var root = target;
            //   alert(root.attr('id'))
            var counter = 0;
            if (data) {
                $(".data_count").html(data['data']['count']);
                if ($.trim(settings.params.key).length > 0) {
                    $('.search_result').show().find('.search_key').html(settings.params.key);
                } else {
                    $('.search_result').hide().find('.search_key').html('');
                }

                if (data['data']['count'] == 0 && variables.page == 1) {
                    root.children(settings.trigger).before('<li class="noData">暂无数据</li>');
                }

                $(data['data']['data_list']).each(function () {
                    counter++;
                    var t = template;
                    $.each(this, function (key, value) {
                        t.html(value);
                    });
                    //t.attr('id', 'more_element_'+ (variables.last++))
                    if (settings.scroll == 'true') {
                        //    root.append(t.html())
                        root.children('.more_loader_spinner').before(t.html())
                    } else {
                        //    alert('...')

                        root.children(settings.trigger).before(t.html())

                    }

                    root.children(settings.template + ':last').attr('id', 'more_element_' + ((variables.last++) + 1))

                });
                variables.page++;

            }
            else  methods.remove();
            target.children('.more_loader_spinner').css('display', 'none');
            if (counter < settings.amount) methods.remove()

        },
        get_data: function () {

            var ile;
            lock = true;
            target.children(".more_loader_spinner").css('display', 'block');

            $(settings.trigger).css('display', 'none');
            if (typeof(arguments[0]) == 'number') ile = arguments[0];
            else {
                ile = settings.amount;
            }

            setTimeout(function () {
                var params;
                if (settings.params == '') {
                    params = {
                        page: variables.page,
                        limit: ile
                    }
                } else {
                    params = settings.params;
                    params['page'] = variables.page;
                    params['limit'] = settings.amount;
                    variables.pre_page = variables.page;
                }
                /* window.requestApi(settings.address, params, function (data) {
                 $(settings.trigger).css('display', 'block');
                 methods.add_elements(data);
                 lock = false;
                 $("img").lazyload({effect: "fadeIn"});
                 });*/
                $.ajax({
                    url: settings.address,
                    data: params,
                    type: 'post',
                    async: true,
                    dataType: settings.format,
                    success: function (res_data) {
                        //console.log("res");
                        //console.log(res_data);
                        $(settings.trigger).css('display', 'block');
                        methods.add_elements(res_data);
                        $("img").lazyload({effect: "fadeIn"});
                        baguetteBox.run('.gallery');
                    },
                    error: function () {

                    },
                    beforeSend: function () {
                        if (window.inAjaxProcess) {
                            return false;
                        }
                        // 正在处理状态
                        window.inAjaxProcess = true;
                    },
                    complete: function () {
                        window.inAjaxProcess = false;
                    }
                })
            }, 200);

            // }

        }
    };
    $.fn.more = function (method) {
        if (methods[method])
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        else if (typeof method == 'object' || !method)
            return methods.init.apply(this, arguments);
        else $.error('Method ' + method + ' does not exist!');

    }
})(jQuery);