/// <amd-dependency path="angular"/>
define(["require", "exports", './ResourceBuilder', './CourseService', './UserService', './ScheduleService', './SemesterService', "angular"], function(require, exports, ResourceBuilder, CourseService, UserService, ScheduleService, SemesterService) {
    var niceServices = angular.module('niceServices', []);

    niceServices.factory('ResourceBuilder', ['$resource', 'localStorageService', function ($resource, localStorageService) {
            return new ResourceBuilder($resource, localStorageService);
        }]);

    niceServices.factory('ScheduleResource', ["ResourceBuilder", function (builder) {
            return builder.getScheduleResource();
        }]);
    niceServices.factory('CourseResource', ["ResourceBuilder", function (builder) {
            return builder.getCourseResource();
        }]);
    niceServices.factory('ColorResource', ["ResourceBuilder", function (builder) {
            return builder.getColorResource();
        }]);
    niceServices.factory('UserResource', ['ResourceBuilder', function (builder) {
            return builder.getUserResource();
        }]);
    niceServices.factory('SemesterResource', ['ResourceBuilder', function (builder) {
            return builder.getSemesterResource();
        }]);

    niceServices.service('CourseService', CourseService);
    niceServices.service('UserService', UserService);
    niceServices.service('ScheduleService', ScheduleService);
    niceServices.service('SemesterService', SemesterService);

    
    return niceServices;
});