var app = angular.module('app', []);
app.controller('ctrl', function($scope) {
	$scope.tab = {
		settings: !0
	}
	$scope.d = {
		work: 52,
	    pause: 17,
	    delay: 4,
	    sound: !1
	}
	sGet('data', (e)=>{
		$scope.d = e.d;
		$scope.d = d(1/60)
		$scope.swither = !e.terminated;
		$scope.$apply();
		$scope.switching = function(){
			$scope.swither?$scope.do(1):$scope.do(3);
		}
	})
	
    $scope.do = function(e, event){
    	if(e==1){
    		$scope.swither = !0
    	}
    	if(e==11){
    		event.target.textContent = 'Saved!'
    		sSet()
    	}
		chrome.runtime.sendMessage({
			c: e,
			d: d()
		})
    }





	function sGet(e, callback){
	    chrome.storage.local.get(e, function(items){
	        callback(items[e])
	    })
	}
	function sSet(){
	    chrome.storage.local.set({data: {terminated: !$scope.swither, d: d()}})
	}
	function d(e = 60){
		return {
			work: $scope.d.work * e,
		    pause: $scope.d.pause * e,
		    delay: $scope.d.delay * e,
		    sound: $scope.d.sound
		}
	}
});