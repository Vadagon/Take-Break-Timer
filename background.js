'use strict'

var d = {
    work: 52 * 60,
    pause: 17 * 60,
    delay: 4 * 60,
    sound: !1
}

var t = {
    terminated: !1,
    workTime: !0,
    pauseTabId: !1,
    pauseWinId: !1,
    snoozing: !1,
    timing: d.work,
    timer: !1,
    work: function(e) {
        if(t.pauseTabId)
            chrome.tabs.remove(t.pauseTabId)
        if(t.pauseWinId)
            chrome.windows.remove(t.pauseWinId, function(){
                t.pauseWinId = !1
            })
        t.timer = setTimeout(function() {
            t.sound.play();
            t.notify(2)
        }, e * 1000);
        t.workTime = !0
        t.timing = e
        t.setBadge()
    },
    setItAllUp: function(){
        chrome.idle.setDetectionInterval(d.delay)
        chrome.browserAction.setBadgeBackgroundColor({color: '#404040'})
        t.sound = new Howl({
          src: ['sounds/def1.mp3']
        });
    },
    snooze: function(){
        t.snoozing = !0
        t.workTime = !0
        t.setBadge()
        clearTimeout(t.timer)
    },
    notify: function(e){
        if(e == 1)
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'images/pause.png',
                title: 'Don\'t do this!',
                message: 'Please! Release your mouse and relax 😠'
            })
        if(e == 2)
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'images/pause.png',
                title: 'Don\'t do this!',
                message: 'It\'s time for a break!',
                buttons: [{title: 'Take a break!'}, {title: 'Additional 5 min.'}],
                requireInteraction: !0
            }, function(id){
                t.workTime = !1
                var i = 0;
                t.stopAll()
                t.badgeTime = setInterval(function() {
                    i++;
                    i%2?t.setIcon('pause'):t.setIcon('pause.sm')
                }, 1000);
                chrome.notifications.onButtonClicked.addListener(function(iid, btnId){
                    if(id == iid && btnId == 0)
                        t.init(!0)
                    if(id == iid && btnId == 1) 
                        t.init(!1, 300)
                })
            })
    },
    pause: function() {
        chrome.windows.getCurrent(function(e){
            if(!e){
                chrome.windows.create({'url': chrome.extension.getURL('timer.html'), focused: !0, type: 'popup'}, function(win) { 
                    t.pauseWinId = win.id
                })
            }else{
                chrome.tabs.create({ 'url': chrome.extension.getURL('timer.html') }, function(tab) { t.pauseTabId = tab.id });
            }
        })
        chrome.power.requestKeepAwake("display")
        t.workTime = !1
        t.stopAll()
        t.timing = d.pause
        t.setBadge()
    },
    setIcon: function(e = !1){
        var icon = (t.workTime ? (t.snoozing ? 'stop' : 'play') : 'pause')
        icon = e?e:icon
        chrome.browserAction.setIcon({ path: 'images/' + icon + '.png' })
    },
    setBadge: function(e = !1) {
        t.setIcon(e)
        if (t.badgeTime)
            clearInterval(t.badgeTime)
        t.badgeTime = setInterval(function() {
            if (!t.timing || t.timing < 0 || t.snoozing) {
                chrome.browserAction.setBadgeText({ text: '' })
            } else {
                t.timing--;
                var time2Show = Math.floor(t.timing / 60)
                var seccontds = (t.timing - time2Show*60)
                seccontds = seccontds<10?'0'+seccontds:seccontds
                time2Show = time2Show + ':' + seccontds
                time2Show = t.timing<0?'':time2Show
                chrome.browserAction.setBadgeText({ text: time2Show })
            }
        }, 1000);
    },
    stopAll: function(){
        if (t.timer)
            clearTimeout(t.timer)
        if (t.badgeTime)
            clearInterval(t.badgeTime)
    },
    terminate: function(){
        t.stopAll()
        t.workTime = false
        t.snoozing = false
        chrome.browserAction.setBadgeText({ text: '' })
        t.setIcon('stop')
        t.terminated = !0
    },
    init: function(e = !1, c = !1) {
        console.log('Initiated somehow...')
        t.stopAll()
        if(t.terminated){
            t.terminate()
            return;
        }
        t.workTime = !e
        t.snoozing = false
        !c?c = d.work:c
        t.workTime ? t.work(c) : t.pause()
    }
}

sGet((e)=>{
    console.log(e)
    if(typeof e == 'object'){
        t.terminated = e.terminated
        d = e.d
    }
    t.setItAllUp()
    !t.terminated?t.init():t.terminate()
    sSet()
})



chrome.runtime.onMessage.addListener(function(e){
    console.log('pressed:', e)
    if(e.c==1){
        t.terminated = !1;
        t.init()
    }
    if(e.c==2){
        t.init(!0)
    }
    if(e.c==3)
        t.terminate()
    if(e.c==11){
        d = e.d
        t.setItAllUp()
        t.init()
    }
    sSet()
})
chrome.idle.onStateChanged.addListener(function(e){
    if(e != 'active'){
        if(t.workTime)
            t.snooze()
    }else if(t.workTime){
        t.init()
    }else{
        // t.notify(1)
    }
})
chrome.tabs.onRemoved.addListener((id) => {
    if (t.pauseTabId == id){
        t.pauseTabId = !1
        t.init()
        chrome.power.releaseKeepAwake()
    }
})
chrome.windows.onRemoved.addListener((id) => {
    if (t.pauseWinId == id){
        t.init()
        t.pauseWinId = !1
        chrome.power.releaseKeepAwake()
    }
})
function sGet(callback){
    chrome.storage.local.get('data', function(items){
        callback(items.data)
    })
}
function sSet(){
    chrome.storage.local.set({data: {terminated: t.terminated, d: d}})
}