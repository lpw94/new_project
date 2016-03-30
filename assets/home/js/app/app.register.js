/**
 * Created by ajay on 2015/10/9.
 */
define(function(require,exports){
    var _ = require('../app/app.verify');
    exports.init = function(){
        $(document).ready(function(){
/*
            $('#registerBox .bar .items').eq(0).find('span').addClass('on');
            $('#registerBox .con .mForm').eq(0).show();
            //切换注册方式
            $('#registerBox .bar span').on('click',function(){
                $(this).addClass('on').parent('.items').siblings('.items').find('span').removeClass('on');
                var _id = $(this).attr('data-id');
                $('#registerBox .con .mForm[data-id='+_id+']').show().siblings('.mForm').hide();
                //初始化
                $('#registerBox .con .mForm[data-id='+_id+']').find('input.inRequire').each(function(){
                    $(this).val('');
                    $(this).parents('.items').find('.tips').removeClass('error').find('.con').html('');
                });
            });
*/
            //协议弹框
            $(".items .xy a").on('click',function(){
                $(".agr_box").show();
                $(".masklayer").show();
            });
            $(".agr_box .close").on('click',function(){
                $(".agr_box").hide();
                $(".masklayer").hide();
            });
            $(".agr_box .btn_ok").on('click',function(){
                $(".agr_box").hide();
                $(".masklayer").hide();
            });
            $(".masklayer").on('click',function(){
                $(".agr_box").hide();
                $(".masklayer").hide();
            });
            //查看密码
            $(".password-see i").on('click',function(){
                    if($(this).hasClass("nosee")){
                        $(".password-see input").attr('type','password');
                        $(this).removeClass("nosee")
                    }else{
                        $(".password-see input").attr('type','text');
                        $(this).addClass("nosee")
                    }
            });
            //手机选择
            $('.mInputDrop > .drop > .checked').on('click',function(){
                if($(this).hasClass('open')){
                    $(this).removeClass('open').next('ul').stop(true,true).slideUp();
                }else{
                    $(this).addClass('open').next('ul').stop(true,true).slideDown();
                }
            });
            $('.mInputDrop > .drop li').on('click',function(){
                var _html = $(this).html();
                $(this).parents('.mInputDrop').attr('data-zone',$(this).attr('data-zone'));
                $(this).parent('ul').stop(true,true).slideUp().prev('.checked').html(_html).removeClass('open');
            });
            //点击获取验证码
            $('.mForm .mCode').on('click',function(){
                $(this).html('<em>30s</em>后重新获取');
            });
            //
            $('input.inRequire').on('blur',function(){
                _.verify($(this));
            });
            //提交验证
            $('.mForm .submitBtn.register').on('click',function(){
                var _Form = $(this).parents('.mForm');
                _Form.find('input.inRequire').each(function(){
                    _.verify($(this));
                });
                if( _Form.find('.tips.error').length ){
                    return false;
                }
                if( !_Form.find('.pact').prop('checked')){
                    alert('请仔细阅读并同意许可及服务协议');
                    return false;
                }
                //提交
            });
        });
    };
});
