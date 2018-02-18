'use strict'

var d = {
    work: 52 * 60,
    pause: 17 * 60,
    delay: 5 * 60,
    events: ['onMoved', 'onHighlighted', 'onReplaced', 'onZoomChange', 'onUpdated', 'onActivated', 'onDetached', 'onAttached', 'onRemoved', 'onCreated']
}

var time = {
    workTime: !0,
    pauseTabId: !1,
    snooze: !1,
    timing: d.work,
    delay: function() {
        time.snooze = !1
        if (time.delaying)
            clearTimeout(time.delaying)
        time.delaying = setTimeout(function() {
            if (time.workTime) {
                time.snooze = !0
                time.workTime = !1
                console.log('work stopped', time.snooze)
                time.timing = !1
                time.setBadge()
            } else if (!time.snooze) {
                time.delay()
            }
        }, d.delay * 1000);
    },
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
        chrome.tabs.create({ 'url': chrome.extension.getURL('options.html') }, function(tab) { time.pauseTabId = tab.id });
        time.workTime = !1
        time.timing = d.pause
        time.setBadge()
    },
    setBadge: function() {
        chrome.browserAction.setIcon({ path: 'images/' + (time.workTime ? 'play' : (time.snooze ? 'stop' : 'pause')) + '.png' })
    },
    init: function(e = !1) {
        time.delay()
        time.workTime = !e
        time.workTime ? time.working() : time.pausing()

        setInterval(function() {
            if (!time.timing || time.timing < 0) {
                chrome.browserAction.setBadgeText({ text: '' })
            } else {
                time.timing--;
                var time2Show = Math.round(time.timing / 60).toString()
                chrome.browserAction.setBadgeText({ text: time2Show })
            }
        }, 1000);
    }
}

time.init();

// reset delay events
d.events.forEach(function(el) {
    chrome.tabs[el].addListener((id) => {
        console.log(time.snooze)
        if ((el == 'onRemoved' && time.pauseTabId == id) || time.snooze) {
            time.init()
        } else {
            time.delay()
        }
    })
});
// The end of delay events

chrome.browserAction.onClicked.addListener(function(tab) {
    if (time.workTime) {
        time.init(true)
    } else {
        time.init()
        chrome.tabs.remove(time.pauseTabId)
    }
});