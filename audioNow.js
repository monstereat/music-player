/*
1, 控制条
    播放、暂停、切歌(图标要对上，暂停切歌时需要播放并切换图标)
    播放进度
        1, 播放条自动滑动
        2, 鼠标拖拉控制进度
              点下   获取当前值
              移动  计算移动值 + 原进度, 并移动
              松开  移除移动事件
        3, 鼠标点击控制进取
    音乐与进度条关联
        1, 播放歌曲进度条自动滚动
        2, 移动进度条播放能正常
            第一个 bug (移动进度条放开后进度条弹回原处)

    播放时间
        当前时间
            timeupdate 中格式绑定
        总时间
            bug 切歌的时 总时间会瞬间出现 NaN
            (绑定在页面中代码放置位置有待确定)
    音量控制

2, 歌词滚动
    歌词显示
        获取歌词
        对歌词进行分解(时间、歌词各一个数组)
        根据歌词在页面生成歌词列表
    歌词绑定
        点击播放 歌词能正确显示当前歌词(添加 class) 歌词开始  歌词结束能正确显示
        暂停 歌词滚动能暂停
        拖放歌词滚动条后放开回到原来的位置
    切歌

3, 搜索歌曲 (爬虫)(ajax) 跨域
4,
*/

  var musicSource = [
    '1.mp3',
    '2.mp3',
    '3.mp3',
    '4.mp3',
  ]
  // var ad
  var pre = document.querySelector('#id-music-pre')
  var next = document.querySelector('#id-music-next')
  var audio = document.querySelector('#id-audio-content')
  var findMusicIndex = function(str) {
      for (let i = 0; i < musicSource.length; i++) {
          if(str == musicSource[i]) {
              return i
          }
      }
      return -1
  }

  // 播放音乐
  var musicPlayer = function() {
    var audio = document.querySelector('#id-audio-player')
    var play = document.querySelector('#id-audio-content')
    audio.addEventListener('click', function(e) {
        var play = document.querySelector('#id-audio-content')
        var stateValue = play.dataset.state
        var state = Number(stateValue)
        if(!state) {
            play.play()
            play.dataset.state = '1'
            // audio.background.position = '0 -165px'
            audio.classList.remove('state-pause')
            audio.classList.add('state-play')
        } else {
            play.pause()
            play.dataset.state = '0'
            audio.classList.remove('state-play')
            audio.classList.add('state-pause')
            // audio.background.position = '0 -204px'
        }
    })
  }
  // 前一首
  pre.addEventListener('click', function(e) {
      var src = document.querySelector('source')
      var musicSrc = src.src
      var musicName = musicSrc.split('/')[7]
      var indexNow = findMusicIndex(musicName)
      var index = (indexNow - 1 + 4) % 4
      var path = './src/' + musicSource[index]
      src.src = path
      audio.load()
      audio.play()
      var play = document.querySelector('#id-audio-content')
      play.dataset.state = '1'
      var content = document.querySelector('#id-audio-player')
      content.classList.add('state-play')
  })
  // 下一首
  var nextEvent = function (){
      next.addEventListener('click', function(e) {
          var src = document.querySelector('source')
          var musicSrc = src.src
          var musicName = musicSrc.split('/')[7]
          var indexNow = findMusicIndex(musicName)
          var index = (indexNow + 1) % 4
          var path = './src/' + musicSource[index]
          src.src = path
          audio.load()
          audio.play()
          // span_allTime(audio.duration)
          var play = document.querySelector('#id-audio-content')
          play.dataset.state = '1'
          var content = document.querySelector('#id-audio-player')
          content.classList.add('state-play')
          // 总时间
          // span_allTime(audio.duration)
     })
  }
  // 播放结束自动切歌
 audio.addEventListener('ended', function() {
     var src = document.querySelector('source')
     var musicSrc = src.src
     var musicName = musicSrc.split('/')[7]
     var indexNow = findMusicIndex(musicName)
     var index = (indexNow + 1) % 4
     var path = './src/' + musicSource[index]
     src.src = path
     audio.load()
     audio.play()
     var play = document.querySelector('#id-audio-content')
     play.dataset.state = '1'
     //总时间
     // span_allTime(audio.duration)
 }, false)
 // 歌曲播放时进度条移动
 audio.addEventListener('timeupdate', function() {
     var preces = (audio.currentTime / audio.duration) * 100
     //这里出错了  不用 .cur 宽度来改变进度条 应该用 currentTime 改变
     if(!isDragging){
       var div_cur = document.querySelector('.cur')
       div_cur.style.width = `${preces}%`
     }
     // var div_cur = document.querySelector('.cur')
     // div_cur.style.width = `${preces}%`
     var fTime = formTime(audio.currentTime)
     var time_span = document.querySelector('#cur-time')
     time_span.innerHTML = fTime
     // thisTime = audio.currentTime
     // 切歌 bug 解决
     var allTheTime = audio.duration || 0
     span_allTime(allTheTime)

     // 绑定歌词
     // let timeCollect = tool.formatLrc()
     // var timeCollects = timeCollect[1]
     // for (let i = 0; i < timeCollect.length; i++) {
     //
     // }
     tool.bindLyric()
 })

 // 点击  控制播放进度
 var process_div = document.querySelector('.barbg')
 var play_now = function() {
     // var process_div = document.querySelector('.cur')
     var process_cur = document.querySelector('.cur')
     process_div.addEventListener('click', function(event) {

           // var x = event.pageX || event.clientX + scrollX;
         // offsetX 相对于父元素 x 距离  // TODO: WHY
         // var press = (event.offsetX/493)*100
         var boxLeft = this.getBoundingClientRect()
         var press = ((event.clientX - boxLeft.left) / 493) * 100
         // var press =  event.offsetX
         process_cur.style.width= `${press}%`
         audio.currentTime = audio.duration * press * 0.01
     })

 }

 var isDragging = false;

 // 鼠标滑动控制音量
 var allTime = 0
 var startPosition = 0
 var curPostion = 0
 var process_bar = document.querySelector('#barbg')
 var process_move = document.querySelector('#auto-id')
 var start = 0
 var prassCur = document.querySelector('.cur')
 // 移动进度条执行事物
 var listen = function(e) {
     if(!isDragging) return
     var now = ((e.clientX - start) / 493)* 100
     now = now + passC
     now = Math.min(now, 100)
     prassCur.style.width =`${now}%`
     curPostion = audio.duration * now * 0.01
 }
 // 开始移动进度条执行事物
 var dragst = function(clientx, prassCur, start) {
     var now = ((clientx - start) / 493)* 100
     prassCur.style.width =`${now}%`
 }
 // 获取播放进度
 var passCur = function() {
     var prassCur = document.querySelector('.cur')
     var startCur = prassCur.style.width
     var startNow = startCur.slice(0, startCur.length - 1)
     var startNum = (parseFloat(startNow) / 100) * 493
     return parseFloat(startNow)
 }
 // 移动结束执行事物
 var dragen = function() {
     // 获取当前 div 的宽度 算出百分比
     // 把进度条跟播放时间绑定
     var proc_now = document.querySelector('.cur')
     var start_nows = proc_now.style.width

     audio.currentTime = curPostion
     isDragging = false

     document.removeEventListener('mousemove', listen)
     document.removeEventListener('mouseup', dragen)
 }
 var passC = 0
 // 拖动控制 播放进度
 var dragEvent = function(){
   process_move.addEventListener('mousedown', function(e) {

       // 阻止事件传播
       e.stopPropagation()
       isDragging = true
       start = e.clientX
       passC = passCur()
       var prassCur = document.querySelector('.cur')
       document.addEventListener('mousemove', listen)
       document.addEventListener('mouseup', dragen)
   })
 }

 //格式化时间
 var formTime = function(time) {
     var min = parseInt(time / 60)
     var second
     if(time > 60) {
         second =parseInt((time % 60))
     } else {
         second = parseInt(time)
     }
     var formSecond
     if(second < 10) {
         formSecond = `0${second}`
     } else {
         formSecond = `${second}`
     }
     return `0${min}:${formSecond}`
 }
 var toSecond = function(time) {
     let minStr = time.slice(0,2)
     let secondStr = time.slice(3)
     let min = parseInt(minStr)
     let second = parseFloat(secondStr)
     return min*60 + second
 }
 //总时间
 var span_allTime = function(time) {
     var span = document.querySelector('#all-time')
     var allFormTime = formTime(time)
     span.innerHTML= allFormTime
 }

 var isVol = false
 //音量控制
 var vol_cur_proces = document.querySelector('.vol-cur')
 var volControl = document.querySelector('.val-bar')
 var vol_span = document.querySelector('#vol-icon')
 var startNowY = 0
 var vol_proces = 0
 var vol_icon_now = 0
 var top_all = 95
 var process_all = 0
 audio.volume = 0.5
 var vol_i = 47.5
 var vol_h = 47.5
 vol_cur_proces.style.height = 47.5 + 'px'
 vol_span.style.top = 47.5 - 10 + 'px'
 var vol_drag = function(e) {
      if(!isVol) return
     var nowMove = startNowY - e.clientY
     var theP = vol_proces + nowMove
      var movePx = vol_icon_now - nowMove
     if(nowMove > 0){
         movePx = Math.max(movePx, -10)
         theP = Math.min(theP, 95)
     } else {
         movePx = Math.min(movePx, 95 - 10)
         theP = Math.max(theP, 0)
     }
     vol_cur_proces.style.height = `${theP}px`
     vol_span.style.top = movePx + 'px'
     vol_computer()
 }
 var vol_dragend = function() {
     isVol = false
     vol_span.removeEventListener('mousemove', vol_drag)
     vol_span.removeEventListener('mouseup', vol_dragend)
 }
 vol_span.addEventListener('mousedown', function(e) {
     // body...
     e.stopPropagation()
     isVol = true
     var startY = e.clientY
     startNowY = startY
    var vol_height = vol_cur_proces.style.height
    vol_proces = parseFloat(vol_height.slice(0, -2)) | 0

    var vol_top = vol_span.style.top
    vol_icon_now = parseFloat(vol_top.slice(0, -2)) | 0
    vol_span.addEventListener('mousemove',vol_drag)
    vol_span.addEventListener('mouseup', vol_dragend)
 })
 function vol_computer() {
   var nowDiv = document.querySelector('.vol-cur')
   let nowDivHeight = nowDiv.style.height
   let nowDivStr = nowDivHeight.slice(0,-2)
   let vol_value = parseInt(nowDivStr)
   let vol_precent = vol_value / 95
   audio.volume = vol_precent
 }
 // 点击控制音量
 // 可能需要事件捕获
 var vol_click = document.querySelector('.vbg')
 var volCurClick = document.querySelector('.vol-cur')
 var contentBox = vol_click.getBoundingClientRect()
 vol_click.addEventListener('click', function(e){
    if(isVol) return
     var iconHeight = e.clientY - contentBox.top
     var paNow = 95 - iconHeight
     vol_cur_proces.style.height = paNow + 'px'
     vol_span.style.top = iconHeight - 10 + 'px'
     vol_computer()
 })

 var tool = {

 }
 tool.lyric = function() {
     let lrc1 = '[00:16.445]如何面对曾一起走过的日子\
     [00:23.420]现在剩下我独行如何用心声一一讲你知\
     [00:30.116]从来没人明白我唯一你给我好日子\
     [00:37.315]有你有我有情有生有死有义\
     [00:43.395]多少风波都愿闯只因彼此不死的目光\
     [00:50.890]有你有我有情有天有海有地\
     [00:57.540]不可猜测总有天意才珍惜相处的日子\
     [01:04.650]道别话亦未多讲只抛低这个伤心的汉子\
     [01:18.843]沉沉睡了谁分享今生的日子\
     [01:25.775]活着但是没灵魂才明白生死之间的意思\
     [01:32.733]情浓完全明白了才甘心披上孤独衣\
     [01:39.663]有你有我有情有天有海有地\
     [01:46.637]当天一起不自知分开方知根本心极痴\
     [01:53.542]有你有我有情有生有死有义\
     [02:00.512]只想解释当我不智如今想倾诉讲谁知\
     [02:07.468]剩下绝望旧身影今只得千亿伤心的句子\
     [02:20.225]沉沉睡了谁分享今生的日子\
     [02:26.862]活着但是没灵魂才明白生死之间的意思\
     [02:33.821]情浓完全明白了才甘心披上孤独衣\
     [02:41.109]有你有我有情有天有海有地\
     [02:47.976]当天一起不自知分开方知根本心极痴\
     [02:54.946]有你有我有情有生有死有义\
     [03:01.961]只想解释当我不智如今想倾诉讲谁知\
     [03:08.561]剩下绝望旧身影今只得千亿伤心的句子\
     [03:14.566]剩下绝望旧身影今只得千亿伤心的句子\
     '
     let lrc = "[00:00.00] 作曲 : Macy gray\
        [00:01.00] 作词 : Macy gray\
        [00:04.83]Uh It's remix baby\
        [00:09.15]You gonna love it\
        [00:11.49]Ready Uh Yeah Come on\
        [00:18.16]记得你说你总是对的，那些琐碎你觉得累了\
        [00:22.46]谁该道歉谁对谁错，那些疑惑我无所谓的\
        [00:27.04]Baby you are my memory\
        [00:29.31]我说时间它或许可以\
        [00:31.44]能够让你把我遗忘的彻底\
        [00:33.70]So please don't say I'm creepy\
        [00:36.04]你想要的这不是我能给，不想再让你变的更憔悴\
        [00:40.44]我说其实回忆也可以很美\
        [00:42.74]Everything will be OK\
        [00:44.89]我给你一个可以放手的借口，只是需要时间去接受\
        [00:49.35]所以现在我让你先走\
        [00:51.84]Now, I let you go, I let you go\
        [00:55.14]And if I had to do it over, I'd see you again (see you again)\
        [01:00.01]I'd do it right and when we fight I'd let you win (I let you win)\
        [01:04.03]'Cause my world is nearly nothing without you in it (uh)\
        [01:09.02]Should-a let it go\
        [01:10.32]Could-a let you go (let you go)\
        [01:11.38]Could-a let you win\
        [01:14.22]Ready Uh\
        [01:16.49]离开的理由我只需要一个\
        [01:18.91]I just wanna make you feel better\
        [01:21.02]无论以后会有多少个不舍，但是为你 It does't matter\
        [01:25.32]我说生活能有很多个焦点\
        [01:27.70]You gonna do it，这是唯一条件\
        [01:29.91]过去你不必再留恋，你需要的是一个全新起点\
        [01:34.29]我想我了解你所有的秘密，那些记忆都存在了日记\
        [01:38.78]Congratulations 你现在终于\
        [01:41.01]能够找回到全新的自己\
        [01:43.18]我说过去我从不会否定，我只想现在让自己安静\
        [01:47.79]试着离开你紧握的手心\
        [01:50.04]So I let you win, I let you win\
        [01:53.47]And if I had to do it over, I'd see you again (see you again)\
        [01:58.41]I'd do it right and when we fight I'd let you win (I let you win)\
        [02:02.79]'Cause my world is nearly nothing without you in it\
        [02:07.32]Should-a let it go\
        [02:08.48]Could-a let it go\
        [02:09.74]Could-a let you win\
        [02:12.54]I let you go, I let you win\
        [02:17.02]I let you go, I let you win, Baby\
        [02:21.48]I let you go, I let you win\
        [02:25.95]I let you go, I let you win, Baby\
        [02:31.56]And if I had to do it over, I'd see you again\
        [02:36.50]I'd do it right and when we fight I'd let you win (I let you win)\
        [02:40.84]'Cause my world is nearly nothing without you in it\
        [02:45.57]Should-a let it go (let it go)\
        [02:46.76]Could-a let it go (let it go)\
        [02:47.99]Could-a let you win (let you win)\
        [02:49.53]Let you win (let you win), let you win (let you win)\
        [02:53.90]Let you win, let you win (let you win), let you win\
        [02:58.51]Let you win (I let you win, let you win)\
        [03:00.83]I give in (I give in)\
        [03:02.88]Let you win\
        [03:04.04]Wanna see you again (wanna see you again)\
        [03:08.35]Uh remix, Uh Yeah"
     return lrc
 }

 // 时间 歌词分割
 tool.formatLrc = function() {
     let lyricTimes = []
     let lyrics = []
     let temp = []
     let lyric = null
     let copyLyric = null
     let timeRegex = /\[\d+:\d+\.\d+\]/g
     let lyricRegex = /[^\[\d+:\d+\.\d+\]]/g
     let regex = /\[/g

     copyLyric = lyric = tool.lyric()
     // 把时间都替换成 '_', 再用 split 把字符串分割成字符串数组
     copyLyric = copyLyric.replace(timeRegex, '_').split('_')
     // 把字符串置空  去掉 [   按 ]进行分割
     lyric = lyric.replace(lyricRegex, '').replace(regex, '').split(']');
     // 收集歌词
     copyLyric.forEach(function(item) {
         if(item) {
             lyrics.push(item.trim())
         }
     })
     // 收集时间
     lyric.forEach((item)=> {
         if(item) {
             lyricTimes.push(item.trim())
         }
     })
     return [lyricTimes, lyrics]
 }

 // 歌词显示在界面
 var divLyric = document.querySelector('.lrc')
 tool.showlyric = function(ele, lyrics) {
     var parentNode = []
     var eleNode = create('p', lyrics.length)
     for (let i = 0; i < lyrics.length; i++) {
        eleNode[i].innerHTML = lyrics[i]
     }
     for (let i = 0; i < eleNode.length; i++) {
         divLyric.appendChild(eleNode[i])
     }
     return eleNode
 }

 // 绑定歌词  timeupdate 中
 var removeClass = function(element, className) {
     if(!element || !className) {
         return
     }

     element.classList.remove(className)
 }
 var addClass = function(element, className) {
     if(!element) {
         return
     }
     element.className = className
 }
 var create = function(eleType,length) {
     if(!eleType || !length) {
         return
     }
     var eleNode = []
     for (let i = 0; i < length; i++) {
         eleNode.push(document.createElement(eleType))
     }
     return eleNode
 }

 var currentLine = null
 let Collect = tool.formatLrc()
 var timeCollect = Collect[0]
 var lyricCollect = Collect[1]
 var theLyric = tool.showlyric(divLyric, lyricCollect)
 tool.bindLyric = function() {
     let Collect = tool.formatLrc()
     var timeCollect = Collect[0]
     var lyricCollect = Collect[1]
     let lyricScrollHeight = divLyric.scrollHeight
     // 根据时间 切换歌词
     for (let i = 0; i < timeCollect.length; i++) {
         if(toSecond(timeCollect[i]) - audio.currentTime <= 0.01) {

             removeClass(currentLine, 'on')
              // 这里卡住了
              // 首先获取节点，然后给节点加 on 类
             currentLine = theLyric[i]
             //移动滚动条
             divLyric.scrollTop = currentLine.offsetTop - currentLine.offsetHeight * 7
             // 获取 p 元素再添加类
             addClass(currentLine, 'on')
         }
     }
     if(timeCollect.length === 0) {
         removeClass(currentLine, on)
     }
 }

 // 程序入口
  var __main = function() {
    musicPlayer()
    nextEvent()
    play_now()
    dragEvent()

    // 在 timeupdate 中
    //绑定歌词(格式化歌词,把歌词显示到页面,歌词滚爬动)
    // tool.bindLyric()
  }
  __main()
