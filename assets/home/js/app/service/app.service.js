define(function (require, exports) {
    var base = require("/assets/home/js/app.base.js");

    exports.filter = function () {
        $(document).on('change', '#province', function () {
            window.location.href = $(this).find('option:selected').attr('data-url');
        })
        $(document).on('change', '#city', function () {
            window.location.href = $(this).find('option:selected').attr('data-url');
        })
        $(document).on('change', '#department', function () {
            window.location.href = $(this).find('option:selected').attr('data-url');
        })



    };

});