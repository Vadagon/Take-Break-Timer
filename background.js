var d = {
    work: 25 * 60,
    pause: 5 * 60,
    sound: !1,
    isSafe: false,
    workMode: {
        work: 25 * 60,
        pause: 5 * 60
    },
    safeMode: {
        work: 52 * 60,
        pause: 17 * 60
    }
}

var t = {
    terminated: !1,
    workTime: !0,
    pauseTabId: !1,
    pauseWinId: !1,
    snoozing: !1,
    timing: d.work,
    timer: !1,
    state: 'active',
    work: function(e) {
        if(t.pauseTabId)
            chrome.tabs.remove(t.pauseTabId)
        if(t.pauseWinId)
            chrome.windows.remove(t.pauseWinId, function(){
                t.pauseWinId = !1
            })
        t.timer = setTimeout(t.timeIsUp, e * 1000);
        t.workTime = !0
        t.timing = e
        t.setBadge()
    },
    timeIsUp: function(){
        t.sound.play();
        t.notify(2)
    },
    setItAllUp: function(){
        chrome.idle.setDetectionInterval(d.pause)
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
        if(e == 2){
            // break Time
            t.workTime = !1
            t.stopAll()

            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'images/pause.png',
                title: 'Coffee Time',
                message: 'It\'s time for a break!',
                buttons: [{title: 'Take a break!'}, {title: 'Additional 5 min.'}],
                requireInteraction: !0
            }, function(id){
                chrome.notifications.onButtonClicked.addListener(function(iid, btnId){
                    if(id == iid && btnId == 0)
                        t.init(!0)
                    if(id == iid && btnId == 1) 
                        t.init(!1, 300)
                })
            })

            var i = 0;
            var reInitWorkAfter = d.pause;
            t.badgeTime = setInterval(function() {
                i++;
                i%2?t.setIcon('pause'):t.setIcon('pause.sm')

                // reinit workflow after pause is exceeded
                reInitWorkAfter--;
                if(reInitWorkAfter <= 0){
                    if(t.state == 'active') t.init()
                    if(t.state != 'active') t.snooze()
                }
            }, 1000);
        }
    },
    pause: function(e) {
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
        if(e) t.timing = e
        else t.timing = d.pause
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

        if(t.pauseTabId)
            chrome.tabs.remove(t.pauseTabId)
        if(t.pauseWinId)
            chrome.windows.remove(t.pauseWinId, function(){
                t.pauseWinId = !1
            })
    },
    init: function(e = !1, c = !1) {
        console.log('Initiated somehow...')
        // applying mode type
        d.work = d.isSafe?d.safeMode.work:d.workMode.work;
        d.pause = d.isSafe?d.safeMode.pause:d.workMode.pause;
        // stopping all intervals/outs
        t.stopAll()
        if(t.terminated){
            t.terminate()
            return;
        }
        t.workTime = !e
        t.snoozing = false
        if(!c) c = t.workTime?d.work:d.pause;
        t.workTime ? t.work(c) : t.pause(c)
    }
}

sGet((e)=>{
    console.log(e)
    if(typeof e == 'object'){
        t.terminated = e.terminated
        if(!e.d.workMode){
            e.d.workMode = d.workMode; 
            e.d.safeMode = d.safeMode; 
        }
        d = e.d
    }
    t.setItAllUp()
    !t.terminated?t.init():t.terminate()
    sSet()
})



chrome.runtime.onMessage.addListener(function(e, sender, sendResponse){
    console.log('pressed:', e)
    if(e.c==1){
        t.terminated = !1;
        t.init(!1, e.d.work);
    }
    if(e.c==2){
        t.terminated = !1;
        t.init(!0, e.d.pause);
    }
    if(e.c==3)
        t.terminate()
    
    if(e.c >= 5 && e.c <= 6){
        if(e.c == 5) d.isSafe = false;
        if(e.c == 6) d.isSafe = true;
        t.init()
    }
    if(e.c==11){
        d = e.d
        t.setItAllUp()
        t.init()
    }
    if(e.type=='getTime'){
        sendResponse(t.timing)
    }
    sSet()
})
chrome.idle.onStateChanged.addListener(function(e){
    console.log('idle.onStateChanged: ', e)
    t.state = e;
    if(e != 'active'){
        if(t.workTime)
            t.snooze()
    }else{
        t.init()
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
chrome.runtime.setUninstallURL('https://forms.gle/UU6mqqYNLT2Q1ZnMA')


