/// <reference path="../../../nice/static/ts/typings/tsd.d.ts" />

function staticPath(path: String): String
{
    return '../' + path;
}

function bowerPath(path: String): String
{
    return staticPath('bower_components/' + path);
}

require.config({
    paths: {
        bootstrap: bowerPath('bootstrap/dist/js/bootstrap'),
        fullcalendar: bowerPath('fullcalendar/dist/fullcalendar'),
        jquery: bowerPath('jquery/dist/jquery'),
        'jquery.cookie': bowerPath('jquery.cookie/jquery.cookie'),
        jqueryui: bowerPath('jquery-ui/jquery-ui'),
        moment: bowerPath('momentjs/moment'),
        'moment-timezone': bowerPath('moment-timezone/builds/moment-timezone-with-data'),
        'angular': bowerPath('angular/angular'),
        'angular-resource': bowerPath('angular-resource/angular-resource'),
        'angular-ui-calendar': bowerPath('angular-ui-calendar/src/calendar'),
        'angular-bootstrap': bowerPath('angular-bootstrap/ui-bootstrap-tpls'),
        'angular-local-storage': bowerPath('angular-local-storage/dist/angular-local-storage.min')
    },
    shim: {
        bootstrap: ['jquery'],
        fullcalendar: ['jqueryui'],
        'angular': { exports: 'angular', dep: ['jquery'] },
        'angular-resource': ['angular'],
        'angular-ui-calendar': ['angular'],
        'angular-bootstrap': ['angular'],
        'angularRoute': ['angular'],
        'angular-local-storage': ['angular']
    },
    priority: [
		"angular"
	]
});

require(['angular', 
        'angular-local-storage',
        'angular-resource', 
        'moment',
        'fullcalendar',
        'angular-ui-calendar', 
        'angular-bootstrap', 
        'Application', 
        'controllers/Controllers',
        'filters/Filters',
        'services/Services',
        'jquery',
        'bootstrap'
        ], function (angular) {
    angular.bootstrap(document, ['nice']);
});

// TypeScript declarations useful for importing angular modules
declare module 'angular' {
    var angular: ng.IAngularStatic;
    export = angular;
}
