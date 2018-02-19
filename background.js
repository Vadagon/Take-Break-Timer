'use strict'

var d = {
    work: 52 * 60,
    pause: 17 * 60,
    delay: 3 * 60
}

var time = {
    workTime: !0,
    pauseTabId: !1,
    snooze: !1,
    timing: d.work,
    working: function() {
        if (time.timer)
            clearTimeout(time.timer)
        time.timer = setTimeout(function() {
            time.pausing()
        }, d.work * 1000);
        time.workTime = !0
        time.timing = d.work
        time.setBadge()
    },
    pausing: function() {
        clearTimeout(time.timer)
        chrome.tabs.create({ 'url': chrome.extension.getURL('timer.html') }, function(tab) { time.pauseTabId = tab.id });
        time.workTime = !1
        time.timing = d.pause
        time.setBadge()
    },
    setBadge: function() {
        chrome.browserAction.setIcon({ path: 'images/' + (time.workTime ? 'play' : (time.snooze ? 'stop' : 'pause')) + '.png' })
        if (time.badGeTime)
            clearTimeout(time.badGeTime)
        time.badGeTime = setInterval(function() {
            if (!time.timing || time.timing < 0) {
                chrome.browserAction.setBadgeText({ text: '' })
            } else {
                time.timing--;
                var time2Show = Math.round(time.timing / 60).toString()
                chrome.browserAction.setBadgeText({ text: time2Show })
            }
        }, 1000);
    },
    setItUp: function(){
        chrome.idle.setDetectionInterval(d.delay)
        chrome.browserAction.setBadgeBackgroundColor({color: '#404040'})
    },
    init: function(e = !1) {
        time.workTime = !e
        time.snooze = false
        time.workTime ? time.working() : time.pausing()
    }
}

time.init()
time.setItUp()

chrome.idle.onStateChanged.addListener(function(e){
    if(e != 'active'){
        time.snooze = !0
        time.workTime = !1
        time.setBadge()
        clearTimeout(time.timer)
    }else{
        time.init()
    }
})

chrome.browserAction.onClicked.addListener(function(tab) {
    if (time.workTime) {
        time.init(true)
    } else {
        time.init()
        chrome.tabs.remove(time.pauseTabId)
    }
});