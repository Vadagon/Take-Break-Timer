'use strict'

var d = {
    work: 0.3 * 60,
    pause: 17 * 60,
    delay: 0.4 * 60
}

var t = {
    workTime: !0,
    pauseTabId: !1,
    snooze: !1,
    timing: d.work,
    working: function() {
        if (t.timer)
            clearTimeout(t.timer)
        t.timer = setTimeout(function() {
            t.pausing()
        }, d.work * 1000);
        t.workTime = !0
        t.timing = d.work
        t.setBadge()
    },
    pausing: function() {
        clearTimeout(t.timer)
        chrome.tabs.create({ 'url': chrome.extension.getURL('timer.html') }, function(tab) { t.pauseTabId = tab.id });
        t.workTime = !1
        t.timing = d.pause
        t.setBadge()
    },
    setBadge: function() {
        chrome.browserAction.setIcon({ path: 'images/' + (t.workTime ? (t.snooze ? 'stop' : 'play') : 'pause') + '.png' })
        if (t.badGeTime)
            clearTimeout(t.badGeTime)
        t.badGeTime = setInterval(function() {
            if (!t.timing || t.timing < 0 || t.snooze) {
                chrome.browserAction.setBadgeText({ text: '' })
            } else {
                t.timing--;
                var time2Show = Math.round(t.timing / 60).toString()
                chrome.browserAction.setBadgeText({ text: time2Show })
            }
        }, 1000);
    },
    setItUp: function(){
        chrome.idle.setDetectionInterval(d.delay)
        chrome.browserAction.setBadgeBackgroundColor({color: '#404040'})
    },
    init: function(e = !1) {
        t.workTime = !e
        t.snooze = false
        t.workTime ? t.working() : t.pausing()
    }
}

t.setItUp()
t.init()

chrome.idle.onStateChanged.addListener(function(e){
    if(e != 'active'){
        t.snooze = !0
        t.workTime = !0
        t.setBadge()
        clearTimeout(t.timer)
    }else if(t.workTime){
        t.init()
    }else{
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/pause.png',
            title: 'Don\'t do this!',
            message: 'Please! Release your mouse and relax 😠'
        })
    }
})

chrome.tabs.onRemoved.addListener((id) => {
    if (t.pauseTabId == id)
        t.init()
})

chrome.browserAction.onClicked.addListener(function(tab) {
    if (t.workTime) {
        t.init(true)
    } else {
        t.init()
        chrome.tabs.remove(t.pauseTabId)
    }
});