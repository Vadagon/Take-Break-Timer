var app = angular.module('app', []);
app.controller('ctrl', function($scope) {
	$scope.tab = {
		settings: !0
	}
	$scope.d = {
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
	sGet('data', (e)=>{
		$scope.d = e.d;
		$scope.d = d(1/60)
		$scope.swither = !e.terminated;
		$scope.$apply();
		$scope.switching = function(){
			console.log(12)
			var c = 5;
			if(!$scope.swither) c = 6;
			$scope.d.isSafe = !$scope.swither
			$scope.d.work = $scope.d.isSafe?$scope.d.safeMode.work:$scope.d.workMode.work;
	    	$scope.d.pause = $scope.d.isSafe?$scope.d.safeMode.pause:$scope.d.workMode.pause;
			chrome.runtime.sendMessage({
				c: c,
				d: d()
			})
		}
	})
	
    $scope.do = function(e, event){
    	if(e == 1){
    		window.close()
    	}
		if(e == 2){
    		window.close()
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
		    sound: $scope.d.sound,
		    isSafe: $scope.d.isSafe,
		    workMode: {
		        work: $scope.d.workMode.work * e,
		        pause: $scope.d.workMode.pause * e
		    },
		    safeMode: {
		        work: $scope.d.safeMode.work * e,
		        pause: $scope.d.safeMode.pause * e
		    }
		}
	}
});