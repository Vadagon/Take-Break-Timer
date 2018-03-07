var app = angular.module('app', []);
app.controller('ctrl', function($scope) {
	sGet((e)=>{
		$scope.swither = !e
		$scope.$apply()
		$scope.$watch('swither', function(){
			$scope.swither?$scope.do(1):$scope.do(3)
		})
	})
	
    $scope.do = function(e){
		chrome.runtime.sendMessage({
			c: e
		})
    }
});
function sGet(callback){
    chrome.storage.local.get('data', function(items){
        callback(items.data)
    })
}