/**
 * Created by hh on 2015/10/21.
 */

define(function(require,exports){
    require('../../tools/datepicker.js');
    exports.user = function(){
        //日历
        $( "#datepicker").datepicker({
            inline: true,
            altField: ".time-msg",
            altFormat: "yy年MMdd日, DD"
        });
        $( "#startime").datepicker({
            inline: true,
            altField: ".time-msg",
            altFormat: "DD, d MM, yy"
        });
        $( ".office-box .book-time").datepicker({
            inline: true,
            altField: ".time-msg",
            altFormat: "DD, d MM, yy"
        });
        //个人中心首页事件
        bindListener();
        $(".btn_add").on("click",function(){
            var oBox = $(".service_mark");
            var otext = $(".service_name").val();
            if(otext == ""){
                return;
            }else{
                var oSpan = document.createElement("span");
                oSpan.className = "service_items";
                var oP = document.createElement("p");
                oSpan.appendChild(oP);
                var oMove = document.createElement("a");
                oMove.href = "javascript:;"
                oMove.className = "remove_items";
                oSpan.appendChild(oMove);
                oP.innerHTML = otext;
                oBox.append(oSpan)
                $(".service_name").val("");
            }
            bindListener();
        });

        //寄件服务
        //选择编辑
        $(".input_disabled").change(function(){

            if($(".input_disabled").prop("checked")){
                $(".invoice_box input").removeAttr("disabled");
                $(".invoice_box select").removeAttr("disabled");
            }else{
                $(".invoice_box input").attr("disabled","true");
                $(".invoice_box select").attr("disabled","true");
            }
        });
        // 删除添加
        $("#add_contact").on("click",function(){
            $(".contact_items").children(".contact").eq(0).clone().appendTo(".contact_items");
            bindListener();
        })
        $("#add_addr").on("click",function(){
            $(".select_area_box").children(".selects").eq(0).clone().prependTo(".select_area_box");//复制
            bindListener();
        })
        $("#post_way").on("change",function(){
             if($(this).val()==1){
                 $("#post_addr").show()
             }else{
                 $("#post_addr").hide()
             }
        })

        //添加监听事件
        function bindListener(){
            $(".remove_items").on("click",function(){
                $(this).parent(".service_items").remove();
            })
            $(".del_icon").on("click",function(){
                var Oselect = $(".select_area_box").children(".selects");
                if(Oselect.length <= 1){
                    return
                }else{
                    $(this).parent().remove();
                }
            })
            $(".del_icons").on("click",function(){
                var oContact = $(".contact_items").children(".contact");
                if(oContact.length<=1){
                    return
                }else{
                    $(this).parent().parent().remove();
                }
            })
        }
        //弹出层
        $('#agreement').on('click',function(){
            $('.masklayer').stop(true,false).fadeIn(function(){
                $('.agr_box').stop(true,false).fadeIn();
            });
        });
        //close
        $('.masklayer').on('click',function(){
            var _this = $(this);
            $('.agr_box').stop(true,false).fadeOut(function(){
                _this.stop(true,false).fadeOut();
            });
        });
        $('.agr_box .close').on('click',function(){
            $('.agr_box').stop(true,false).fadeOut(function(){
                $('.masklayer').stop(true,false).fadeOut();
            });
        });

        //预订列表

        $(".reserve-item .close").on('click',function(){
            $(this).hide();
            $(this).parents(".close-select").find("span").show();
        });
        $(".reserve-item .back").on('click',function(){
            $(this).parent("span").siblings(".close").show();
            $(this).parent("span").hide();
        })

        $(".reserve-item .remove").on('click',function(){
            $(this).parent().parents().parent(".reserve-item").hide()
        });

        //培训室预订
        $(".train-book .time-reserve li").on('click',function(){
            if(!($(".time-reserve").hasClass("gray")|| $(this).hasClass("booked"))) {
                $(this).addClass("selected").find("i").hide();
            }
        });
        //会议室预订
                $(".time-reserve li").hover(function(){
                    if(!( $(this).hasClass("selected")|| $(this).hasClass("booked"))){
                        $(this).find("i").css('display','block');
                    }
                },function(){
                    $(this).find("i").hide();
                });

        $(".dragged li").on('click',function(){
            var i =$(this).index();
            console.log(i);
            if(!($(this).hasClass("gray")|| $(this).hasClass("booked"))) {
                if (i % 2 != 0) {
                    $(this).addClass("selected").find("i").hide();
                    $(this).prev("li").addClass("selected").find("i").hide();
                }else{
                    $(this).addClass("selected").find("i").hide();
                    $(this).next("li").addClass("selected").find("i").hide();
                }
            }
        });
        //选择上午、中午、下午

        $(".time-box li").on('click',function(){
            var id = $(this).attr("data-id");
            //console.log(id);
            var curr = $(this).parent().siblings(".dragged").find('li[data-id="'+id+'"]');
            if(!$(".dragged li").hasClass("selected")){
            curr.each(function(){
                if(!$(this).hasClass('booked')){
                    $(this).addClass("selected").find("i").hide();}
            });
            }else{
                $(".dragged li").removeClass("selected")
                curr.each(function() {
                    if (!$(this).hasClass('booked')) {
                        $(this).addClass("selected").find("i").hide();
                    }
                })
                }
        });
           //双击取消
        $(".time-reserve li").on('dblclick',function(){
            $(this).parents().children("li").removeClass("selected")
        });
        //拖动效果
        $(document).ready(function(){
            var _ismove = false;

            $('.time-reserve').on('mousedown',function(e){
                e.target.tagName == 'LI'?_ismove=false:null;
                _ismove=true;
                if($(".time-reserve li ").hasClass('selected')){
                    $(this).find("li").removeClass('selected');
                }
                $('.dragged').on('mousemove',function(ev){
                    if(!_ismove)return false;
                    if(ev.target.nodeName != 'LI')return false;
                    if(!$(ev.target).hasClass('selected')&&!$(ev.target).hasClass('gray')&&!$(ev.target).hasClass('booked'))$(ev.target).addClass('selected');
                });
            });
            $('.time-reserve .gray,.time-reserve .booked').on('mousemove',function(e){
                //console.log(_ismove + '///')
                _ismove=false;
                //console.log(_ismove + '***')
                $('.time-reserve').unbind('mousemove');
            });

            $('.time-reserve').on('mouseup',function(e){
                //console.log(_ismove + '///')
                _ismove=false;
                //console.log(_ismove + '***')
                $('.time-reserve').unbind('mousemove');
            });

        });

        //移动办公卡位预订
        $(".office-book").on('click',function(){
            $(".masklayer").show();
            $(".office-box").show();
        });
        $(".reservation-box .close").on('click',function(){
            $(".masklayer").hide();
            $(".reservation-box").hide();
        });
        $(".masklayer").on('click',function(){
            $(".masklayer").hide();
            $(".reservation-box").hide();
        });
        $(".reservation-box .cancel").on('click',function(){
            $(".masklayer").hide();
            $(".reservation-box").hide();
        });

        //会议室、培训室预订弹框
        $(".yd-btn").on('click',function(){
            $(".masklayer").show();
            $(".reservation-box").show();
        });

        //完善资料

        $(".improve-step").eq(0).show();
        $(".r_next").on('click',function(){
            $(this).parent().parent(".improve-step").hide();
            $(this).parent().parent(".improve-step").next(".improve-step").show();
        })
        bindListener();
        $(".server i").on("click",function(){
            var oBox = $(this).parent().next(".server-detail");
            var otext = $(this).siblings(".add-ser").val();
            if(otext == ""){
                return;
            }else{
                var oSpan = document.createElement("div");
                oSpan.className = "ser-item";
                var oP = document.createElement("p");
                oSpan.appendChild(oP);
                var oMove = document.createElement("a");
                oMove.href = "javascript:;"
                oMove.className = "remove_items";
                oSpan.appendChild(oMove);
                oP.innerHTML = otext;
                oBox.append(oSpan)
                $(".add-ser").val("");
            }
            bindListener();
        });
        function bindListener(){
            $(".server-detail .remove_items").on('click',function(){
                $(this).parent(".ser-item").remove();
            })
        }






    }
})