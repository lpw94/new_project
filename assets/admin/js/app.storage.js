/**
 * 文件管理器 file Storage manager
 * -- 浏览,上传,选择
 * -- 按月文件夹,视频，音频，文件，图片四种类型
 * -- 多选功能
 * -- 自定义popup实现方式

 * ====== usage ========================================

 *   -- 1. import view tpl
 默认已经在layout导入了

 *   -- 2. seajs.use
 seajs.use('app/panel/panel.storage', function (a) {
    a.getImg('#upSiteIcon', func, true);
    function func(res) {
        $('#site_icon').val(res.url);
        $('.preview-icon').attr('src', res.url);
    }
 });

 * @author yanue
 * @time 2014-05-13
 * @version 1.2
 */
define(function (require, exports) {
    require('/assets/admin/js/jquery/jquery.pagination.js');
    require('/assets/admin/js/tools/draggabilly.min.js');

    $(function () {
        new Draggabilly(document.querySelector('#storageWidget'), {handle: '#storageWidget .popup-head'});
    });

    var base = require('/assets/admin/js/app.base');//公共函数
    var upload = require('/assets/admin/js/app.upload');

    var callbacks = []; //所有回调
    var curBtn = null;// 当前按钮
    var tmpType = null; //记录上次打开的类型
    var curMulti = false; //记录上次打开的类型
    var tmpMultiFiles = [];//记录选择文件
    var tmpMultiFilesName = [];//记录选择文件
    var hasUploaded = false;

    /**
     * storage class
     *
     * @constructor
     */
    function Storage() {
        this.openFolder();
        this.confirm();

        // some
        $('#storageWidget').on('mouseenter', '.img.choose', function () {
            $(this).find('.info').show();
        }).on('mouseleave', '.img.choose', function () {
            $(this).find('.info').hide();
        });
    }

    Storage.allowType = {
        img: 'jpg|jpeg|gif|png|bmp|ico',
        video: 'mp4|3gp|ogg|webm|flv|f4v',
        audio: 'mp3|m4a|ogg|spx|oga',
        file: 'zip|rar|doc|xls|ppt|docx|pptx|xlsx|txt|ipa|apk'
    };

    Storage.typeName = {
        img: '图片',
        video: '视频',
        audio: '音频',
        file: '文件'
    };

    Storage.prototype = {

        /**
         * init
         * @param btn
         * @param type
         * @param multi
         */
        init: function (btn, type, multi) {
            var _this = this;

            $(document).on('click', btn, function (e) {
                // 重置窗口
                if (type != tmpType || curMulti != multi) {
                    _this.reset();
                }

                curMulti = multi;
                tmpType = type;
                curBtn = btn; //记录当前按钮

                base.showPop('#storagePopup');

                _this.getFolder();
                _this.initUpload();

                $('.dataArea .name').html('选择' + Storage.typeName[type] + '：');

                if (curMulti == true) {
                    $('#storageWidget #multi-file-url').show();
                    $('#storageWidget #file-url').hide();

                    var val = eval($('#multi-file-url-tmp').val());
                    var key = eval($('#multi-file-url-tmp').attr('data-key'));
                    var name = eval($('#multi-file-url-tmp').attr('data-name'));

                    for (var i in key) {
                        tmpMultiFiles[key[i]] = val[i];
                        tmpMultiFilesName[key[i]] = name[i];
                    }

                    // fileChoose
                    _this.multiFileChoose();
                    _this.rmMultiSelected();
                } else {
                    $('#storageWidget #file-url').show();
                    $('#storageWidget #multi-file-url').hide();

                    // fileChoose
                    _this.fileChoose();
                }

                e.stopPropagation();
            });
        },

        /**
         * init upload
         *
         * @returns {Storage}
         */
        initUpload: function () {
            var _this = this;
            $('.uploadArea .prevImg').hide();

            $('.uploadArea .upload-widget').attr('data-unique', tmpType);
            if (curMulti) {
                upload.upload('.uploadArea .upload-widget', {
                    'type': tmpType,
                    'multi_selection': true
                }, function (res) {
                    if (tmpType == 'img') {
                        $('.uploadArea .prevImg').attr('src', res.url).show();
                    }
                    if (tmpType == 'video') {
                        $('.uploadArea .prevImg').attr('src', _this.getVideoCover(res.url)).show();
                    }
                    hasUploaded = true;
                    _this.saveMulti(res.url, res.id, res.name);
                });
            } else {
                upload.upload('.uploadArea .upload-widget', {
                    'type': tmpType
                }, function (res) {
                    if (tmpType == 'img') {
                        $('.uploadArea .prevImg').attr('src', res.url).show();
                    }
                    if (tmpType == 'video') {
                        $('.uploadArea .prevImg').attr('src', _this.getVideoCover(res.url)).show();
                    }
                    hasUploaded = true;
                    $('#file-url').val(res.url);
                });
            }
            return this;
        },


        /**
         * get all folder
         *
         * @returns {Storage}
         */
        getFolder: function () {
            var _this = this;

            function getFolderApi() {
                // get folder
                base.requestApi('/admin/api/storage/getFolder', {'u': app.u}, function (res) {
                    if (res.result == 1) {
                        base.showTip('ok', '获取成功！', 1000);

                        var group = res.data;

                        var img_num = (res.data.count.img_num) ? (res.data.count.img_num) : 0;
                        var video_num = (res.data.count.video_num) ? (res.data.count.video_num) : 0;
                        var audio_num = (res.data.count.audio_num) ? (res.data.count.audio_num) : 0;
                        var file_num = (res.data.count.file_num) ? (res.data.count.file_num) : 0;

                        $('#storageWidget .tabs').find('.count[data-type="img"]').text(img_num);
                        $('#storageWidget .tabs').find('.count[data-type="video"]').text(video_num);
                        $('#storageWidget .tabs').find('.count[data-type="audio"]').text(audio_num);
                        $('#storageWidget .tabs').find('.count[data-type="file"]').text(file_num);

                        $('#storage-img .storage-folder').html(_this.assignFolder(group.folder.img, 'img'));
                        $('#storage-video .storage-folder').html(_this.assignFolder(group.folder.video, 'video'));
                        $('#storage-audio .storage-folder').html(_this.assignFolder(group.folder.audio, 'audio'));
                        $('#storage-file .storage-folder').html(_this.assignFolder(group.folder.file, 'file'));

                        // 隐藏
                        $('#storageWidget .tabs .tab').hide()
                        $('#storageWidget .tabs .tab[data-type="' + tmpType + '"]').show();
                        $('#storageWidget .tabs .tab[data-type="upload"]').show();
                    }
                });
            }

            // tabs click
            $('#storageWidget .tabs .tab a').click(function () {
                var type = $(this).parent().attr('data-type');
                $('#storageWidget .tabs .tab').removeClass('active');
                $(this).parent().addClass('active');

                if (hasUploaded) {
                    getFolderApi();
                    hasUploaded = false;
                }
                $("#storageWidget .tab-pane").hide();
                $('#storageWidget #storage-' + type).show().find('.storage-folder').show();
                $('#storageWidget #storage-' + type).find('.storage-files').hide();
                $('#storageWidget #storage-' + type).find('.storage-head .count').html('').hide();
            });

            getFolderApi();
            return this;
        },

        /**
         * confirm choosed file
         */
        confirm: function () {
            $('#storageWidget').on('click', '.confirmUrlBtn', function (e) {
                var arg = {};
                if (curMulti == true) {
                    var files = $('#storageWidget #multi-file-url').val();
                    var filename = $('#storageWidget #multi-file-url-tmp').attr("data-name");
                    var key = $('#storageWidget #multi-file-url-tmp').attr("data-key");

                    // 验证
                    if (!files) {
                        $('.dataArea .res-err-tip').addClass('brown').text('！' + Storage.typeName[tmpType] + '请选择文件或上传');
                        return false;
                    } else {
                        $('.dataArea .res-err-tip').removeClass('brown').text('(请选择上传或已有' + Storage.typeName[tmpType] + ')');
                    }

                    // return data
                    arg = {'url': files.split('\n'), 'name': JSON.parse(filename), 'key': JSON.parse(key)};
                } else {

                    var name = $('#storageWidget #file-url').attr('data-name');
                    var url = $('#storageWidget #file-url').val();
                    var size = $('#storageWidget #file-url').attr('data-size');
                    // 验证
                    if (!url) {
                        $('.dataArea .res-err-tip').addClass('brown').text('！' + Storage.typeName[tmpType] + '地址不能空');
                        return false;
                    } else {
                        $('.dataArea .res-err-tip').removeClass('brown').text('(请选择上传或已有' + Storage.typeName[tmpType] + ')');
                    }

                    var pattern = eval('/\\.(' + Storage.allowType[tmpType] + ')$/i');
                    var reg = new RegExp(pattern);

                    if (!reg.test(url)) {
                        $('.dataArea .res-err-tip').addClass('brown').text('！仅支持' + Storage.allowType[tmpType]);
                        return false;
                    } else {
                        $('.dataArea .res-err-tip').removeClass('brown').text('(请选择上传或已有' + Storage.typeName[tmpType] + ')');
                    }

                    // return data
                    arg = {'url': url, 'name': name, 'size': size};
                }

//                $("#storageWidget").modal('hide');
                base.hidePop('#storagePopup');

                var func = callbacks['"' + curBtn + '"'];
                if (typeof  func == 'function') {
                    func(arg);
                }

                e.stopImmediatePropagation();
            });

        },

        /**
         * choose file
         * @returns {Storage}
         */
        fileChoose: function () {
            $('.storage-files').on('click', '.oneChoose', function (e) {
                var type = $(this).attr('data-type');
                var name = $(this).attr('title');
                var size = $(this).attr('data-size');

                var url = $(this).attr('data-url');

                $('#file-url').val(url).attr('data-name', name).attr('data-size', size);


                $(this).siblings('.oneChoose').removeClass('current').find('.chooseIcon').remove();
                $(this).addClass('current').append('<button class="chooseIcon"><i class="icon-check icon"></i></button>');

                e.stopImmediatePropagation();
            });

            return this;
        },

        /**
         * choose muilt file
         * @returns {Storage}
         */
        multiFileChoose: function () {
            var _this = this;
            $('.storage-files').on('click', '.multiChoose', function (e) {
                var id = $(this).attr('data-id');
                var url = $(this).attr('data-url');
                var name = $(this).attr('title');
                var ext = $(this).attr('data-ext');

                // choose or not
                if ($(this).hasClass('current')) {
                    $(this).removeClass('current').find('.chooseIcon').remove();
                    url = undefined; // 禁用
                } else {
                    $(this).addClass('current').append('<button class="chooseIcon"><i class="icon-check icon"></i></button>');
                }
                _this.saveMulti(url, id, name);
                e.stopImmediatePropagation();
            });

            return this;
        },

        /**
         *
         * @param url
         * @param id
         * @param fileName
         */
        saveMulti: function (url, id, fileName) {
            // 去重
            tmpMultiFiles[id] = url;
            tmpMultiFilesName[id] = fileName;

            var filesVal = [];
            var filesKey = [];
            var filesName = [];
            for (var i in tmpMultiFiles) {
                if (tmpMultiFiles[i] != undefined) {
                    filesKey.push(i);
                    filesVal.push(tmpMultiFiles[i]);
                    filesName.push(tmpMultiFilesName[i]);
                }
            }

            var str = '';
            for (var i in filesVal) {
                if (tmpType == 'video') {
                    str += '<span class="selected"><img src="' + this.getVideoCover(filesVal[i]) + '" alt="" data-id="' + filesKey[i] + '"/>' +
                        '<i class="icon rmBtn icon-close" title="移除" data-id="' + filesKey[i] + '"></i></span>';
                }

                if (tmpType == 'img') {
                    str += '<span class="selected"><img src="' + filesVal[i] + '" alt="" data-id="' + filesKey[i] + '"/>' +
                        '<i class="icon rmBtn icon-close" title="移除" data-id="' + filesKey[i] + '"></i></span>';
                }

                if (tmpType == 'file' || tmpType == 'audio') {
                    var icon = tmpType == 'audio' ? 'icon-music' : 'icon-file';
                    str += '<p class="selected file"><i class="icon rmBtn icon-close right" title="移除" data-id="' + filesKey[i] + '"></i><i class="icon ' + icon + '"> ' + filesName[i] + '</i></p>';
                }
            }

            $('#storageWidget .previewArea').html(str).show();

            $('#multi-file-url-tmp').val(JSON.stringify(filesVal)).attr('data-key', JSON.stringify(filesKey)).attr('data-name', JSON.stringify(filesName));
            $('#multi-file-url').val(filesVal.join('\n'));
        },

        /**
         * set choose file status
         */
        setMultiView: function () {
            $('#storageWidget .tab-pane.active .file-list .multiChoose').each(function () {
                var id = $(this).attr('data-id');
                if (tmpMultiFiles[id]) {
                    $(this).addClass('current').append('<button class="chooseIcon"><i class="icon-check icon"></i></button>');
                }
            });
        },

        /**
         * set choose file status
         */
        rmMultiSelected: function () {
            var _this = this;
            $('#storageWidget .previewArea').on('click', '.rmBtn', function () {
                var id = $(this).attr('data-id');
                $('#storageWidget .tab-pane.active .file-list .multiChoose[data-id="' + id + '"]').removeClass('current').find('.chooseIcon').remove();
                $(this).parent().remove();

                _this.saveMulti(undefined, id, '');
            });
        },

        /**
         * open folder
         * @returns {Storage}
         */
        openFolder: function () {
            var _this = this;
            $('#storageWidget').on('click', '.openFolder', function (e) {
                var t = $(this).attr('data-folder');
                var type = $(this).attr('data-type');
                var total = $(this).attr('data-count');

                var data = {
                    't': t,
                    'u': app.u,
                    'p': 0
                };

                _this.pagination(type, Math.ceil(total / 12), data);

                _this.getFiles(type, data);

                var path = $('.storage-head[data-type="' + type + '"]');
                path.find('.name').html('<i class="orange icon-folder-close"></i> ' + t);
                path.find('.count').text(total).show();
                path.find('.line').show();

                e.stopImmediatePropagation();
            });

            // back
            $('#storageWidget').on('click', '.backFolderBtn', function (e) {
                var type = $(this).attr('data-type');
                // 隐藏
                $('#storageWidget #storage-' + type).find('.storage-folder').show();
                $('#storageWidget #storage-' + type).find('.storage-files').hide();

                var path = $('.storage-head[data-type="' + type + '"]');
                path.find('.name').empty();
                path.find('.line').hide();
                path.find('.count').html('').hide();

                e.stopImmediatePropagation();
            });

            return this;
        },

        /**
         * get files
         * @param type
         * @param data
         */
        getFiles: function (type, data) {
            var uri = [], _this = this;
            uri['video'] = 'getVideo';
            uri['audio'] = 'getVoice';
            uri['img'] = 'getImg';
            uri['file'] = 'getFile';
            // api request
            base.requestApi('/admin/api/storage/' + uri[type], data, function (res) {
                if (res.result == 1) {
                    base.showTip('ok', '获取成功！', 1000);

                    var file = '.storage-files[data-type="' + type + '"]';
                    $(file).show();

                    switch (type) {
                        case 'img':
                        case 'video':
                            $(file).find('.file-list').html(_this.assignImg(res.data.list));
                            break;
                        case 'file':
                        case 'audio':
                            $(file).find('.file-list').html(_this.assignFile(res.data.list, type));
                            break;
                        default :
                            $(file).find('.file-list').html(_this.assignFile(res.data.list));
                    }

                    if (curMulti) {
                        _this.setMultiView();
                    }

                    $('.storage-folder[data-type="' + type + '"]').hide();
                }
            });

            return this;
        },

        /**
         *
         * @param data
         * @param type
         * @returns {string}
         */
        assignFile: function (data, type) {
            var icon = type == 'audio' ? 'icon-music' : 'icon-file';
            var str = '';
            var muiltClass = curMulti ? 'multiChoose' : 'oneChoose';
            for (var i in data) {
                var item = data [i];
                str += '<li class="file choose ' + muiltClass + '" data-id="' + item.id + '" data-ext="' + item.ext + '" data-type="file" title="' + item.name + '" data-url="' + item.url + '" data-size="' + item.size + '">';
                str += '    <i class="icon green ' + icon + '"></i>';
                str += '    <span>' + item.name + '.' + item.ext + '</span>';
                str += '    <span class="right green" title="文件大小">';
                str += '        <small class="badge badge-success count">' + bytesToSize(item.size) + '</small>';
                str += '    </span>';
                str += '</li>';
            }

            return str;
        },

        /**
         *
         * @param data
         * @returns {string}
         */
        assignImg: function (data) {
            var html = '';
            var muiltClass = curMulti ? 'multiChoose' : 'oneChoose';
            for (var i in data) {
                var item = data[i];
                var img_url = tmpType == 'video' ? this.getVideoCover(item.url) : item.url;
                var str = '';
                str += '<dl class="' + tmpType + ' choose ' + muiltClass + '"  data-id="' + item.id + '" data-ext="' + item.ext + '" title="' + item.name + '" data-url="' + item.url + '" data-size="' + item.size + '">';
                str += '    <dt><img src="' + img_url + '" alt=""/></dt>';
                str += '    <dd class="info">';
                str += '        <small class="badge badge-success count">' + bytesToSize(item.size) + '</small>';
                str += '        <small class="badge badge-warning count">' + item.ext + '</small>';
                str += '    </dd>';
                str += '</dl>';

                html += str;
            }
            html += '<div class="clear"></div>';
            return html;
        },

        /**
         *
         * @param data
         * @param type
         * @returns {string}
         */
        assignFolder: function (data, type) {
            var str = '';

            for (var i in data) {
                var item = data[i];
                str += '<li class="openFolder" data-count="' + item.count + '" data-folder="' + item['folder'] + '" data-type="' + type + '">';
                str += '    <i class="icon green icon-folder"></i>';
                str += '    <span>' + item.folder + '</span>';
                str += '    <small class="mark mark-warning count" title="文件数量">' + item.count + '</small>';
                str += '    <span class="right green" title="总大小">';
                str += '        <small class="badge badge-success count">' + bytesToSize(item.total) + '</small>';
                str += '    </span>';
                str += '</li>';
            }

            return str;
        },

        /**
         *
         * @param url
         * @param ext
         * @returns {string}
         */
        getVideoCover: function (url) {
            var point = url.lastIndexOf(".");
            var name = url.substr(0, point);
            return name + '.jpg';
        },

        /**
         * 通过Ajax加载分页元素
         *
         * @param type
         * @param total
         * @param data
         */
        pagination: function (type, total, data) {
            var _this = this;
            // 创建分页
            $('.pagination[data-type="' + type + '"]').pagination(total, {
                num_edge_entries: 1, //边缘页数
                num_display_entries: 6, //主体页数
                items_per_page: 1, //每页显示1项
                link_to: 'javascript:;',
                prev_text: '<i class="ico icon-left"></i>',
                next_text: '<i class="ico icon-right"></i>',
                callback: function (page_index) {
                    data.p = page_index + 1;
                    _this.getFiles(type, data);
                }
            });

            return this;
        },

        /**
         * reset
         */
        reset: function () {
            $('#storageWidget .tabs .tab').removeClass('active');
            $('#storageWidget .tabs .tab[data-type="upload"]').addClass('active');
            $('#storageWidget .tab-content .tab-pane').removeClass('active').css('display', 'none');
            $('#storageWidget .tab-content #storage-upload').addClass('active').css('display', 'block');

            $('#storageWidget #file-url').val('').attr('data-name', '').attr('data-size', '');
            $('#storageWidget .previewArea').hide();
        }
    };

    /**
     *
     * @param bytes
     * @returns {string}
     */
    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return ((i == 0) ? (bytes / Math.pow(1024, i))
                : (bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
    }

    var store = new Storage();

    exports.getImg = function (btn, func, multi) {
        callbacks['"' + btn + '"'] = func; // 记录所有回调函数
        store.init(btn, 'img', multi);
    };

    exports.getVideo = function (btn, func, multi) {
        callbacks['"' + btn + '"'] = func; // 记录所有回调函数
        store.init(btn, 'video', multi);
    };

    exports.getAudio = function (btn, func, multi) {
        callbacks['"' + btn + '"'] = func; // 记录所有回调函数
        store.init(btn, 'audio', multi);
    };

    exports.getFile = function (btn, func, multi) {
        callbacks['"' + btn + '"'] = func; // 记录所有回调函数
        store.init(btn, 'file', multi);
    };

});
