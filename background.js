'use strict'

const d = {
    work: 25*60,
    pause: 5*60,
    delay: 3*60,
    withoutId: ['onMoved', 'onHighlighted', 'onReplaced', 'onZoomChange'],
    withId: ['onUpdated', 'onActivated', 'onDetached', 'onAttached', 'onRemoved']
}
var time = {
    workTime: !0,
    delay: function(){
        if(time.delaying)
            clearTimeout(time.delaying)
        time.delaying = setTimeout(function() {
            if(time.workTime){
                time.workTime = !0
                time.count(d.work)
            }
            console.log('delayed')
            time.delay()
        }, d.delay * 1000);
        console.log('delay reset')
    },
    count: function(t){
        if(time.timer)
            clearTimeout(time.timer)
        time.timer = setTimeout(function() {
            if(time.workTime)
                chrome.tabs.create({'url': chrome.extension.getURL('options.html')});
            time.workTime = !time.workTime
            time.count(time.workTime?d.work:d.pause)
        }, t * 1000);
    },
    init: function(){
        time.delay()
        time.count(d.work)
    }
}
time.init();

    // reset delay events
    chrome.tabs.onCreated.addListener((tab)=>{
        d.withId.forEach(function(el){
            chrome.tabs[el].addListener(tab.id, ()=>{
                time.delay()
            })
        });
        time.delay()
    })
    d.withoutId.forEach(function(el){
        chrome.tabs[el].addListener(()=>{
            time.delay()
        })
    });
    // The end of delay events