define(function (require, exports) {
    var base = require('app.base');
    require('tools/cropper/cropper.js');

    exports.setAvatar = function () {
        $(function () {
            var init = false;
            $('.user-avatar').on('mouseover', function (e) {
                $('.user-avatar .cover').fadeIn();
                e.stopImmediatePropagation();
            }).on('mouseleave', function (e) {
                $('.user-avatar .cover').hide();
                e.stopImmediatePropagation();
            });

            $(document).on('click', '.setAvatarBtn', function (e) {
                base.showPop('#avatarPopup');
                if (!init) {
                    cropperInit();
                    init = true;
                }
                e.stopImmediatePropagation();
            });

            // 初始化
            function cropperInit() {
                var rectData;

                var cropper = new Cropper({
                    element: document.getElementById('cropper-target'),
                    previews: [
                        document.getElementById('preview-large')
                    ],
                    onCroppedRectChange: function (rect) {
                        rectData = rect;
                    }
                });

                var input = document.getElementById('cropper-input');
                input.onchange = function () {
                    if (typeof FileReader !== 'undefined') {
                        var reader = new FileReader();
                        reader.onload = function (event) {
                            if (event.total > 204800) {
                                tip.showTip('err', '图片大小不能大于200K', '3000');
                                return;
                            }
                            if (event.total < 10240) {
                                tip.showTip('err', '图片大小不能小于10K', '3000');
                                return;
                            }
                            cropper.setImage(event.target.result);

                            $('#cropper-input').css({'left': '444px', 'top': '232px', 'height': '36px'});
                            $('.redo-area').css({'visibility': 'visible'});
                            $('.chooseFileBtn').hide();
                        };

                        if (input.files && input.files[0]) {
                            reader.readAsDataURL(input.files[0]);
                        }
                    } else { // IE10-
                        input.select();
                        input.blur();

                        var src = document.selection.createRange().text;
                        cropper.setImage(src);
                    }
                };

                $('.saveAvatarBtn').on('click', function (e) {
                    var img = $('.image-wrapper img').attr('src');
                    if (!rectData) {
                        tip.showTip('err', '请先选择头像', 3000);
                        return;
                    }

                    base.requestApi('/home/api/user/saveAvatar', {rect: rectData, file: img}, function (res) {
                        if (res.result == 1) {
                            tip.showTip('ok', '恭喜您,头像上传成功', 2000);
                            $('.user-avatar img.avatar').attr('src', res.data);
                            setTimeout(function () {
                                base.hidePop('#avatarPopup');
                            }, 1000);
                        }
                    });

                    e.stopImmediatePropagation();
                });
            }


        });
    }
})
;