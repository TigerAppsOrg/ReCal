/// <reference path="../../../nice/static/ts/typings/tsd.d.ts" />
function staticPath(path) {
    return '../' + path;
}

function bowerPath(path) {
    return staticPath('bower_components/' + path);
}

require.config({
    paths: {
        bootstrap: bowerPath('bootstrap/dist/js/bootstrap.min'),
        fullcalendar: bowerPath('fullcalendar/dist/fullcalendar.min'),
        jquery: bowerPath('jquery/dist/jquery.min'),
        'jquery.cookie': bowerPath('jquery.cookie/jquery.cookie'),
        jqueryui: bowerPath('jquery-ui/jquery-ui.min'),
        moment: bowerPath('momentjs/min/moment.min'),
        'moment-timezone': bowerPath('moment-timezone/builds/moment-timezone-with-data'),
        'angular': bowerPath('angular/angular.min'),
        'angular-resource': bowerPath('angular-resource/angular-resource.min'),
        'angular-ui-calendar': bowerPath('angular-ui-calendar/src/calendar'),
        'angular-bootstrap': bowerPath('angular-bootstrap/ui-bootstrap-tpls.min'),
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

require([
    'angular',
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
