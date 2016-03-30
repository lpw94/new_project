### 前端注意点:
 1. 按钮类:
	.btn
	.btn.btn-xxx

 2. 表单结构
 
       理论上表单要用 form 标签,默认加上.form的 class
       
       每个字段结构体:
       
      .field  > .field-label(或).label
      
        <form class="form">
            <p class="field">
                <span class="field-label">姓名 <small class="red">*</small></span>
                <input class="name" name="name" placeholder="4-20位字符" type="text">
            </p>
        
            <p class="field">
                <span class="field-label">邮箱 <small class="red">*</small></span>
                <input type="text" class="txt email" name="account" value="" maxlength="100" placeholder="请输入@邮箱">
            </p>
        
            <p class="field">
                <span class="field-label">密码 <small class="red">*</small></span>
                <input type="password" class="txt password" name="password" value="" maxlength="16"
                       placeholder="请输入6-16位密码">
            </p>
        
            <div class="term">
                <i class="icon icon-info"></i> 注册即代表你已同意 <a href="javascript:;">《创客港许可及服务协议》</a>
            </div>
        
            <div class="field">
                <input type="submit" class="btn btn-full btn-main emailRegBtn" value="注册">
            </div>
        </form>
    
    
 3. 弹窗类
 
    ## html 结构体
    
        <main class="popup-wrap" id="loginPopup">
            <section class="popup-widget" id="storageWidget">
                <header class="popup-head">弹出 title<span class="popup-close"></span></header>
                <main class="popup-content">
                    内容区域,可以是表单等
                </main>
            </section>
        </main>
           
    ## js 使用
       
        var base = require('app.base');
        //open loginBox
        $(document).on('click', '.openLoginBox', function () {
            base.showPop('#loginPopup');
        });
        
 4. 表单错误提醒:
 
    ## html 结构体: (默认会在 layout 中)
        <div id="ajaxStatus">
            <p id='ajaxTip' class="wait">加载中...</p>
        </div>
       
    ## js 使用
        var base = require('app.base');
        
        // 三种提醒方式:(最后为显示的时间,如果不填写,则一直显示)
        tip.showTip('wait', "正在处理", 10000);
        tip.showTip('err', "错误提醒", 3000);
        tip.showTip('ok', "成功的提醒", 3000);
 
 5. ajax 请求:
    ## js 使用
        var base = require('app.base');

        方法: base.requestApi(url,data,callback,async)
        说明: 
            参数1为 url
            参数2为 传入参数 
            参数3为 回掉函数,用于处理自己结果
            参数4为 是否同步 默认为 false,同一时间只能发送一次请求,请求完毕后才能再次请求,请根据自己的情况填写
        data={'phone':18xxxxx,'pass':111}
        base.requestApi('/home/api/account/reg', data, function (res) {
            if (res.result == 1) {
                tip.showTip('ok', '恭喜您,注册成功!', 5000);
                setTimeout(function () {
                    window.location.href = "/user/guide";
                }, 2000);
            }
        });
 
 6. 表单验证
    ## js 使用
        var base = require('app.base');

        方法: function (elem, msg, regx)
        说明: 
             参数1为 文本域(input)的 class 或 id
             参数2为 错误时的提醒
             参数3为 正则匹配(可以不填)
       
        使用:
       
        if (!checkField(".regForm .phone", '手机号码格式不正确', /^(1[\d]{10})$/)) {
             return false;
        }
        
 7. mark,badge,circle 样式类

 8. html5标签使用: 
    块级元素: main,section,article,aside,header,footer,nav
    内联元素: small,big