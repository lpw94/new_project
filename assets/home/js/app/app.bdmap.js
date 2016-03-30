define(function(require,exports){
    //require('../../js/jquery.nav.js');
    //服务中心列表页接口
    exports.map = function(){
        var map = new BMap.Map("allmap");  // 创建Map实例
        //var json_data = [[113.940949,22.545736],[113.921833,22.538058],[113.942889,22.537925],[113.914072,22.53432]];
        var json_data = [
            {
                id:'1001',
                point:[113.940949,22.545736],
                img:'http://img0.bdstatic.com/img/image/shouye/bizhi0914.jpg',
                url:'',
                name:'腾讯大厦'
            },
            {
                id:'1002',
                point:[113.921833,22.538058],
                img:'http://img0.bdstatic.com/img/image/shouye/mingxing0914.jpg',
                url:'',
                name:'大新地铁站'
            },
            {
                id:'1003',
                point:[113.942889,22.537925],
                img:'http://img0.bdstatic.com/img/image/shouye/chongwu0914.jpg',
                url:'',
                name:'深圳大学'
            },
            {
                id:'1004',
                point:[113.914072,22.53432],
                img:'http://img0.bdstatic.com/img/image/shouye/jianbihua0914.jpg',
                url:'',
                name:'深圳西站'
            }
        ];
        $(document).ready(function(){
            addPointMap(json_data,map);

            $('.mImgTxt1').hover(function(){
                var _id = $(this).attr('data-id');
                $('#allmap .markers[data-id='+_id+']').addClass('active');
            },function(){
                var _id = $(this).attr('data-id');
                $('#allmap .markers[data-id='+_id+']').removeClass('active');
            });
        });
    };
    //服务中心详情页接口
    exports.singleMap = function(data,dom){
        var map = new BMap.Map(dom);
        addPointMap(data,map);
    };
    function addPointMap(json_data,map){
        //map.enableScrollWheelZoom();
        var pointArray = new Array();
        for(var i=0;i<json_data.length;i++){
            var _point = json_data[i]['point'];
            /*
            var marker = new BMap.Marker(new BMap.Point(json_data[i][0], json_data[i][1])); // 创建点
            map.addOverlay(marker);
            */
            var myCompOverlay = new ComplexCustomOverlay(new BMap.Point(_point[0], _point[1]), json_data[i].name, json_data[i].id);
            map.addOverlay(myCompOverlay);    //增加点
            pointArray[i] = new BMap.Point(_point[0], _point[1]);
            var content = '<div class="img">'
                            +'<a href="'+json_data[i].url+'">'
                                +'<img src="'+json_data[i].img+'" />'
                            +'</a>'
                            +'</div>'
                            +'<div class="txt">'
                            + json_data[i].name
                            +'</div>';
            var opts = {
                width:220,
                height:140
            };
            //添加信息窗
            addClickHandler(map,content,myCompOverlay,opts);
        }
        //让所有点在视野范围内
        map.setViewport(pointArray);
    }
    function addClickHandler(map,content,myCompOverlay,opts){
        myCompOverlay.K.addEventListener("click",function(){
                openInfo(map,content,opts,myCompOverlay)}
        );
    }
    function openInfo(map,content,opts,e){
        var p = e._point;
        var point = new BMap.Point(p.lng, p.lat);
        var infoWindow = new BMap.InfoWindow(content,opts);  // 创建信息窗口对象
        map.openInfoWindow(infoWindow,point); //开启信息窗口
    }

    // 复杂的自定义覆盖物
    function ComplexCustomOverlay(point, text, id){
        this._point = point;
        this._text = text;
        this._id = id;
    }
    ComplexCustomOverlay.prototype = new BMap.Overlay();
    ComplexCustomOverlay.prototype.initialize = function(map){
        this._map = map;
        var div = this._div = document.createElement("div");
        div.setAttribute('class','markers');
        div.setAttribute('data-id',this._id);
        div.style.position = "absolute";
        div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
        var span = this._span = document.createElement("span");
        div.appendChild(span);
        span.appendChild(document.createTextNode(this._text));
        var that = this;

        var arrow = this._arrow = document.createElement("div");
        //arrow.style.background = "url(http://map.baidu.com/fwmap/upload/r/map/fwmap/static/house/images/label.png) no-repeat";
        arrow.setAttribute('class','arrow');
        arrow.style.position = "absolute";
        arrow.style.top = "29px";
        arrow.style.left = "10px";
        div.appendChild(arrow);

        div.onmouseover = function(){
            this.setAttribute('class','markers active');
        }
        div.onmouseout = function(){
            this.setAttribute('class','markers');
        }
        map.getPanes().labelPane.appendChild(div);
        return div;
    }
    ComplexCustomOverlay.prototype.draw = function(){
        var map = this._map;
        var pixel = map.pointToOverlayPixel(this._point);
        this._div.style.left = pixel.x - parseInt(this._arrow.style.left) -5 + "px";
        this._div.style.top  = pixel.y - 42 + "px";
    }
});



