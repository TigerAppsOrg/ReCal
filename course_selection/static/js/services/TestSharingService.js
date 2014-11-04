define(["require", "exports"], function(require, exports) {
    var TestSharingService = (function () {
        function TestSharingService() {
            this.data = {
                foo: 'foo',
                bar: 'bar',
                previewCourse: {},
                enrolledCourses: []
            };
            this.data.previewCourse = {};
            this.data.enrolledCourses = [];
        }
        TestSharingService.prototype.getData = function () {
            return this.data;
        };
        return TestSharingService;
    })();

    
    return TestSharingService;
});