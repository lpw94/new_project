/**
 * Created by ajay on 2015/10/14.
 *
 * 适用下面的 HTML 结构
 <dd class="mForm">
     <div class="items">
         <div class="bd">
            <input class="mInput" type="text" name="" value="" placeholder="" />
         </div>
         <div class="tips"><div class="con"></div></div>
     </div>
     <div class="items">
         <div class="bd">
            <a class="submitBtn" href="javascript:;">登陆</a>
         </div>
     </div>
 </dd>
 */
define(function(require,exports){
    exports.checkValue = function(dom,key,reg,tips,maxlength){
        var _TipsDom = dom.parents('.items').find('.tips').eq(0);
        //空值验证
        if(!$.trim(dom.val())){
            _TipsDom.addClass('error').find('.con').html(key +'不能为空');
            return false;
        }else{
            _TipsDom.removeClass('error').find('.con').html('');
            if(!reg)return true;
        }
        //正则验证
        if( !reg.test(dom.val()) ){
            if(tips.length >= maxlength ){
                _TipsDom.addClass('error').find('.con').css({'line-height':'21px'}).html(tips);
            }else{
                _TipsDom.addClass('error').find('.con').html(tips);
            }
            return false;
        }else{
            _TipsDom.removeClass('error').find('.con').html('');
            return true;
        }
    };
    /*
     * 验证模块,依赖登录模块的 checkValue()
     * 手机号码、邮箱、用户名、密码、确认密码、验证码(验证未做比对)
     */
    exports.verify = function(_dom){
        var checkValue = exports.checkValue;
        var _this = _dom;
        var _type = _this.attr('name');

        switch(_type){
            case 'username':
                /*4~20字符，字母+中文+数字，以字母或汉字开头*/
                var reg = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[A-Za-z]){1}([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[A-Za-z0-9]){3,19}$/;
                checkValue(_this,'用户名',reg,'请以字母或汉字开头，4~20个字符之间',13);
                break;
            case 'phone':
                var _zone = _this.parents('.mInputDrop').attr('data-zone');
                if( _zone == 'CN' ){
                    /*国内11数字，以130~139/150~153 155~159/180~189/176~178为前3位*/
                    var reg = /((^13[0-9])|(^15([0-3]|[5-9]))|(^18[0-9])|(^17[6-8]))\d{8}$/;
                }else{
                    /*香港8数字，以51-56、59、6、90-98开头*/
                    var reg = /(((^5[1-6])|(^59)|(^9[0-8]))\d{6}$)|((^6)\d{7}$)/;
                }
                checkValue(_this,'手机',reg,'请输入正确的手机号码',13);
                break;
            case 'email':
                /*6~20字符，含@.并以字母结束，这里暂时不考虑长度*/
                var reg = /^([a-zA-Z0-9_%+-])+@([a-zA-Z0-9_-])+[.][A-Za-z]{2,4}$/;
                checkValue(_this,'邮箱',reg,'请输入正确的邮箱地址');
                break;
            case 'psw':
                /*6~16字符，字母+数字组合，区分大小写*/
                var reg = /[A-Za-z0-9]{6,16}$/;
                if(checkValue(_this,'密码',reg,'请输入6~20个字符，字母+数字组合',13)){
                    var _repsw = _this.parents('.mForm').find('input[name=repsw]');
                    if( !_repsw.val()) return false;
                    var _repswTipsDom = _repsw.parents('.items').find('.tips').eq(0);
                    if( _this.val() != _repsw.val() ){
                        _repswTipsDom.addClass('error').find('.con').html('密码不一致');
                    }else{
                        _repswTipsDom.removeClass('error').find('.con').html('');
                    }
                }
                break;
            case 'repsw':
                if(!checkValue(_this,'确认密码'))return false;
                var _TipsDom = _this.parents('.items').find('.tips').eq(0);
                var _psw = _this.parents('.mForm').find('input[name=psw]').val();
                if( _this.val() != _psw ){
                    _TipsDom.addClass('error').find('.con').html('密码不一致');
                }else{
                    _TipsDom.removeClass('error').find('.con').html('');
                }
                break;
            case 'code':
                /*4位数字*/
                var reg = /^(\d){4}$/;
                checkValue(_this,'验证码',reg,'请输入正确的验证码');
                break;
            default:
        }
    };
});