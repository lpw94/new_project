/**
 * Created by hh on 2015/9/17.帖子模块js
 */
define(function(require,exports){
    exports.topic = function(){
/*
            //点击评论
            $(".discuss-box .discuss").on('click', function () {
                var comment = $(this).parent().parent().parent(".discuss-box").siblings(".comment-box");
                comment.toggle();
            })
*/

            //点赞
        $(document).on("click", ".discuss-box .zan", function (){
                var zan = $(this).parent(".guide-btns").children(".zan");
                if (zan.hasClass("active")) {
                    $(this).removeClass("active")   //取消赞
                    $(this).find("i").animate({top: '0'})
                }
                else {
                    $(this).addClass("active");    //点赞
                    $(this).find("i").css('opacity', '1').animate({top: '-30px', opacity: '0'}, 1000)
                }
            });

            //收藏
            $(document).on("click", ".discuss-box .collect", function (){
                var collect = $(this).parent(".guide-btns").children(".collect");
                if (collect.hasClass("active")) {
                    $(this).removeClass("active")   //取消收藏
                }
                else {
                    $(this).addClass("active");    //收藏
                }
            });

            //显示评论
            $(document).on("click", ".guide-btns .comment-num", function () {
                $(this).parents().parents().siblings(".comment-box").toggle();
            });


            //评论回复
        $(document).on("click", ".com-reply .reply-btn", function (){
                $(this).parent(".com-reply").siblings(".reply-box").toggle();
            });

            //多职位显示
            $(".titem-top").each(function (i) {
                var last = $(".titem-top").eq(i).find(".name-msg").find(".company").find("i");
                //alert(last)
                $(last).last().addClass("off")
            })


            //显示图片数量(九宫格)
            $(".pic-list").each(function (i) {
                var length = $(".pic-list").eq(i).find("ul").find("li").length;
                // console.log(length)
                if (length == 4) {
                    $(".pic-list").eq(i).find("ul").addClass("img04");
                }
                if (length == 1) {
                    $(".pic-list").eq(i).find("ul").find("li").addClass("img01");
                }
            })

            //举报话题
        $(document).on("click", ".name-msg .more", function (){
                var more = $(this).parent(".name").children("i");
                if (more.hasClass("on")) {
                    $(this).parent(".name").siblings(".more-drop").hide();
                    $(this).removeClass("on")
                }
                else {
                    $(this).parent(".name").siblings(".more-drop").show();
                    $(this).addClass("on");
                }
            });
        $(document).on("click", ".more-drop .report", function (){
                $(".masklayer").show();
                $(".report-box").show();
            });
        $(document).on("click", ".push i", function (){
                $(".masklayer").hide();
                $(".push").hide();
            });
        $(document).on("click", ".masklayer", function (){
                $(".masklayer").hide();
                $(".push").hide();
                $(".new-activity").hide();
            });
            //提交举报
        $(document).on("click", ".submit-btn", function (){
                $(".report-box").hide();
                $(".report-success").show();
            });
            //举报成功
        $(document).on("click", ".report-success-btn", function (){
                $(".masklayer").hide();
                $(".push").hide();
            });


            /*
             //屏蔽话题
             $(".more-drop").find(".shield").on('click',function(){
             $(".bar").show();
             $(".shield-box").show();
             });
             $(".shield-btn").on('click',function(){
             $(".bar").hide();
             $(".push").hide();
             })
             */

            //上传图片
            $(".send-select").on('click', function () {
                $(".img-select").show();
            });
            $(".img-select").find(".off").on('click', function () {
                $(".img-select").hide();
            });

            //删除图片
            $(".img-select ul li i").on('click', function () {
                $(this).parent("li").hide();
            });

    }
});