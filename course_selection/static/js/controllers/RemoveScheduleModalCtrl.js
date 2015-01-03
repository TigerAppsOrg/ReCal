define(["require", "exports"], function(require, exports) {
    var RemoveScheduleModalCtrl = (function () {
        function RemoveScheduleModalCtrl($scope, $modalInstance, title) {
            var _this = this;
            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.$scope.message = "You want to delete the schedule: " + title;

            this.$scope.ok = function () {
                _this.ok();
            };

            this.$scope.cancel = function () {
                _this.cancel();
            };
        }
        RemoveScheduleModalCtrl.prototype.ok = function () {
            this.$modalInstance.close();
        };

        RemoveScheduleModalCtrl.prototype.cancel = function () {
            this.$modalInstance.dismiss('cancel');
        };
        RemoveScheduleModalCtrl.$inject = [
            '$scope',
            '$modalInstance',
            'title'
        ];
        return RemoveScheduleModalCtrl;
    })();

    
    return RemoveScheduleModalCtrl;
});