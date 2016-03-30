/**
 * Created by Ajay on 2015/10/12.
 * WebSocket readyState
 * CONNECTING (0)：表示还没建立连接；
 * OPEN (1)： 已经建立连接，可以进行通讯；
 * CLOSING (2)：通过关闭握手，正在关闭连接；
 * CLOSED (3)：连接已经关闭或无法打开；
 * wasClean(布尔
 * ) code error
 */
define(function(require,exports){
    exports.init = function(){
        /*
        if(!$.cookies('WEB_CUID')){
            console.log('未登陆，不能启动');
            return false;
        }
        */
        ///*
        if(!Cookies.get('WEB_CUID')){
            console.log('未登陆，不能启动');
            return false;
        }
        //*/

        /*仅让im.html作为测试页面，避免干扰其他页面调试*/
        /*
        if(!window.imTest){
            return false;
        }
        */

        var IM = window.IM = {
            Panel:{},
            Chat:{},
            User:{},
            addGroupChat:{},
            Data:{
                unread: [],
                rc: null,
                friends: null,
                groups: null
            }
        };
        //初始化加载
        IM.init = function(){
            //检测
            if (window.WebSocket || window.MozWebSocket){
                //IM.ws = new WebSocket('ws://112.124.106.166:9501');
                IM.ws = new ReconnectingWebSocket('ws://112.124.106.166:9501');
                //IM.ws.debug = true;
            }else{
                console.log('请使用更高级版本的浏览器，才能启动即时聊天！！！');
                return false;
            }
            console.log('开始前：'+IM.ws.readyState)
            //成功
            IM.ws.onopen = function(e) {
                console.log('成功连接--'+IM.ws.readyState + '---' + IM.ws.bufferedAmount)
                console.log(e)
                //心跳包检测
                /*
                var heartbeat_timer = setInterval( function(){
                    IM.heartPacket(IM.ws);
                }, 1000 );
                */

                //Auto login
                var _uid = Cookies.get('WEB_CUID');
                //var _uid = $('#loginID').val();
                var _JSON = {
                    'cmd':'login',
                    'data':{'uid':_uid}
                };
                /*
                var _JSON = {
                    'cmd':'login',
                    'data':{'uid':'1'}
                };
                */
                IM.ws.send(JSON.stringify(_JSON));

                //渲染
                if( !IM.node ){
                    IM.Panel.draw();
                    IM.Panel.event();
                }
            };
            //关闭
            IM.ws.onclose = function(e) {
                console.log('连接关闭--'+IM.ws.readyState)
                console.log(e)
                console.log(e.wasClean)
                console.log(e.reason)
                //重连
                //IM.init();
            };
            //消息
            IM.ws.onmessage = function(e) {
                console.log('有消息传递--'+IM.ws.readyState)
                //转JSON
                console.log(JSON.parse(e.data));
                var _dataObj = JSON.parse(e.data);
                switch(_dataObj.act){
                    case 'login':
                        IM.msg_login(_dataObj.data);
                        break;
                    case 'getResent':
                        IM.msg_getResent(_dataObj.data);
                        break;
                    case 'online':
                        IM.msg_online(_dataObj.data);
                        break;
                    case 'offline':
                        IM.msg_offline(_dataObj.data);
                        break;
                    case 'getContactGroup':
                        IM.msg_getContactGroup(_dataObj.data.list);
                        break;
                    case 'getContactMember':
                        IM.msg_getContactMember(_dataObj.data);
                        break;
                    case 'getGroup':
                        IM.msg_getGroup(_dataObj.data.list);
                        break;
                    case 'getGroupMember':
                        IM.msg_getGroupMember(_dataObj.data);
                        break;
                    case 'newMessage':
                        IM.msg_newMessage(_dataObj.data);
                        break;
                    case 'sendMessage':
                        IM.msg_sendMessage(_dataObj.data);
                        break;
                    case 'pullMessage':
                        IM.msg_pullMessage(_dataObj.data);
                        break;
                    case 'getHistory':
                        IM.msg_getHistory(_dataObj.data);
                        break;
                    case 'error':
                        IM.msg_error(_dataObj.error);
                        break;
                    /*
                    case '':
                        break;
                    */
                    default:

                }
            };
            //远程连接中断
            IM.ws.onerror = function(e) {
                console.log(e)
                console.log('连接中断--'+IM.ws.readyState + '---' + e);
                //将所有发送状态中的DOM，改成fail
                console.log(!IM.node.Chat)
                if( !IM.node.Chat ) return false;
                var _node = IM.node.Chat;
                _node.viewArea.find('.self.sending').removeClass('sending').addClass('fail');
                //清空发送缓存
                IM.Chating.active.sendCache = [];
                for(var s in IM.Chating.list ){
                    IM.Chating.list[s].sendCache = [];
                }
                console.log('连接中断后续处理结束')
            };
        };
        //心跳包检测-测试
        IM.heartPacket = function(_ws){
            //console.log(_ws.bufferedAmount);
        };

        //请求处理
        //消息处理
        IM.msg_login = function(_obj){
            var _node = IM.node.Panel;
            /*登录成功,获取用户信息*/
            IM.User.avatar = _obj.avatar;
            IM.User.cli = _obj.cli;
            IM.User.name = _obj.name;
            IM.User.uid = _obj.uid;
            _node.userinfo.find('[im-avatar] img').eq(0).attr('src',IM.User.avatar);
            _node.userinfo.find('[im-name]').html(IM.User.name);
            //拉取最近联系人
            IM.ws.send(JSON.stringify({'cmd':'getResent'}));
            _node.loginTips.fadeOut();
            _node.loginError.fadeOut();
            _node.masklayer.fadeOut();
            /** 这里采用先直接拉取，是为了避免后面，用户在主面板切换发送请求，遇上连接中断，无法快速获取返回信息，增强体验
             *  拉取群组列表，在这里可能会出现无执行的情况。
             *  **/
            //拉取通讯录
            IM.ws.send(JSON.stringify({'cmd':'getContactGroup'}));
            //下面 console 不能删除,否则后面 send 容易丢失
            console.log('');
            //拉取群组列表
            IM.ws.send(JSON.stringify({'cmd':'getGroup','data':{'gid':IM.User.uid}}));
            //console.log()
        };
        IM.msg_online = function(_uid){
            IM.updateUserState(_uid,'online');
        };
        IM.msg_offline = function(_uid){
            IM.updateUserState(_uid,'offline');
        };
        //IM.msg_offline = function(){};
        IM.msg_getResent = function(_obj){
            IM.Data.rc = _obj;
            /*获取最近联系人*/
            /* avatar  content  created  from  gid  id  name  status  to */
            var _node_rcList = '';
            var _nowTime  = new Date();
            if(IM.Data.unread.length)IM.Data.unread = [];
            if(_obj.length){
                for( var s in _obj ){
                    _obj[s].created = _obj[s].created *1000;
                    var _oldTime = new Date(parseInt(_obj[s].created));
                    var _nowTime = new Date();
                    var _timeString =  IM.timeDiff(_oldTime,_nowTime);
                    var _read = '';
                    if(_obj[s].unread ){
                        _read = 'unread';
                        IM.Data.unread.push(_obj[s]);
                    }
                    _node_rcList += '<li im-chat="rc" class="'+ _read +'" data-from="'+ _obj[s].from
                        +'" data-gid="'+ _obj[s].gid
                            //+'" data-id="'+ _obj[s].id
                        +'" data-name="'+ _obj[s].name
                        +'" data-avatar="'+ _obj[s].avatar
                            //+'" data-status="'+ _obj[s].status
                        +'" data-to="'+ _obj[s].to +'">'
                        +'<span im-avatar><img src="'+ _obj[s].avatar +'"></span>'
                        +'<div>'
                        +'<span im-time>'+ _timeString +'</span>'
                        +'<span im-name>'+ _obj[s].name +'</span>'
                        +'<p im-msg>'+ _obj[s].content +'</p>'
                        +'</div>'
                        +'<i></i>'
                        +'</li>';
                }
            }else{
                _node_rcList = '<li class="none">太安静了，找朋友闲聊去！</li>';
            }

            var _node = IM.node.Panel;
            _node.rc.html(_node_rcList);
            IM.msgReminder();
        };
        //IM.msg_getOnline = function(){};
        IM.msg_getContactGroup = function(_obj){
            IM.Data.friends = _obj;
            /* group_id  group_name  members  online  total
            * members 字段 --> online  user_avatar  user_id  user_name
            * */
            var _hasFriend = false;
            //判断是否没有任何好友
            for(var s in _obj){
                if( _obj[s].members.length ){
                    _hasFriend = true;
                    break;
                }
            }
            var Node ='';
            if( _hasFriend ){
                Node = IM.drawDomFriends('Panel');
                //console.log(Node)
            }else{
                Node = '<dl data-group-id="0" im-org><dt>默认分组<span im-count>(0/0)</span></dt></dl>'
                    +'<div class="noBody"><a href="javascript:;">心里空空的，装点人吧！</a></div>';
            }


            /*
            var _node_friends = '';
            for( var s in _obj ){
                var _node_members = '';
                for( var i in _obj[s].members ){
                    _node_members += '<dd im-chat data-user-id="'+ _obj[s].members[i].user_id +'"  data-online="'+ _obj[s].members[i].online +'">'
                                        +'<span im-avatar=""><img src="'+ _obj[s].members[i].user_avatar +'"></span>'
                                        +'<span im-name="">'+ _obj[s].members[i].user_name +'</span>'
                                    +'</dd>';
                }
                _node_friends += '<dl im-org data-group-id="'+ _obj[s].group_id +'">'
                                    +'<dt>'+ _obj[s].group_name +'<span im-count>('+ _obj[s].online +'/'+ _obj[s].total +')</span></dt>'
                                    + _node_members
                                +'</dl>';
            }
            */
            var _node = IM.node.Panel;
            _node.friendlistbox.html(Node);

            //处理在线置顶显示
            _node.friendlistbox.find('dl[im-org]').each(function(){
                var _dom = $(this).find('dt').eq(0);
                $(this).find('dd[data-online=1]').each(function(){
                    _dom.after($(this));
                });
            });
        };
        IM.msg_getContactMember = function(_obj){
            /*获取分组成员 gid count id / name / avatar */
            //console.log(_obj)
            var _gid = _obj.gid;
            var _node_friends_DD = '';
            for( var s in _obj.list ){
                _node_friends_DD += '<dd im-chat data-id="'+ _obj.list[s].id +'" data-name="'+ _obj.list[s].name
                                        +'" data-avatar="'+ _obj.list[s].avatar +'">'
                                        +'<span im-avatar><img src="'+ _obj.list[s].avatar +'" /></span>'
                                        +'<span im-name>'+ _obj.list[s].name +'</span>'
                                    +'</dd>';
            }
            var _node = IM.node.Panel;
            _node.friendlistbox.find('dl[data-id='+ _gid +']').append(_node_friends_DD);
        };
        IM.msg_getGroup = function(_obj){
            IM.Data.groups = _obj;
            /* area  avatar_avatar  creater  group_id  group_name  online  private  total  */
            var _node_groups = '';
            if(_obj.length){
                for( var s in _obj ){
                    _node_groups += '<li im-chat="group" data-group-id="'+ _obj[s].group_id
                        +'" data-avatar="'+ _obj[s].avatar_avatar
                        +'" data-name="'+ _obj[s].group_name +'">'
                        +'<span im-avatar><img src="'+ _obj[s].avatar_avatar +'" /></span>'
                        +'<span im-name>'+ _obj[s].group_name +'</span>'
                        +'</li>';
                }
            }else{
                _node_groups = '<li class="none">外面的圈子好精彩，<a href="javascript:;">我也来加个</a></li>';
            }

            var _node = IM.node.Panel;
            _node.groups.html(_node_groups);
        };
        IM.msg_getGroupMember = function(_obj){
            /**  group_id  list[]  online  total  **/
            //console.log('待定操作');
            var _node = IM.node.Chat,Node='',_cellDom = '';
            /*
            * <dd data-online="0" data-name="李小龙" data-avatar="http://ckg.estt.com.cn//avatar/8/8.png" data-user-id="8" im-chat="user">
            *     <span im-avatar=""><img src="http://ckg.estt.com.cn//avatar/8/8.png"></span>
            *     <span im-name="">李小龙</span></dd>
            * */
            if( _obj.list.length ){
                for(var s in _obj.list){
                    _cellDom = _cellDom + '<li data-online="'+_obj.list[s].online+'" data-name="'+_obj.list[s].user_name+'" '
                        +'data-avatar="'+_obj.list[s].user_avatar+'"'
                        +'data-user-id="'+_obj.list[s].user_id+'" im-chat="user">'
                        +'<span im-avatar><img src="'+_obj.list[s].user_avatar+'"></span>'
                        +'<span im-name>'+_obj.list[s].user_name+'</span>'
                        +'</li>';
                }
                Node = '<dl data-id="'+_obj.group_id+'"><dt>群成员('+_obj.online+'/'+_obj.total+')</dt><dd><ul>'+_cellDom+'</ul></dd></dl>';
            }else{
                Node = '空数据';
            }
            _node.viewGroupMembers.find('[im-viewLoading]').eq(0).fadeOut();
            _node.viewGroupMembers.append(Node);
            //console.log(Node)
        };
        IM.msg_pullMessage = function(_obj){
            var _index,_chatType,_lastID,Node='',_node = IM.node.Chat;
            if( !_obj.gid ){
                _chatType = 'user';
                _index = IM.getObjIndexChating( _obj.to,_chatType);
            }else{
                _chatType = 'group';
                _index = IM.getObjIndexChating( _obj.gid,_chatType);
            }
            var _o = IM.Chating.list[_index];
            _lastID = _obj.last_id;

            var _oDom = _node.viewArea.find('[data-id=' + _o.id + '][data-chatType=' + _chatType + ']').eq(0);
            if(_oDom.attr('data-page')=='init' && _obj.list.length == 0){
                //新会话，未曾有过聊天记录
                Node = '';
                _oDom.prepend(Node);
            }else{
                if (_lastID) {
                    Node = '<mark data-lastID="' + _lastID + '"><i></i>查看更多消息</mark>';
                } else {
                    //已无更多消息
                    Node = '<mark>已无更多消息！</mark>';
                    //return false;
                }
                var _cacheTime = new Date(), _timeNode = '', _cellDom = '';
                for (var s in _obj.list) {
                    var _Time = new Date(parseInt(_obj.list[s].created) * 1000);  //服务器返回的时间戳为 秒数
                    var _content, _from, _avatar, _name = '';
                    _content = _obj.list[s].content;
                    if (_obj.list[s].from == IM.User.uid) {
                        _from = 'self';
                        _avatar = IM.User.avatar;
                    } else {
                        _from = 'non';
                        _avatar = _o.avatar;
                        if (_chatType == 'group')_name = '<p im-name>' + '未绑定姓名' + '</p>';
                    }
                    console.log(_name)
                    //时间处理
                    var _timeString;
                    //判断是否当日
                    var _nowTime = new Date(), _YMD = '';
                    if (_Time.getMonth() == _nowTime.getMonth() && _Time.getDate() == _nowTime.getDate()) {
                        _YMD = '';
                    } else {
                        _YMD = IM.getTimeYMD(_Time) + '&nbsp;&nbsp;';
                    }
                    if (s != (_obj.list.length - 1)) {
                        if (Math.floor(_cacheTime.getTime() / 1000) - Math.floor(_Time.getTime() / 1000) > 5) {
                            _timeString = IM.getTimeHMS(_Time);
                            _timeNode = '<p class="time">-- ' + _YMD + _timeString + ' --</p>';
                        } else {
                            _timeNode = '';
                        }
                    } else {
                        _timeString = IM.getTimeHMS(_Time);
                        _timeNode = '<p class="time">-- ' + _YMD + _timeString + ' --</p>';
                    }
                    /*
                     if( _chatType == 'group'){
                     _cellDom = '<div data-time="'+_obj.list[s].created+'" class="'+_from+'">'
                     +'<span im-avatar><img src="'+_avatar+'"></span>'
                     +'<p im-name>'+ '假设名' +'</p>'
                     +'<div im-log><p>'+_content+'</p><i im-resend></i></div></div>'
                     +_cellDom;
                     }else{
                     _cellDom = '<div data-time="'+_obj.list[s].created+'" class="'+_from+'">'
                     +'<span im-avatar><img src="'+_avatar+'"></span>'
                     +'<div im-log><p>'+_content+'</p><i im-resend></i></div></div>'
                     +_cellDom;
                     }

                     if( s != 0 ) _cellDom = _timeNode + _cellDom;*/

                    if (s == 0) {
                        _cellDom = '<div data-time="' + _obj.list[s].created * 1000 + '" class="' + _from + '"><span im-avatar><img src="' + _avatar + '"></span>' + _name + '<div im-log><p>' + _content + '</p><i im-resend></i></div></div>' + _cellDom;
                    } else {
                        _cellDom = _timeNode + '<div data-time="' + _obj.list[s].created * 1000 + '" class="' + _from + '"><span im-avatar><img src="' + _avatar + '"></span>' + _name + '<div im-log><p>' + _content + '</p><i im-resend></i></div></div>' + _cellDom;
                    }

                    _cacheTime = _Time;
                }
                Node = Node + _cellDom + '<span imchat-scrollintoview></span>';
                //var _oDom = _node.viewArea.find('[data-id=' + _o.id + '][data-chatType=' + _chatType + ']').eq(0);
                _oDom.find('mark[data-lastID]').eq(0).remove();
                if (!_oDom.html()) {
                    Node = Node + '<p class="time">--&nbsp;&nbsp;以上是历史消息&nbsp;&nbsp;--</p>';
                }
                _oDom.prepend(Node);
                //滑动
                _oDom.find('[imchat-scrollintoview]').get(0).scrollIntoView(false);
                _oDom.find('[imchat-scrollintoview]').get(0).remove();

                if (_oDom.attr('data-page') == 'init') {
                    _node.viewArea.find('[imchat-scrollintoview]').get(0).scrollIntoView(false);
                    _oDom.attr('data-page', '0');
                } else {
                    var _page = parseInt(_oDom.attr('data-page')) + 1;
                    _oDom.attr('data-page', _page);
                }
            }
        };
        IM.msg_newMessage = function(_obj){
            var _chatType,_oid,_fid,_isChating = false,_o,_isUnread = false,_name ='';
            if( parseInt(_obj.gid) != 0 ){
                _chatType = 'group';
                _oid = _obj.gid;
                _fid = _obj.from;
            }else{
                _chatType = 'user';
                _oid = _fid = _obj.from;
            }
            //判断消息对象，是否存在当前的会话列表中
            if( IM.Chating ){
                for( var s in IM.Chating.list ){
                    if( IM.Chating.list[s].id == _oid && IM.Chating.list[s].chatType == _chatType ){
                        _isChating = true;
                        _o = IM.Chating.list[s];
                        break;
                    }
                }
            }

            //存在，即，不需在主面板提醒【判断会话是否最小化，判断会话是否激活中】
            //不存在，即，需在主面板提醒
            if( _isChating ){
                var _nowTime  = new Date(),_Chat = IM.node.Chat;
                var _ulDom = _Chat.viewArea.find('[data-id='+ _o.id +'][data-chatType='+ _o.chatType +']');
                //与前面消息的时间进行对比,是否超过1分钟
                var _timeNode = '';
                console.log(Math.floor(_nowTime.getTime()/1000) - Math.floor(parseInt(_ulDom.attr('data-time'))/1000) +'s时差')
                if( Math.floor(_nowTime.getTime()/1000) - Math.floor(parseInt(_ulDom.attr('data-time'))/1000) > 5 ){
                    var _timeString = IM.getTimeHMS(_nowTime);
                    _timeNode = '<p class="time">-- '+ _timeString +' --</p>';
                }
                //名称
                if( _chatType == 'group') _name = '<p im-name>'+ _obj.name +'</p>';
                //填充消息展示
                var Node = _timeNode + '<div class="non"><span im-avatar><img src="'+ _o.avatar +'" /></span>'+ _name +'<div im-log>'+ _obj.content +'</div></div>';
                _ulDom.append(Node);
                //判断会话是否激活中
                if( IM.Chating.active.id == _o.id && IM.Chating.active.chatType == _o.chatType ){
                    _Chat.viewArea.find('[imchat-scrollintoview]').get(0).scrollIntoView(false); //消息容器滚动底部，该方法需要设置一个DOM层，类似锚点的作用
                    //return false;
                }else{
                    _Chat.chatList.find('[data-id='+ _o.id +'][data-chatType='+ _o.chatType +']').eq(0).addClass('unread');
                }
                //判断会话是否最小化
                if( _Chat.Min.css('display') == 'block'){
                    _Chat.Min.find('[imchating-user]').html( '您有新消息...');
                }
            }else{
                var _Panel = IM.node.Panel,_isRecord = false,_wid;
                //处理最近联系, 群消息  用户消息 系统消息 社区经理消息
                //判断当前消息的主体，是否存在未读的记录
                if( parseInt(_obj.gid) == 0 ) _wid = IM.getChatObjID( _obj.from,_obj.to);
                if( IM.getIndexUnread(_obj.gid,_wid) || parseInt(IM.getIndexUnread(_obj.gid,_wid)) == 0){
                    console.log('存在unread');
                    _isRecord =true;
                }
                console.log(IM.getIndexUnread(_obj.gid,_wid));
                console.log(_isRecord);
                if( !_isRecord ) IM.Data.unread.push(_obj);
                IM.msgReminder();
                _isUnread = true;
            }
            //console.log(_isUnread)
            IM.updateRclist(_obj,_isUnread);
        };
        IM.msg_sendMessage = function(_obj){
            /*
            * avatar content created gid name status to
            * */
            var _index,_chatType;
            if( !_obj.gid ){
                _chatType = 'user';
                _index = IM.getObjIndexChating( _obj.to,_chatType);
            }else{
                _chatType = 'group';
                _index = IM.getObjIndexChating( _obj.gid,_chatType);
            }
            var _cacheList = IM.Chating.list[_index].sendCache,_cache,_s;
            for( var s in _cacheList ){
                var _cacheTime = new Date(parseInt(_cacheList[s].created));
                var _Time = new Date( parseInt( _obj.created )*1000);
                var _Minu = _Time.getMinutes() - _cacheTime.getMinutes();
                //console.log( _cacheList[s].content +'--' + _obj.content)
                //console.log( _Time.getMinutes() + '**' + _cacheTime.getMinutes() + '**' +_Minu)
                //console.log(_Minu);
                //假设时间在1分钟内
                _Minu = 1;
                if( _cacheList[s].content == _obj.content && _Minu <= 1 ){
                    _cache = _cacheList[s];
                    _s = s;
                    break;
                }
            }
            console.log(_cache)
            if( _cache ){
                var _node = IM.node.Chat,_id;
                ( _chatType == 'user')?_id = _obj.to: _id = _obj.gid;
                _node.viewArea.find('[data-id='+ _id +'][data-chatType='+ _chatType +']').eq(0).find('.self.sending').each(function(){
                    var _content = $(this).find('[im-log] p').eq(0).html();
                    var _time = $(this).attr('data-time');
                    //console.log('内容：'+_content +'/_cache内容：'+ _cache.content)
                    //console.log('时间：'+_time +'/_cache时间：'+_cache.created)
                    //内容与时间戳，必须一致才匹配
                    if( _cache.content == _content && _cache.created == _time ){
                        $(this).removeClass('sending');
                        //更新最近聊天记录//结构大体与最近联系人结构一致
                        var _JSON = {
                            'from': IM.User.uid,
                            'gid': _cache.gid,
                            'to': _cache.to,
                            'content':_cache.content,
                            'created':_cache.created,
                            'avatar': _cache.avatar,
                            'name':_cache.name,
                            'time': _cache.time
                        };
                        IM.updateRclist(_JSON);
                    }else{
                        console.log('没找到对应的消息Dom')
                        console.log(_cache.content == _content)
                        console.log(_cache.created == _time)
                    }
                });
                //删除记录
                _cacheList.splice(_s,1);
                //判断是否激活中
                if( IM.Chating.active.id == _cache.id && IM.Chating.active.chatType == _cache.chatType) IM.Chating.active =  IM.Chating.list[_index];
            }else{
                console.log('该消息不存在缓存');
            }
        };
        IM.msg_error = function(_obj){
            /*
            switch(msg){
                case '发送目标不存在':
                    alert('发送目标不存在');
                    break;
                case '参数错误':
                    alert('参数错误');
                    break;
                default:
            }
            */
            switch(_obj.cmd){
                case 'login':
                    console.log('登录'+_obj.msg);
                    IM.node.Panel.loginTips.hide();
                    IM.node.Panel.loginError.show();
                    break;
                case 'sendMessage':
                    alert(_obj.msg);
                    break;
                default:
            }
        };
        //消息提醒
        IM.msgReminder = function(){
            //仅对未读消息统计，及通讯录(群组列表)的提醒
            //最近联系人列表中的具体对象提醒不在此实现
            var _node = IM.node.Panel;
            if( IM.Data.unread.length ){
                _node.nNode.addClass('unread').find('[im-msgTips] i').eq(0).html( IM.Data.unread.length );
                _node.tab_bar.find('[im-tab-id=rc]').eq(0).find('i').eq(0).html( IM.Data.unread.length );
            }else{
                _node.nNode.removeClass('unread').find('[im-msgTips] i').eq(0).html('');
                _node.tab_bar.find('[im-tab-id=rc]').eq(0).find('i').eq(0).html('');
            }
        };
        //主面板
        IM.Panel.draw = function(){
            //var _node_friendsList = _node_grounpsList = _node_rcList = '';
            var Node = '<div id="IM-Panel">'
                            +'<div im-loginTips><i></i><p>登录中...</p></div>'
                            +'<div im-loginError>用户信息错误，请刷新页面或尝试重新登录</div>'
                            +'<div im-masklayer></div>'
                            +'<div im-header>'
                                +'<div im-userInfo style="display:none"><span im-avatar><img src="" /></span><span im-name></span><span im-switch="show"></span></div>'
                                +'<div im-msgBox>消息<span im-msgTips><i></i></span></div>'
                            +'</div>'
                            +'<div im-tab style="display:none">'
                                +'<ul im-tab-bar>'
                                    +'<li im-tab-id="rc" class="on"><span></span><i>15</i><em></em></li>'
                                    +'<li im-tab-id="friends" class=""><span></span><em></em></li>'
                                    +'<li im-tab-id="groups" class=""><span></span><em></em></li>'
                                +'</ul>'
                                +'<div im-tab-con>'
                                    +'<div im-tab-id="rc" class="items on"><ul></ul></div>'
                                    +'<div im-tab-id="friends" class="items">'
                                        +'<!--div im-add-friend><i></i>新的朋友</div-->'
                                        +'<div im-friendListBox>'
                                            +'<dl im-org class="">'
                                                +'<dt>默认分组<span im-count>(0/0)</span></dt>'
                                            +'</dl>'
                                        +'</div>'
                                    +'</div>'
                                    +'<div im-tab-id="groups" class="items"><ul></ul></div>'
                                +'</div>'
                            +'</div>'
                        +'</div>';
            $('body').append(Node);
            IM.node = {};
            IM.node.Panel = {
                nNode:$('#IM-Panel'),
                loginTips:$('#IM-Panel > [im-loginTips]').eq(0),
                loginError:$('#IM-Panel > [im-loginError]').eq(0),
                masklayer:$('#IM-Panel > [im-masklayer]').eq(0),
                userinfo:$('#IM-Panel > [im-header] > [im-userInfo]').eq(0),
                toMin:$('#IM-Panel > [im-header] [im-switch]').eq(0),
                msgbox:$('#IM-Panel > [im-header] > [im-msgBox]').eq(0),
                tab:$('#IM-Panel > [im-tab]').eq(0),
                tab_bar:$('#IM-Panel > [im-tab] > ul[im-tab-bar]').eq(0),
                tab_con:$('#IM-Panel [im-tab-con]').eq(0),
                rc:$('#IM-Panel [im-tab-id=rc] > ul').eq(0),
                friends:$('#IM-Panel [im-tab-con] [im-tab-id="friends"]').eq(0),
                groups:$('#IM-Panel [im-tab-con] [im-tab-id="groups"] > ul').eq(0),
                friendlistbox:$('#IM-Panel [im-tab-con] [im-tab-id="friends"] [im-friendlistbox]').eq(0),
                mark:$('#IM-Panel dl[im-org] > dt')
            };
        };
        IM.Panel.event = function(){
            var _node = IM.node.Panel;
            //toMin
            _node.toMin.on('click',function(){
                _node.tab.stop(true,false).slideUp(function(){
                    _node.userinfo.hide();
                    _node.msgbox.show();
                });
            });
            //toShow
            _node.msgbox.on('click',function(){
                $(this).hide();
                _node.userinfo.show();
                _node.tab.stop(true,false).slideDown();
            });
            //tab
            _node.tab_bar.delegate('li','click',function(e){
                console.log(IM.ws.readyState);
                var _tab_id = $(this).attr('im-tab-id');
                _node.tab_con.find('.items[im-tab-id='+ _tab_id +']').addClass('on').siblings('.items').removeClass('on');
                $(this).addClass('on').siblings('li').removeClass('on');
                if( !IM.Data[_tab_id] ){
                    switch( _tab_id ){
                        case 'rc':
                            break;
                        case 'friends':
                            IM.ws.send(JSON.stringify({'cmd':'getContactGroup'}));
                            break;
                        case 'groups':
                            IM.ws.send(JSON.stringify({'cmd':'getGroup','data':{'gid':IM.User.uid}}));
                            break;
                        default:
                            console.log('错误');
                            break;
                    }
                }
                e.stopPropagation();
            });
            //伸展分组
            //_node.Panel_mark.on('click',function(){
            _node.friendlistbox.delegate('dt','click',function(e){
                var _Pdom = $(this).parent('dl');
                var _id = _Pdom.attr('data-id');
                var _Data = IM.Data.friends;
                //console.log(77)
                //查询 IM.Data 是否已缓存
                for( var s in _Data ){
                    if( _Data[s].id == _id && !_Data[s].iscache ){
                        //console.log('需要请求单组成员数据')
                    }
                }
                if( _Pdom.hasClass('show') ){
                    _Pdom.removeClass('show');
                }else{
                    _Pdom.addClass('show');
                }
                e.stopPropagation();
            });
            //Open Chat
            _node.tab_con.delegate('[im-chat]','dblclick',function(e){
                //console.log('open');
                IM.Chat.draw($(this));
                e.stopPropagation();
            });
        };
        //会话
        IM.Chat.draw = function(_dom){
            /*这里统一将 user-id 与 group-id 转为 id */
            /* 下面打开会话窗口时，绑定的时间戳为当前的，合理上，必须是服务器返回的消息时间戳 */
            var _o = {};
            var _type = _dom.attr('im-chat');
            var _key_attr = '';
            _o.name = _dom.attr('data-name');
            _o.avatar = _dom.attr('data-avatar');
            _key_attr += 'data-name="'+ _o.name +'"';
            switch(_type){
                case 'user':
                    _o.id = _dom.attr('data-user-id');
                    _o.chatType = 'user';
                    break;
                case 'group':
                    _o.id = _dom.attr('data-group-id');
                    _o.chatType = 'group';
                    break;
                case 'rc':
                    if( parseInt(_dom.attr('data-gid')) != 0 ){
                        console.log(_dom)
                        _o.id = _dom.attr('data-gid');
                        _o.chatType = 'group';
                        _o.from = _dom.attr('data-from');
                    }else if( parseInt(_dom.attr('data-user-id')) != 0 ){
                        var _to = _dom.attr('data-to');
                        var _from = _dom.attr('data-from');
                        if( _from == IM.User.uid ){
                            _o.id = _to;
                        }else{
                            _o.id = _from;
                        }
                        _o.chatType = 'user';
                    }
                    break;
                default:
                    return false;
            }
            _key_attr += ' data-id="'+ _o.id +'" data-chatType="'+ _o.chatType +'"';
            //console.log(_o);
            //console.log(_key_attr);
            //return false;
            var _node = IM.node.Chat,_groupList='';
            //判断是否已经存在会话主体
            if( _node ){
                if( _node.nNode.css('display')=='none' ){
                    _node.nNode.show();
                    _node.Min.hide();
                }
                //判断是否已经存在即将进行的该会话
                if( _node.chatList.find('li[data-chatType='+ _o.chatType +'][data-id='+ _o.id +']').length ){
                    //切换对话
                    //console.log('存在');
                    IM.tabChat(_o.id,_o.chatType);
                }else{
                    //添加对话
                    //console.log('un存在');
                    if( !_node.nNode.hasClass('multi'))_node.nNode.addClass('multi');
                    var Node = '<li class="on" data-chatType="'+ _o.chatType +'" data-id="'+ _o.id +'"><span im-avatar><img src="'+ _o.avatar +'" /></span><span im-name>'+ _o.name +'</span><i imchat-unread></i><i imchat-close></i></li>';
                    _node.chatList.prepend(Node);


                    //添加信息内容,默认显示最后一条//判断发送者是谁
                    var _msgFrom = '',_msgNode = '',_nowTime = new Date();
                    if( _dom.attr('data-from') == IM.User.uid )_msgFrom = 'self';
                    /*
                    if( _type == 'rc' ){
                        _msgNode = '<div class="'+ _msgFrom +'">'
                            +'<span im-avatar=""><img src="'+_o.avatar+'"></span>'
                            +'<div im-log=""><p>'+ _dom.find('[im-msg]').eq(0).html() +'</p></div>'
                            +'</div>';
                    }
                    */
                    Node = '<article imchat-view data-chatType="'+ _o.chatType +'" data-id="'+ _o.id +'" data-time="'+ _nowTime.getTime() +'" data-page="init" data-sended="false">' + _msgNode +'</article>';
                    _node.viewArea.prepend(Node);
                    //
                    IM.pullLastHistory(_o);
                    //添加聊天记录视窗
                    Node = '<article imhistory-view data-chatType="'+ _o.chatType +'" data-id="'+ _o.id +'" data-page="init" data-getPage="init" data-totalPage="init">'
                        +'</article>';
                    _node.viewHistory_Box.prepend(Node);

                    //判断是否添加群组成员外层DOM
                    if(_o.chatType=='group'){
                        _node.nNode.removeClass('user').addClass('group');
                        _node.viewGroupMembers.find('dl[data-id]').hide();
                        IM.getGroupMembers(_o.id);
                        _node.viewGroupMembers.find('[im-viewLoading]').eq(0).fadeIn();
                    }

                    //切换对话
                    _o.sendCache = _o.getHistoryCache = [];
                    IM.Chating.list.push(_o);
                    IM.tabChat(_o.id,_o.chatType);

                    //改变未读状态
                    IM.toReaded(_dom);
                }
            }else{

                //添加信息内容,默认显示最后一条//判断发送者是谁
                var _msgFrom = 'non',_msgNode ='',_nowTime = new Date();
                if( _dom.attr('data-from') == IM.User.uid )_msgFrom = 'self';
                /*
                if( _type == 'rc' ){
                    _msgNode = '<div class="'+ _msgFrom +'">'
                        +'<span im-avatar=""><img src="'+_o.avatar+'"></span>'
                        +'<div im-log=""><p>'+ _dom.find('[im-msg]').eq(0).html() +'</p></div>'
                        +'</div>';
                }
                */
                var Node = '<div id="IM-Chat" class="'+ _o.chatType +'">'
                    +'<ul imchat-list>'
                    +'<li data-chatType="'+ _o.chatType +'" data-id="'+ _o.id +'"><span im-avatar><img src="'+ _o.avatar +'" /></span><span im-name>'+ _o.name +'</span><i imchat-unread></i><i imchat-close></i></li>'
                    +'</ul>'
                    +'<div imchat-type="" imchat-box '+ _key_attr +'>'
                    +'<div imchat-header>'
                    +'<div imchat-cmAction><span ac-type="more"></span><span ac-type="min"></span><span ac-type="close"></span></div>'
                    +'<div imchat-info data-chat-type="">'
                    +'<span im-avatar><img src="'+ _o.avatar +'" /></span>'
                    +'<span im-name>'+ _o.name +'</span>'
                    +'</div>'
                    +'</div>'
                    +'<div imchat-main>'
                    +'<section imchat-viewArea>'
                    +'<article imchat-view data-chatType="'+ _o.chatType +'" data-id="'+ _o.id +'" data-time="'+ _nowTime.getTime() +'" data-page="init" data-sended="false">'
                    + _msgNode
                    +'</article>'
                    +'<span imchat-scrollintoview=""></span>'
                    +'</section>'
                    +'<div imchat-editTools>'
                    +'<em class="fontSize"></em><em class="face"></em>'
                    +'<em class="uploadImg"><!--input type="file" value="" single accept="image/gif,image/png,image/jpg,image/jpeg" /--></em>'
                    +'<em class="uploadFile"></em>'
                    +'<a imchat-recordBtn href="javascript:;"><i></i>聊天记录</a>'
                    +'</div>'
                    +'<div imchat-editWrap>'
                    +'<textarea imchat-Edit></textarea>'
                    +'<span imchat-Send>发送</span>'
                    +'</div>'
                    +'</div>'
                    +'</div>'
                    +'<section imchat-viewHistory>'
                    +'<div im-viewBox>'
                        +'<div im-viewLoading><span im-viewIcon></span><em></em></div>'
                    +'<article imhistory-view data-chatType="'+ _o.chatType +'" data-id="'+ _o.id +'" data-page="init" data-getPage="init" data-totalPage="init">'
                    +'</article>'
                    +'<span imchat-scrollintoview=""></span>'
                    +'</div>'
                    +'<div im-viewCtl data-page="init" data-getPage="init" data-totalPage="init">'
                        +'<span im-viewPage><em class="disable" data-Page="first"></em><em class="disable" data-Page="prev"></em><em class="disable" data-Page="next"></em><em class="disable" data-Page="last"></em></span>'
                    +'</div>'
                    +'</section>'
                    +'<section imchat-viewGroupMembers>'
                    +'<div im-viewLoading><span im-viewIcon></span><em></em></div>'
                    +'</section>'
                    +'</div>'
                    +'<div id="IM-Chat-Min"><em imchating-count></em><span imchating-user></span></div>';
                $('body').append(Node);
                //添加会话发送缓存记录
                _o.sendCache = _o.getHistoryCache = [];
                IM.node.Chat = {};
                IM.Chating = [];//存储对话中的对象数据
                IM.Chating = {
                    active: _o,
                    list: [_o]
                };
                //IM.Chating.push(_o);
                $.extend(IM.node.Chat,{
                    nNode:$('#IM-Chat'),
                    cmAct:$('#IM-Chat [imchat-cmAction]').eq(0),
                    chatList:$('#IM-Chat > ul[imchat-list]').eq(0),
                    chatMain:$('#IM-Chat > [imchat-box]'),
                    chatInfo:$('#IM-Chat > [imchat-box] > [imchat-header] > [imchat-info]').eq(0),
                    editTools:$('#IM-Chat [imchat-editTools]').eq(0),
                    viewArea:$('#IM-Chat [imchat-viewArea]').eq(0),
                    editBox:$('#IM-Chat [imchat-editWrap] > [imchat-Edit]').eq(0),
                    send:$('#IM-Chat [imchat-editWrap] > [imchat-Send]').eq(0),
                    recordBtn:$('#IM-Chat [imchat-recordBtn]').eq(0),
                    viewHistory_Box:$('#IM-Chat > [imchat-viewHistory] > [im-viewBox]').eq(0),
                    viewGroupMembers:$('#IM-Chat > [imchat-viewGroupMembers]').eq(0),
                    viewHistory_Ctl:$('#IM-Chat > [imchat-viewHistory] > [im-viewCtl]').eq(0),
                    Min:$('#IM-Chat-Min')
                });

                //判断是否添加群组成员外层DOM
                if(_o.chatType=='group'){
                    var _node = IM.node.Chat;
                    _node.viewGroupMembers.find('dl[data-id]').hide();
                    IM.getGroupMembers(_o.id);
                }

                IM.Chat.event();
                //改变未读状态
                IM.toReaded(_dom);
                //
                IM.pullLastHistory(_o);
                //IM.node.Chat.viewArea.find('[imchat-scrollintoview]').get(0).scrollIntoView(false);

            }
        };
        IM.Chat.event = function(){
            var _node = IM.node.Chat;
            _node.cmAct.delegate('span','click',function(e){
                var _type = $(this).attr('ac-type');
                switch(_type){
                    case 'more':
                        alert('该功能模块即将推出，请期待！');
                        break;
                    case 'min':
                        console.log('最小化');
                        IM.chatToMin();
                        break;
                    case 'close':
                        if(_node.chatList.find('li').length==1){
                            IM.closeAllChat();
                            return false;
                        }
                        if( confirm('是否确定关闭所有会话?') ){
                            IM.closeAllChat();
                        }
                        break;
                    default:

                }
                e.stopPropagation();
            });
            //tab
            _node.chatList.delegate('li','click',function(e){
                var _id = $(this).attr('data-id');
                var _type = $(this).attr('data-chatType');
                IM.tabChat(_id,_type);
                e.stopPropagation();
            });
            //send
            _node.send.on('click',function(e){
                console.log('检测readyState:'+IM.ws.readyState);
                console.log('发送前检测bufferedAmount:'+IM.ws.bufferedAmount);

                var _node = IM.node.Chat;
                var _val = IM.htmlEncode($.trim(_node.editBox.val()));
                if(!_val){
                    alert('内容不能为空');
                    return false;
                }
                IM.sendMsg(_val);
                console.log('发送后检测bufferedAmount:'+IM.ws.bufferedAmount);
                e.stopPropagation();
            });
            //reSend
            _node.viewArea.delegate('.self.fail [im-log] [im-reSend]','click',function(e){
                console.log('检测readyState:'+IM.ws.readyState);
                console.log('重发前检测bufferedAmount:'+IM.ws.bufferedAmount);
                var _val = $(this).prev('p').html();
                var _dom = $(this).parents('.self.fail');
                if( _dom.prev().hasClass('time') ){
                    if( _dom.next().hasClass('time') || !_dom.next('div').length ){
                        _dom.prev().remove();
                    }
                }
                _dom.remove();
                IM.sendMsg(_val);
                console.log('重发后检测bufferedAmount:'+IM.ws.bufferedAmount);
                e.stopPropagation();
            });
            //editTools
            _node.editTools.delegate('em','click',function(e){
                var _type = $(this).attr('class');
                switch( _type ){
                    case 'fontSize':
                        alert('很抱歉，字体功能暂未开放！');
                        break;
                    case 'face':
                        alert('很抱歉，表情功能暂未开放！');
                        break;
                    case 'uploadImg':
                        alert('图片上传功能即将推出，敬请期待！');
                        break;
                    case 'uploadFile':
                        alert('很抱歉，文件上传功能暂未开放！');
                        break;
                    default:
                }
                e.stopPropagation();
            });
            //uploadImg
            _node.editTools.find('.uploadImg > input[type=file]').eq(0).on('change',function(e){
                console.log('***');
                var _ff = $(this).get(0).files[0];
                var reg = /((png)|(jpg)|(jpeg)|(gif))$/;
                if( !reg.test(_ff.type) ){
                    alert('请上传正确的图片文件');
                    return false;
                }
                console.log(_ff);
                /*
                 if( _ff.size > 1000000 ){
                 console.log(_ff.size)
                 alert('图片大小请不要超过1M');
                 return false;
                 }
                 */
                if(window.FileReader) {
                    var _file = new FileReader();
                    _file.onloadend = function(e){
                        //document.getElementById('images').src = e.target.result;
                        //console.log(e.target.result)
                    };
                    _file.readAsDataURL(_ff);
                }
                else {
                    console.log("Not supported by your browser!");
                }
            });
            //close
            _node.chatList.delegate('[imchat-close]','click',function(e){
                console.log('关闭当前会话');
                var _node = IM.node.Chat,
                    _dom = $(this).parent('li'),
                    _index = _dom.index(),
                    _id = _dom.attr('data-id'),
                    _type = _dom.attr('data-chatType'),
                    _list = IM.Chating.list,
                    _viewHistory = _node.viewHistory_Box.find('[imHistory-view][data-id='+_id+']').eq(0),
                    _nid,_ntype,_i;
                //判断会话是否超过1个
                if( _list.length > 1 ){
                    //判断是否激活中的会话
                    //是否存在2个以上的会话
                    if( _list.length > 2 ){
                        //判断是否激活中的会话
                        if( IM.Chating.active.id == _id ){
                            _list.length > ( _index +1 )? _index++:_index--;
                            _nid = _dom.parent('ul').find('li').eq(_index).attr('data-id');
                            _ntype = _dom.parent('ul').find('li').eq(_index).attr('data-chatType');
                            IM.tabChat(_nid,_ntype);
                        }
                    }else{
                        //判断是否激活中的会话
                        if( IM.Chating.active.id == _id ){
                            _list.length == ( _index +1 )? _index = 0:_index = 1;
                            _nid = _dom.parent('ul').find('li').eq(_index).attr('data-id');
                            _ntype = _dom.parent('ul').find('li').eq(_index).attr('data-chatType');
                            IM.tabChat(_nid,_ntype);
                        }
                        _node.nNode.removeClass('multi');
                    }
                    //删除
                    _i = IM.getObjIndexChating(_id,_type);
                    //return false;
                    _list.splice(_i,1);
                    _dom.remove();
                    _viewHistory.remove();
                    _node.viewArea.find('[data-id='+ _id +'][data-chatType='+ _type +']').remove();
                }else{
                    if( confirm('是否确定关闭所有会话?') ){
                        //关闭所有
                        IM.closeAllChat();
                    }
                }
                e.stopPropagation();
            });
            //loadmore
            _node.viewArea.delegate('mark[data-lastid]','click',function(e){
                console.log('检测readyState:'+IM.ws.readyState);
                var _lastID = $(this).attr('data-lastID');
                if(_lastID){
                    var _page = $(this).parents('article[data-id][imchat-view]').attr('data-page');
                    //IM.pullLastHistory(IM.Chating.active,_page,_lastID);
                    IM.pullLastHistory(IM.Chating.active,_lastID,_page);
                    console.log('检测bufferedAmount:'+IM.ws.bufferedAmount);
                }
                e.stopPropagation();
            });
            //view History
            _node.recordBtn.on('click',function(e){
                if(_node.nNode.hasClass('viewHistory')){
                    _node.nNode.removeClass('viewHistory');
                }else{
                    _node.nNode.addClass('viewHistory');
                    var _Dom = _node.viewHistory_Box.find('[imHistory-view][data-id='+IM.Chating.active.id+']').eq(0);
                    if(_Dom.find('[data-page]').length){
                        var _total = _Dom.attr('data-totalPage'),
                            _ctlDom = _node.viewHistory_Ctl;
                        _ctlDom.attr('data-totalPage',_total);
                        IM.tabViewHistory(IM.Chating.active.id);
                        /*
                        _Dom.find('[data-page='+_total+']').show().siblings('[data-page]').hide();

                        _ctlDom.attr('data-totalPage',_total).attr('data-page',_total).attr('data-getPage',_total);
                        //绑定翻页状态
                        _ctlDom.find('[data-page=next]').eq(0).addClass('disable');
                        _ctlDom.find('[data-page=last]').eq(0).addClass('disable');
                        if(_total == 0){
                            _ctlDom.find('[data-page=first]').eq(0).addClass('disable');
                            _ctlDom.find('[data-page=prev]').eq(0).addClass('disable');
                        }else{
                            _ctlDom.find('[data-page=first]').eq(0).removeClass('disable');
                            _ctlDom.find('[data-page=prev]').eq(0).removeClass('disable');
                        }
                        */
                        return false;
                    }
                    IM.getHistory(IM.Chating.active);
                    e.stopPropagation();
                }
            });
            //view History by Page
            _node.viewHistory_Ctl.delegate('em','click',function(e){
                //IM.getHistory(IM.Chating.active);
                if($(this).hasClass('disable'))return false;
                var _getPage,_id = IM.Chating.active.id,_total;

                var _Dom = _node.viewHistory_Box.find('[data-id='+_id+'][imHistory-view][data-chatType=user]').eq(0);
                var _ctlDom = $(this).parents('[im-viewCtl]');
                _total = _Dom.attr('data-totalPage');

                switch( $(this).attr('data-page')){
                    case 'first':
                        _getPage = 0;
                        break;
                    case 'prev':
                        _getPage = parseInt(_ctlDom.attr('data-page'))-1;
                        break;
                    case 'next':
                        _getPage = parseInt(_ctlDom.attr('data-page'))+1;
                        break;
                    case 'last':
                        //_getPage = parseInt(_ctlDom.attr('data-totalPage'));
                        _getPage = _total;
                        break;
                    default:
                }
                if( _getPage < 0 ) _getPage = 0;
                if( _getPage > _total ) _getPage = _total;
                //console.log('当前页：'+parseInt(_ctlDom.attr('data-page'))+'跳转页：'+_getPage);
                _Dom.attr('data-getPage',_getPage);

                if(_Dom.find('[data-page='+_getPage+']').length){

                    IM.tabViewHistory(IM.Chating.active.id,_getPage);
                    /*
                    _Dom.find('[data-page='+_getPage+']').eq(0).show().siblings('[data-page]').hide();
                    _Dom.attr('data-page',_getPage);
                    //绑定翻页状态
                    _ctlDom.attr('data-page',_getPage).attr('data-getPage',_getPage);
                    if(_Dom.attr('data-page')==_total){
                        _ctlDom.find('[data-page=next]').eq(0).addClass('disable');
                        _ctlDom.find('[data-page=last]').eq(0).addClass('disable');
                    }else{
                        _ctlDom.find('[data-page=next]').eq(0).removeClass('disable');
                        _ctlDom.find('[data-page=last]').eq(0).removeClass('disable');
                    }
                    if(_Dom.attr('data-page') == 0){
                        _ctlDom.find('[data-page=first]').eq(0).addClass('disable');
                        _ctlDom.find('[data-page=prev]').eq(0).addClass('disable');
                    }else{
                        _ctlDom.find('[data-page=first]').eq(0).removeClass('disable');
                        _ctlDom.find('[data-page=prev]').eq(0).removeClass('disable');
                    }
                    */
                    return false;
                }
                IM.getHistory(IM.Chating.active,_getPage);
                e.stopPropagation();
            });
            //恢复
            _node.Min.on('click',function(e){
                $(this).hide();
                _node.nNode.show();
                e.stopPropagation();
            });
            //与群组成员对话
            _node.viewGroupMembers.delegate('[im-chat]','dblclick',function(e){
                IM.Chat.draw($(this));
                e.stopPropagation();
            });
        };
        //获取群组成员
        IM.getGroupMembers = function(_gid){
            var _JSON = {
                'cmd':'getGroupMember',
                'data':{
                    'gid':_gid
                }
            };
            IM.ws.send(JSON.stringify(_JSON));
        };
        //更新用户上下线
        IM.updateUserState = function(_uid,_online){
            var _Panel = IM.node.Panel,_state;
            (_online=='online')?_state='1':_state='0';
            //更新面板
            var _nodePanel = _Panel.friendlistbox.find('dd[data-user-id='+_uid+']').eq(0);
            console.log(_nodePanel)
            var _Dom = _nodePanel.parent('dl');
            _nodePanel.attr('data-online',_state);
            if(_state){
                _Dom.find('dt').eq(0).after(_nodePanel);
            }else{
                console.log('****')
                _Dom.append(_nodePanel);
                console.log('****')
            }
            //更新会话列表
            //更新会话视窗
        };
        //
        IM.msg_getHistory = function(_obj){
            //目前仅可获取用户对象的聊天记录，因此类型默认 user
            var _data = IM.Chating.list[IM.getObjIndexChating(_obj.to,'user')];
            var _node = IM.node.Chat,_Dom,_ctlDom;
            _node.viewHistory_Box.find('[im-viewLoading]').eq(0).stop(true,false).fadeOut();
            _Dom = _node.viewHistory_Box.find('[imHistory-view][data-id='+_obj.to+']').eq(0);
            _ctlDom = _node.viewHistory_Ctl;

            if(!_obj.count)return false;

            //设置绑定对应DOM当前page数 & page总数
            _Dom.attr('data-page',_Dom.attr('data-getPage'));
            _ctlDom.attr('data-page',_Dom.attr('data-getPage'));
            //_Dom.attr('data-count',_obj.count);
            //换算page总数(序列),这里判断必须根据_Dom
            if(_Dom.attr('data-totalPage')=='init'){
                var _total = Math.ceil(_obj.count/10)-1;
                //_total < 0?_total=0:null;
                _Dom.attr('data-totalPage',_total).attr('data-getPage',_total).attr('data-page',_total);
                _ctlDom.attr('data-totalPage',_total).attr('data-getPage',_total).attr('data-page',_total);
            }
            //生成DOM
            var _cellDom = '',_cacheTime = new Date();
            for(var s in _obj.list){
                var _content = _obj.list[s].content,
                    _Time = new Date(parseInt(_obj.list[s].created)*1000),  //服务器返回的时间戳为 秒数
                    _from='',_name='';
                if( IM.User.uid == _obj.list[s].from){
                    _name = IM.User.name;
                    _from = 'self';
                }else{
                    _name = _data.name;
                }
                //时间处理
                var _timeString,_timeNode;
                _timeString = '<span>'+ IM.getTimeHMS(_Time)+'</span>';

                if( s == 0 ){
                    _timeNode = '<li class="time">'+ IM.getTimeYMD(_Time) +'</li>';
                }else{
                    if( _Time.getMonth() == _cacheTime.getMonth() && _Time.getDate() == _cacheTime.getDate()){
                        _timeNode = '';
                    }else{
                        _timeNode = '<li class="time">'+ IM.getTimeYMD(_cacheTime) +'</li>';
                    }
                }
                _cacheTime = _Time;
                _cellDom = _cellDom + _timeNode + '<li class="'+_from+'"><div im-info>'+ _name + '&nbsp;&nbsp;'+ _timeString +'</div>'
                    +'<p im-log>'+_content+'</p></li>';

                /*
                 if( _obj.list.length > 1){
                 //判断是否当日
                 if( _Time.getMonth() == _cacheTime.getMonth() && _Time.getDate() == _cacheTime.getDate()){
                 _timeNode = '';
                 }else{
                 _timeNode = '<li class="time">'+ IM.getTimeYMD(_cacheTime) +'</li>';
                 }
                 if( s == 0 ){
                 _cellDom = _timeNode + '<li class="'+_from+'"><div im-info>'+_obj.list[s].id+ _name + '&nbsp;&nbsp;'+ _timeString +'</div>'
                 +'<p im-log>'+_content+'</p></li>';
                 }else{
                 _cellDom = _cellDom+'<li class="'+_from+'"><div im-info>'+_obj.list[s].id+ _name + '&nbsp;&nbsp;'+ _timeString +'</div>'
                 +'<p im-log>'+_content+'</p></li>';
                 //if( s == _obj.list.length -1) _cellDom = '<li class="time">'+ IM.getTimeYMD(_Time) +'</li>' +_cellDom;
                 }
                 _cacheTime = _Time;
                 }else{
                 _cellDom = '<li class="'+_from+'"><div im-info>'+ _name + '&nbsp;&nbsp;'+ _timeString +'</div>'
                 +'<p im-log>'+_content+'</p></li>';
                 _cellDom = '<li class="time">'+ IM.getTimeYMD(_Time) +'</li>' +_cellDom;
                 }
                 */
            }
            var Node = '<ul data-page="'+_Dom.attr('data-getPage') +'">'+_cellDom+'</ul>';
            _Dom.prepend(Node);
            _Dom.find('[data-page='+_Dom.attr('data-getPage') +']').eq(0).show().siblings('[data-page]').hide();
            _node.viewHistory_Box.find('[imchat-scrollintoview]').get(0).scrollIntoView(false);
            var _totalPage = _Dom.attr('data-totalPage');
            //绑定翻页状态
            if(_Dom.attr('data-page')==_totalPage){
                _ctlDom.find('[data-page=next]').eq(0).addClass('disable');
                _ctlDom.find('[data-page=last]').eq(0).addClass('disable');
            }else{
                _ctlDom.find('[data-page=next]').eq(0).removeClass('disable');
                _ctlDom.find('[data-page=last]').eq(0).removeClass('disable');
            }
            if(_Dom.attr('data-page') == 0){
                _ctlDom.find('[data-page=first]').eq(0).addClass('disable');
                _ctlDom.find('[data-page=prev]').eq(0).addClass('disable');
            }else{
                _ctlDom.find('[data-page=first]').eq(0).removeClass('disable');
                _ctlDom.find('[data-page=prev]').eq(0).removeClass('disable');
            }

        };
        IM.getHistory = function(_ChatObj,_page,_limit){
            var _Gid,_To;
            if( _ChatObj.chatType == 'group'){
                _Gid = _ChatObj.id;
                _To = 0;
            }else{
                _Gid = 0;
                _To = _ChatObj.id;
            }
            if(!_limit)_limit=10;
            var _JSON = {
                'cmd':'getHistory',
                'data':{
                    'gid':_Gid,
                    'to':_To,
                    'page':_page,
                    'limit':10
                }
            };
            IM.ws.send(JSON.stringify(_JSON));
            //缓存请求记录[目前仅支持，用户可获取历史记录]
            var _node = IM.node.Chat;
            _node.viewHistory_Box.find('[im-viewLoading]').eq(0).stop(true,false).fadeIn();
            var _nowTime = new Date();
            _JSON = {
                'gid': _Gid,
                'to': _To,
                'created':_nowTime.getTime()
            };
            var _data = IM.Chating.list[IM.getObjIndexChating(_ChatObj.id,_ChatObj.chatType)];
            _data.getHistoryCache.push(_JSON);
            IM.Chating.active = _data;
        };
        //Func 发送 & 重新发送
        IM.sendMsg = function(_val){
            var _node = IM.node.Chat;
            var _o = IM.Chating.active,_gid=0,_to=0;
            switch(_o.chatType){
                case 'user':
                    _to = _o.id;
                    break;
                case 'group':
                    _gid = _o.id;
                    break;
                default:
            }

            var _JSON = {
                'cmd':'sendMessage',
                'data':{
                    'gid': _gid,
                    'to': _to,
                    'content':_val
                }
            };
            IM.ws.send(JSON.stringify(_JSON));

            //时间处理
            var _nowTime  = new Date();
            var _timeString = IM.timeDiff(_nowTime,_nowTime);
            var _ulDom = _node.viewArea.find('[data-id='+ IM.Chating.active.id +'][data-chatType='+ IM.Chating.active.chatType +']');
            console.log( Math.floor(_nowTime.getTime()/1000) - Math.floor(parseInt(_ulDom.attr('data-time'))/1000)+'s时差' )
            //与前面消息的时间进行对比,是否超过1分钟
            var _timeNode = '';
            if(_ulDom.attr('data-sended')=='false'){
                _ulDom.attr('data-sended','true');
                _timeNode = '<p class="time">-- '+ IM.getTimeHMS(_nowTime) +' --</p>';
            }else if( Math.floor(_nowTime.getTime()/1000) - Math.floor(parseInt(_ulDom.attr('data-time'))/1000) > 5 ){
                _timeNode = '<p class="time">-- '+ IM.getTimeHMS(_nowTime) +' --</p>';
            }
            //消息展示处理
            var Node = _timeNode + '<div class="self sending" data-time="'+_nowTime.getTime()+'"><span im-avatar><img src="'+ IM.User.avatar +'" /></span><div im-log><p>'+ _val +'</p><i im-reSend></i></div></div>';
            _ulDom.attr('data-time',_nowTime.getTime()).append(Node);
            //_node.viewArea.find('ul[data-id='+ IM.Chating.active.id +'][data-chatType='+ IM.Chating.active.chatType +']').append(Node);
            _node.viewArea.find('[imchat-scrollintoview]').get(0).scrollIntoView(false); //消息容器滚动底部，该方法需要设置一个DOM层，类似锚点的作用

            //清空编辑区
            _node.editBox.val('').focus();

            //缓存发送记录
            console.log(IM.getObjIndexChating(_o.id,_o.chatType));

            _JSON = {
                'gid': _gid,
                'to': _to,
                'content':_val,
                'created':_nowTime.getTime(),
                'name':_o.name,
                'avatar':_o.avatar,
                'time': _timeString
            };
            var _data = IM.Chating.list[IM.getObjIndexChating(_o.id,_o.chatType)];
            _data.sendCache.push(_JSON);
            IM.Chating.active = _data;
        };
        IM.tabChat = function(_id,_type){
            //这里会出现，组ID与用户ID重复
            //切换对话列表
            var _node = IM.node.Chat;
            _node.chatList.find('[data-chatType='+ _type +'][data-id='+ _id +']').addClass('on').removeClass('unread').siblings('li').removeClass('on');
            var _o = {};
            for( var s in IM.Chating.list ){
                if( IM.Chating.list[s].chatType == _type && IM.Chating.list[s].id == _id ){
                    _o = IM.Chating.list[s];
                    break;
                }
            }
            if( !_o ) console.log('对象为空');
            //激活会话对象
            IM.Chating.active = _o;
            //渲染数据
            _node.chatInfo.find('[im-avatar] img').eq(0).attr('src',_o.avatar);
            _node.chatInfo.find('[im-name]').html(_o.name);

            //切换会话主体信息
            _node.chatMain.attr('data-chatType',_type);
            _node.chatMain.attr('data-id',_id);

            //切换对话记录展示区
            _node.viewArea.find('[data-chatType='+ _type +'][data-id='+ _id +']').show().siblings('[imchat-view]').hide();
            _node.viewArea.find('[imchat-scrollintoview]').get(0).scrollIntoView(false); //消息容器滚动底部，该方法需要设置一个DOM层，类似锚点的作用

            //清空对话编辑框内容
            _node.editBox.val('');
            _node.editBox.val('').focus();

            //默认关闭“历史记录”视窗，并切换
            _node.viewHistory_Box.find('[data-chatType='+ _type +'][data-id='+ _id +']').show().siblings('[imHistory-view]').hide();
            _node.viewHistory_Ctl.attr('data-id',_id).attr('data-totalPage','init').attr('data-getPage','init').attr('data-page','init');
            _node.nNode.removeClass('viewHistory');

            //切换群组成员视窗
            _node.nNode.removeClass('user').removeClass('group').addClass(_type);
            _node.viewGroupMembers.find('[data-id='+_id+']').show().siblings('[data-id]').hide();
            _node.viewGroupMembers.find('[im-viewLoading]').fadeOut();
        };
        //切换历史消息
        IM.tabViewHistory = function(_id,_page){
            var _node = IM.node.Chat,
                _Dom = _node.viewHistory_Box.find('[data-id='+_id+'][imHistory-view][data-chatType=user]').eq(0),
                _ctlDom = _node.viewHistory_Ctl,
                _total = _Dom.attr('data-totalPage'),
                _getPage;
            if( _page || _page == 0){
                _getPage = _page;
            }else{
                _getPage = _Dom.attr('data-totalPage');
            }
            //绑定翻页状态
            _Dom.attr('data-page',_getPage);
            _ctlDom.attr('data-page',_getPage).attr('data-getPage',_getPage);
            if(_Dom.attr('data-page')==_total){
                _ctlDom.find('[data-page=next]').eq(0).addClass('disable');
                _ctlDom.find('[data-page=last]').eq(0).addClass('disable');
            }else{
                _ctlDom.find('[data-page=next]').eq(0).removeClass('disable');
                _ctlDom.find('[data-page=last]').eq(0).removeClass('disable');
            }
            if(_Dom.attr('data-page') == 0){
                _ctlDom.find('[data-page=first]').eq(0).addClass('disable');
                _ctlDom.find('[data-page=prev]').eq(0).addClass('disable');
            }else{
                _ctlDom.find('[data-page=first]').eq(0).removeClass('disable');
                _ctlDom.find('[data-page=prev]').eq(0).removeClass('disable');
            }
            _Dom.find('[data-page='+_getPage+']').show().siblings('[data-page]').hide();
            _node.viewHistory_Box.find('[imchat-scrollintoview]').get(0).scrollIntoView(false);
        };
        IM.chatToMin = function(){
            var _node = IM.node.Chat;
            _node.nNode.hide();
            _node.Min.show();
            _node.Min.find('[imchating-count]').eq(0).html( IM.Chating.list.length );
            _node.Min.find('[imchating-user]').eq(0).html( IM.Chating.active.name );

            //未做，未读消息的处理，与新消息进来的
            if( _node.chatList.find('li.unread').length ){
                _node.Min.find('[imchating-user]').eq(0).html('您有未读消息...');
            }

        };
        IM.closeAllChat = function(){
            var _node = IM.node.Chat;
            _node.Min.remove();
            _node.nNode.remove();
            delete IM.node.Chat;
            delete IM.Chating;
        };
        //切换成已读状态
        IM.toReaded = function(_dom){
            var _from = _dom.attr('data-from'),
                _to = _dom.attr('data-to'),
                _gid = _dom.attr('data-gid'),_wid;
            if( parseInt(_gid)==0){
                //与自己的信息做对比,得出会话对象
                _wid = IM.getChatObjID(_from,_to);
            }
            //(_from == IM.User.uid)? _wid = _to : _wid = _from;
            var _index = IM.getIndexUnread(_gid,_wid);
            if( _index || _index == 0){
                IM.Data.unread.splice(_index,1);
            }
            _dom.removeClass('unread');
            IM.msgReminder();
        };
        //获取会话对象的id，用于普通用户,非群
        IM.getChatObjID = function(_from,_to){
            var _wid = false;
            (_from == IM.User.uid)? _wid = _to : _wid = _from;
            return _wid;
        };
        //获取缓存数据中指定的未读对象索引
        IM.getIndexUnread = function(_gid,_wid){
            var _data = IM.Data.unread,_cache = false;
            /* gid to from */
            if( parseInt(_gid) != 0 ){
                for( var s in _data ){
                    if( _data[s].gid == _gid ) return _cache = s;
                }
            }else{
                for( var s in _data ){
                    if( _data[s].from == _wid || _data[s].to == _wid ) return _cache = s;
                }
            }
        };
        //获取会话中的某个对象的索引
        IM.getObjIndexChating = function(_id,_chatType){
            for( var s in IM.Chating.list ){
                if( IM.Chating.list[s].id == _id && IM.Chating.list[s].chatType == _chatType ){
                    return s;
                    break;
                }
            }
        };
        //更新最近联系人列表，用于联系人改变时
        IM.updateRclist = function(_JSON,_isUnread){
            //console.log(_JSON)
            //时间戳处理
            var _nowTime  = new Date();
            var _oldTime = new Date(parseInt(_JSON.created));
            //console.log(parseInt(_JSON.created))
            var _timeString = IM.timeDiff(_oldTime,_nowTime);
            var _Unread ='';
            if(_isUnread) _Unread='unread';
            //console.log(_Unread)
            //名称处理 针对group
            var _name='';
            if(_JSON.gid){
                for( var s in IM.Data.groups ){
                    if( IM.Data.groups[s].group_id == _JSON.gid){
                        _name = IM.Data.groups[s].group_name;
                    }
                }
            }else{
                _name = _JSON.name;
            }
            //console.log(_name)
            var Node = '<li im-chat="rc" class="'+ _Unread +'" data-from="'+ _JSON.from
                +'" data-gid="'+ _JSON.gid
                    //+'" data-id="'+ _JSON.id
                +'" data-name="'+ _JSON.name
                +'" data-avatar="'+ _JSON.avatar
                +'" data-to="'+ _JSON.to +'">'
                +'<span im-avatar><img src="'+ _JSON.avatar +'"></span>'
                +'<div>'
                +'<span im-time>'+ _timeString +'</span>'
                +'<span im-name>'+ _name +'</span>'
                +'<p im-msg>'+ _JSON.content +'</p>'
                +'</div>'
                +'<i></i>'
                +'</li>';
            //判断是否有记录
            var _node = IM.node.Panel,_wid,_isRecord = false;

            //清除空数据状态
            _node.rc.find('li.none').remove();
            _node.rc.find('li[im-chat]').each(function(){
                if( parseInt($(this).attr('data-gid')) == 0 ){
                    //与自己的信息做对比,得出会话对象
                    //(_JSON.from == IM.User.uid)? _wid = _JSON.to : _wid = _JSON.from;
                    _wid = IM.getChatObjID(_JSON.from,_JSON.to);
                    if( parseInt($(this).attr('data-from')) == _wid || parseInt($(this).attr('data-to')) == _wid )_isRecord = $(this).index();
                }else{
                    if( parseInt($(this).attr('data-gid')) == _JSON.gid ) _isRecord = $(this).index();
                }
            });
            console.log(_isRecord)
            if(_isRecord || parseInt(_isRecord) == 0){
                _node.rc.find('li[im-chat]').eq(_isRecord).remove();
            }

            //此段代码是暂时使用的，解决“最近联系人列表”接口未将群组消息归入同一条记录Bug
            if(_JSON.gid){
                _node.rc.find('[data-gid='+_JSON.gid+']').each(function(){
                    $(this).remove();
                });
            }

            _node.rc.prepend(Node);
            //更新本地数据存储
        };
        //拉取最近消息，默认10条
        IM.pullLastHistory = function(_ChatObj,_lastId,_page){
            var _Gid,_To;
            if( _ChatObj.chatType == 'group'){
                _Gid = _ChatObj.id;
                _To = 0;
            }else{
                _Gid = 0;
                _To = _ChatObj.id;
            }
            if(!_page)_page=0;
            var _JSON = {
                'cmd':'pullMessage',
                'data':{
                    'gid':_Gid,
                    'to':_To,
                    'page':_page,
                    'limit':10,
                    'last_id':_lastId
                }
            };
            IM.ws.send(JSON.stringify(_JSON));
        };
        //返回时间差("月-日"、"分：秒"、"刚刚"、"昨天")
        IM.timeDiff = function(_oldTime,_nowTime){
            var _timeString = '',_M,_D,_h,_m;
            (_oldTime.getMonth() + 1 < 10)?_M='0'+(_oldTime.getMonth() + 1):_M = _oldTime.getMonth() + 1;
            ( _oldTime.getDate() < 10 )?_D = '0'+_oldTime.getDate():_D = _oldTime.getDate();
            ( _oldTime.getHours() < 10)?_h = '0'+_oldTime.getHours():_h = _oldTime.getHours();
            ( _oldTime.getMinutes() < 10)?_m = '0'+_oldTime.getMinutes():_m = _oldTime.getMinutes();


            if( _oldTime.getMonth() != _nowTime.getMonth()){
                _timeString = _M +'-'+ _D;
            }else{
                var _timeDiff = _nowTime.getDate() - _oldTime.getDate();
                if( _timeDiff > 1){
                    _timeString = _M + '-' + _D;
                }else if( _timeDiff == 1 ){
                    _timeString = '昨天';
                }else{
                    if( _oldTime.getHours() == _oldTime.getHours() && _oldTime.getMinutes() == _nowTime.getMinutes() ){
                        _timeString = '刚刚';
                    }else{
                        _timeString = _h + ':' + _m;
                    }
                }
            }
            return _timeString;
        };
        // Y/M/D
        IM.getTimeYMD = function(_Time){
            var _Y,_M,_D;
            _Y = _Time.getFullYear();
            _M = _Time.getMonth()+1;
            _D = _Time.getDate();
            ( parseInt(_M)<10 )? _M = '0'+ parseInt(_M):_M = _M;
            ( parseInt(_D)<10 )? _D = '0'+ parseInt(_D):_D = _D;
            return _Y+'/'+_M+'/'+_D;
        };
        // H:M:S
        IM.getTimeHMS = function(_Time){
            //@_time, Date Obj
            var _h,_m,_s;
            ( parseInt(_Time.getHours())<10 )? _h = '0'+ parseInt(_Time.getHours()):_h = _Time.getHours();
            ( parseInt(_Time.getMinutes())<10 )? _m = '0'+ parseInt(_Time.getMinutes()):_m = _Time.getMinutes();
            ( parseInt(_Time.getSeconds())<10 )? _s = '0'+ parseInt(_Time.getSeconds()):_s = _Time.getSeconds();
            return _h+':'+_m+':'+_s;
        };
        //转义
        IM.htmlEncode = function(val){
            return $('<div/>').text(val).html();
        };
        IM.drawDomFriends = function(type){
            var _obj = IM.Data.friends;
            //console.log(_obj);
            var _node_friends = '',_isChat='',_addAll='';
            if( type == 'Panel') _isChat ='im-chat="user"';
            if( type == 'addGroupChat') _addAll='<span im-addall=""></span>';
            for( var s in _obj ){
                var _num = '';
                if( type == 'Panel') _num ='<span im-count>('+ _obj[s].online +'/'+ _obj[s].total +')</span>';
                var _node_members = '';

                for( var i in _obj[s].members ){
                    _node_members += '<dd '+ _isChat +' data-user-id="'+ _obj[s].members[i].user_id
                        +'" data-avatar="'+ _obj[s].members[i].user_avatar
                        +'" data-name="'+ _obj[s].members[i].user_name
                        +'"  data-online="'+ _obj[s].members[i].online +'">'
                        +'<span im-avatar=""><img src="'+ _obj[s].members[i].user_avatar +'"></span>'
                        +'<span im-name="">'+ _obj[s].members[i].user_name +'</span>'
                        +'</dd>';
                }
                _node_friends += '<dl im-org data-group-id="'+ _obj[s].group_id +'">'
                    +'<dt>'+ _obj[s].group_name + _num + _addAll +'</dt>'
                    + _node_members
                    +'</dl>';
            }
            return _node_friends;
        };

        //添加群聊
        IM.addGroupChat.draw = function(){
            IM.addGroupChat_result = [];//存储结果
            var _node_friends = '';
            _node_friends = IM.drawDomFriends('addGroupChat');
            var Node = '<div id="IM-addGroupChat" im-pop im-pop-type="addGroupChat" IM-add-type="new">'
                            +'<span im-pop-close></span>'
                            +'<div im-pop-header>创建群组</div>'
                            +'<div im-pop-con>'
                                +'<div im-searchLeft>'
                                    +'<div im-search><input type="text" value="" placeholder="输入关键字搜索联系人" /><i></i></div>'
                                    +'<div im-list>'+ _node_friends +'</div>'
                                +'</div>'
                                +'<div im-searchRight>'
                                    +'<div im-searchResultCount>已选联系人：<span>0</span>/50</div>'
                                    +'<div im-list><dl im-org="" class="show"></dl></div>'
                                +'</div>'
                                +'<span im-addGroup-icon></span>'
                                +'<div im-pop-action><span im-ok>确定</span><span im-cancel>取消</span></div>'
                            +'</div>'
                        +'</div>'
                        +'<div id="IM-Masklayer"></div>';
            $('body').append(Node);
            IM.node.addGroupChat = {};
            $.extend(IM.node.addGroupChat,{
                nNode:$('#IM-addGroupChat'),
                close:$('#IM-addGroupChat > [im-pop-close]').eq(0),
                searchInput:$('#IM-addGroupChat [im-search] input').eq(0),
                list:$('#IM-addGroupChat [im-searchLeft] [im-list]').eq(0),
                result_list:$('#IM-addGroupChat [im-searchRight] [im-list] dl'),
                total:$('#IM-addGroupChat [im-searchResultCount] span').eq(0),
                submit:$('#IM-addGroupChat [im-ok]').eq(0),
                cancel:$('#IM-addGroupChat [im-cancel]').eq(0),
                //addAll:$('#IM-addGroupChat dl[im-org] > dt [im-addAll]').eq(0),
                mask:$('#IM-Masklayer')
            });
        };
        IM.addGroupChat.event = function(){
            var _node = IM.node.addGroupChat;
            var _addType = _node.nNode.attr('IM-add-type');
            //search
            _node.searchInput.on('focus',function(){
                $(this).next('i').show();
            });
            _node.searchInput.on('change',function(){
                var _key = $(this).val();
                console.log(_key);
                var _arrayResult = [];
                IM.pushto( IM.searchKey( IM.Data.friends,'name',_key),_arrayResult );
                console.log(_arrayResult);
            });
            //empty search
            _node.searchInput.on('blur',function(){
                var _key = $(this).val();
                if( !_key ){
                    $(this).next('i').hide();
                }
            });


            //伸展
            _node.list.delegate('dt','click',function(e){
                var _Pdom = $(this).parent('dl');
                var _id = _Pdom.attr('data-id');
                if( _Pdom.hasClass('show') ){
                    _Pdom.removeClass('show');
                }else{
                    _Pdom.addClass('show');
                }
                e.stopPropagation();
            });
            //add
            _node.list.delegate('dd','click',function(e){
                //IM.addToResult('single',$(this),_addType);
                /*
                //人数上限检测
                if( IM.addGroupChat_result.length == 50){
                    console.log(IM.addGroupChat_result);
                    alert('人数已达上线');
                    return false;
                }
                var _user_id = $(this).attr('data-user-id');
                var _group_id = $(this).parent('dl').attr('data-group-id');
                var Node = $(this).clone(true);
                Node.attr('data-group-id',_group_id);
                //
                IM.addGroupChat_result.push(IM.getMemberData(_user_id,_group_id));
                _node.total.html(IM.addGroupChat_result.length);
                _node.result_list.append(Node);
                $(this).addClass('unshow');

                */
                e.stopPropagation();
            });
            //addAll
            _node.list.delegate('[im-addAll]','click',function(e){
                var _group_id = $(this).parents('dl').attr('data-group-id');

                //IM.addToResult('multiple',$(this).parents('dl'));
                /*
                //人数上限限制，循环执行单个添加操作？？【存在多次查询】

                var _name = $(this).parents('dl').html();
                var _len = $(this).parents('dl').find('dd').length;
                var _tips = '确定邀请“'+ _name + '”('+ _len +'人)';
                console.log(_len);
                IM.POP.draw('addGroupChat_All',_tips);
                */
                e.stopPropagation();
            });



            //del,根据del当前index,删除“IM.addGroupChat_result”数组中对应的索引值
            _node.result_list.delegate('dd','click',function(e){
                var _user_id = $(this).attr('data-user-id');
                var _group_id = $(this).attr('data-group-id');
                IM.addGroupChat_result.splice($(this).index(),1);
                _node.total.html(IM.addGroupChat_result.length);

                _node.list.find('dl[data-group-id='+ _group_id +']').find('dd[data-user-id='+ _user_id +']').removeClass('unshow');

                $(this).remove();
                e.stopPropagation();
            });
            //submit
            _node.submit.on('click',function(e){
                if( !IM.addGroupChat_result.length ){
                    alert('请选择群聊好友');
                    return false;
                }
                e.stopPropagation();
            });
            //close
            _node.close.on('click',function(){
                _node.nNode.remove();
                _node.mask.remove();
                delete IM.node.addGroupChat;
                delete IM.addGroupChat_result;
            });
            _node.cancel.on('click',function(){
                _node.nNode.remove();
                _node.mask.remove();
                delete IM.node.addGroupChat;
                delete IM.addGroupChat_result;
            });
        };
        //添加

        //添加群聊
        /* 添加方式：新建(群聊) && 邀请(进入已有的群聊) */
        /*
        * A 添加单个
        *   0、if 群聊方式（新建&&邀请）
        *   1、if 当前是否已存在群聊中
        *   2、if 人数限制
        *   3、遍历，获取该对象
        *   4、添加，并对该对象设置状态
        * B 添加组
        *   0、if 群聊方式（新建&&邀请）
        *   1、遍历筛选出未存在群里的新数组
        *   2、if 人数限制
        *   3、遍历，并对每个对象设置状态
        *   4、添加
        * C 搜索添加
        *   基本同“单个添加”
        * */
        IM.addToResult = function(_type,_dom,_addGroupChatType){
            /*

            switch( _addGroupChatType ){
                case 'new':

                    break;
                case 'join':
                    break;
                default:
                    console.log('错误');
            }
            */
        };



        IM.addToResult0 = function(_type,_dom,_addType){
            /* _type 添加方式  _addType 邀请方式(new ) */
            var _node = IM.node.addGroupChat;
            var _group_id;
            var _total = IM.addGroupChat_result.length;
            if( _type == 'single' ){
                _total++;
                if( _total > 5 ){
                    alert('人数已满');
                    return false;
                }
                var _user_id = _dom.attr('data-user-id');
                _group_id = _dom.parent('dl').attr('data-group-id');
                var Node = _dom.clone(true);
                Node.attr('data-group-id',_group_id);

                IM.addGroupChat_result.push(IM.getMemberData(_user_id,_group_id));

                _node.total.html(IM.addGroupChat_result.length);
                _node.result_list.append(Node);
                _dom.addClass('unshow');
            }else if( _type == 'multiple' ){
                var _len = _dom.find('dd[class!=unshow]').length;
                if( _total+_len > 5 ){
                    alert('人数超出限制');
                    return false;
                }
                _group_id = _dom.attr('data-group-id');
                //IM.getMembersData(_group_id);
                IM.pushto(IM.getMembersData(_group_id),IM.addGroupChat_result);
                console.log(IM.addGroupChat_result);


            }else{
                console.log('错误');
            }
        };
        //获取选择的分组数据对象，多个用户
        IM.getMembersData = function(_group_id){
            var _A = [],_Data = IM.Data.friends;
            for( var s in _Data ){
                if( _Data[s].group_id != _group_id ) continue;
                IM.pushto(_Data[s].members,_A);
                return _A;
                break;
            }
        };
        //获取选择的数据对象，单个用户
        IM.getMemberData = function(_user_id,_group_id){
            var _Data = IM.Data.friends;
            for( var s in _Data ){
                if( _Data[s].group_id != _group_id ) continue;
                for( var i in _Data[s].members ){
                    if( _Data[s].members[i].user_id == _user_id ){
                        return _Data[s].members[i];
                        break;
                    }
                }
                break;
            }
        };


        //搜索
        IM.searchKey = function(_array,_name,_key){
            var _a = [];
            for( var s in _array ){
                if( _array[s][_name].indexOf(_key) >= 0 ){
                    _a.push(_array[s]);
                }
            }
            return _a;
        };

        //数组 to 数组
        IM.pushto = function pushto(_a,_o){
            for( var s in _a ){
                _o.push( _a[s] );
            }
            return _o;
        };



        //弹窗tips
        IM.POP = {};
        IM.POP.draw = function(_type,_tips){
            var Node = '<div im-pop im-pop-type="tips">'
                +'<span im-pop-close></span>'
                +'<div im-pop-header>确认邀请整组</div>'
                +'<div im-pop-con>'
                +'<div im-pop-tips im-pop-tips0>'
                +'<i></i><p>'+ _tips +'</p>'
                +'</div>'
                +'</div>'
                +'<div im-pop-action>'
                +'<span im-ok>确定</span><span im-cancel>取消</span>'
                +'</div>'
                +'</div>'
                +'<div id="IM-Masklayer2"></div>';
            IM.node.POP = {};
            $.extend('IM.node.POP',{
                close:$('[im-pop] > [im-pop-close]').eq(0),
                submit:$('[im-pop] [im-ok]').eq(0),
                cancel:$('[im-pop] [im-cancel]').eq(0)
            });
        };



        /*UI 测试*/
        //IM.Chat.draw();
        //IM.renode();
        //IM.addGroupChat.draw();
        //IM.addGroupChat.event();
        /*

        IM.Panel.event();
        */
        //IM.Panel.draw();
        /*数据测试*/
        IM.init();
    };
});
