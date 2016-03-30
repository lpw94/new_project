window.checkField = function (elem, msg, regx) {
    var val = $(elem).val();

    if ($(elem).val() == '') {
        tip.showTip('err', msg, 3000);
        $(elem).focus();
        return false;
    } else {
        if (regx) {
            if (!new RegExp(regx).test(val)) {
                tip.showTip('err', msg, 3000);
                $(elem).focus();
                return false;
            }
        }
    }

    return true;
};

/**
 * Implements JSON stringify and parse functions
 * v1.0
 *
 * By Craig Buckler, Optimalworks.net
 *
 * As featured on SitePoint.com
 * Please use as you wish at your own risk.
 *
 * Usage:
 *
 * // serialize a JavaScript object to a JSON string
 * var str = JSON.stringify(object);
 *
 * // de-serialize a JSON string to a JavaScript object
 * var obj = JSON.parse(str);
 */

var JSON = JSON || {};

// implement JSON.stringify serialization
JSON.stringify = JSON.stringify || function (obj) {

        var t = typeof (obj);
        if (t != "object" || obj === null) {

            // simple data type
            if (t == "string") obj = '"' + obj + '"';
            return String(obj);

        }
        else {

            // recurse array or object
            var n, v, json = [], arr = (obj && obj.constructor == Array);

            for (n in obj) {
                v = obj[n];
                t = typeof(v);

                if (t == "string") v = '"' + v + '"';
                else if (t == "object" && v !== null) v = JSON.stringify(v);

                json.push((arr ? "" : '"' + n + '":') + String(v));
            }

            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    };


// implement JSON.parse de-serialization
JSON.parse = JSON.parse || function (str) {
        if (str === "") str = '""';
        eval("var p=" + str + ";");
        return p;
    };

(function ($) {
    // tab切换
    $.fn.switchTab = function (opts) {
        var $el = this;
        var options = {
            wrap: '.tabs',
            tab: '.switch-tab',
            pane: '.pane',
            callback: ''
        };
        if (typeof opts == 'object') {
            options = $.extend(options, opts);
        }
        var wrap = options.wrap;
        var tab = options.tab;
        var pane = options.pane;
        var callback = options.callback;
        // tab switch
        $el.find(wrap).on('click', tab, function (e) {
            var data_tab = $(this).attr('data-tab');
            $el.find(tab).removeClass('active');
            $el.find(tab + '[data-tab="' + data_tab + '"]').addClass('active');
            $el.find(pane).hide().removeClass('active');
            $el.find(pane + '[data-tab="' + data_tab + '"]').fadeIn().addClass('active');
            // callback
            if (typeof callback == "function") {
                callback(data_tab, tab);
            }
            e.stopImmediatePropagation();
        });
        return $el;
    };

    /*!
     * jQuery Plugin: Are-You-Sure (Dirty Form Detection)
     * https://github.com/codedance/jquery.AreYouSure/
     *
     * Copyright (c) 2012-2014, Chris Dance and PaperCut Software http://www.papercut.com/
     * Dual licensed under the MIT or GPL Version 2 licenses.
     * http://jquery.org/license
     *
     * Author:  chris.dance@papercut.com
     * Version: 1.9.0
     * Date:    13th August 2014
     */
    $.fn.areYouSure = function (options) {

        var settings = $.extend(
            {
                'message': '您确认要离开此页面吗?',
                'dirtyClass': 'dirty',
                'change': null,
                'silent': false,
                'addRemoveFieldsMarksDirty': false,
                'fieldEvents': 'change keyup propertychange input',
                'fieldSelector': ":input:not(input[type=submit]):not(input[type=button])"
            }, options);

        var getValue = function ($field) {
            if ($field.hasClass('ays-ignore')
                || $field.hasClass('aysIgnore')
                || $field.attr('data-ays-ignore')
                || $field.attr('name') === undefined) {
                return null;
            }

            if ($field.is(':disabled')) {
                return 'ays-disabled';
            }

            var val;
            var type = $field.attr('type');
            if ($field.is('select')) {
                type = 'select';
            }

            switch (type) {
                case 'checkbox':
                case 'radio':
                    val = $field.is(':checked');
                    break;
                case 'select':
                    val = '';
                    $field.find('option').each(function (o) {
                        var $option = $(this);
                        if ($option.is(':selected')) {
                            val += $option.val();
                        }
                    });
                    break;
                default:
                    val = $field.val();
            }

            return val;
        };

        var storeOrigValue = function ($field) {
            $field.data('ays-orig', getValue($field));
        };

        var checkForm = function (evt) {

            var isFieldDirty = function ($field) {
                var origValue = $field.data('ays-orig');
                if (undefined === origValue) {
                    return false;
                }
                return (getValue($field) != origValue);
            };

            var $form = ($(this).is('form'))
                ? $(this)
                : $(this).parents('form');

            // Test on the target first as it's the most likely to be dirty
            if (isFieldDirty($(evt.target))) {
                setDirtyStatus($form, true);
                return;
            }

            $fields = $form.find(settings.fieldSelector);

            if (settings.addRemoveFieldsMarksDirty) {
                // Check if field count has changed
                var origCount = $form.data("ays-orig-field-count");
                if (origCount != $fields.length) {
                    setDirtyStatus($form, true);
                    return;
                }
            }

            // Brute force - check each field
            var isDirty = false;
            $fields.each(function () {
                $field = $(this);
                if (isFieldDirty($field)) {
                    isDirty = true;
                    return false; // break
                }
            });

            setDirtyStatus($form, isDirty);
        };

        var initForm = function ($form) {
            var fields = $form.find(settings.fieldSelector);
            $(fields).each(function () {
                storeOrigValue($(this));
            });
            $(fields).unbind(settings.fieldEvents, checkForm);
            $(fields).bind(settings.fieldEvents, checkForm);
            $form.data("ays-orig-field-count", $(fields).length);
            setDirtyStatus($form, false);
        };

        var setDirtyStatus = function ($form, isDirty) {
            var changed = isDirty != $form.hasClass(settings.dirtyClass);
            $form.toggleClass(settings.dirtyClass, isDirty);

            // Fire change event if required
            if (changed) {
                if (settings.change) settings.change.call($form, $form);

                if (isDirty) $form.trigger('dirty.areYouSure', [$form]);
                if (!isDirty) $form.trigger('clean.areYouSure', [$form]);
                $form.trigger('change.areYouSure', [$form]);
            }
        };

        var rescan = function () {
            var $form = $(this);
            var fields = $form.find(settings.fieldSelector);
            $(fields).each(function () {
                var $field = $(this);
                if (!$field.data('ays-orig')) {
                    storeOrigValue($field);
                    $field.bind(settings.fieldEvents, checkForm);
                }
            });
            // Check for changes while we're here
            $form.trigger('checkform.areYouSure');
        };

        var reinitialize = function () {
            initForm($(this));
        }

        if (!settings.silent && !window.aysUnloadSet) {
            window.aysUnloadSet = true;
            $(window).bind('beforeunload', function () {
                $dirtyForms = $("form").filter('.' + settings.dirtyClass);
                if ($dirtyForms.length == 0) {
                    return;
                }
                // Prevent multiple prompts - seen on Chrome and IE
                if (navigator.userAgent.toLowerCase().match(/msie|chrome/)) {
                    if (window.aysHasPrompted) {
                        return;
                    }
                    window.aysHasPrompted = true;
                    window.setTimeout(function () {
                        window.aysHasPrompted = false;
                    }, 900);
                }
                return settings.message;
            });
        }

        return this.each(function (elem) {
            if (!$(this).is('form')) {
                return;
            }
            var $form = $(this);

            $form.submit(function () {
                $form.removeClass(settings.dirtyClass);
            });
            $form.bind('reset', function () {
                setDirtyStatus($form, false);
            });
            // Add a custom events
            $form.bind('rescan.areYouSure', rescan);
            $form.bind('reinitialize.areYouSure', reinitialize);
            $form.bind('checkform.areYouSure', checkForm);
            initForm($form);
        });
    };
})(jQuery);

$(function () {
    // 底部时间
    (function startTime() {
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();
        m = checkTime(m);
        s = checkTime(s);
        $('.clock').html(h + ":" + m + ":" + s);
        var t = setTimeout(function () {
            startTime()
        }, 500);

        function checkTime(i) {
            if (i < 10) {
                i = "0" + i
            }
            // add zero in front of numbers < 10
            return i;
        }
    })();

    // 美化
    $('.form input:checkbox').icheck();
    $('.form input:radio').icheck();

    // 左侧菜单
    $(".side-menu").on('click', '.top-menu', function (e) {
        if ($(this).siblings('.sub-menu').hasClass('active')) {
            $(this).find('.arrow-icon').removeClass('icon-unfold').addClass('icon-right');
            $(this).siblings('.sub-menu').removeClass('active').hide();
        } else {
            $(this).find('.arrow-icon').removeClass('icon-right').addClass('icon-unfold');
            $(this).siblings('.sub-menu').addClass('active').fadeIn();
        }
        e.stopImmediatePropagation();
    });
    // qtip
    window.call_qtip = function (elem) {
        $(elem).qtip({
            content: {
                text: function (api) {
                    return $(this).attr('data-tooltip');
                }
            },
            position: {
                my: 'bottom center',
                at: 'top center',
                adjust: {
                    y: -5
                }
            }
        });
    };

    // data-tooltip
    call_qtip('[data-tooltip]');

});