$(function () {
    //初始化main高度，兼容部分页面有底色的情况
    $('#main').css({'min-height':$(window).height()});
    //侧边栏
    $('header > .menuBtn').on('click',function(){
        $('#maskLayer').stop(true,false).fadeIn(function(){
            $('#sidePanel').addClass('show');
        });
    });
    $('#sidePanel > .close').on('click',function(){
        $('#sidePanel').removeClass('show');
        $('#maskLayer').stop(true,false).fadeOut();
    });
});