/// <reference path="../../typings/tsd.d.ts" />

/// <amd-dependency path="jquery.cookie" />
import $ = require('jquery');

import CoreUI = require('../../library/CoreUI/CoreUI');
import DashboardViewController = require('./DashboardViewController');
import UserProfiles = require('../common/UserProfiles/UserProfiles');
import UserProfilesModel = require('../common/UserProfiles/UserProfilesModel');
import UserProfilesServerDataToModelConverter = require('../common/UserProfiles/UserProfilesServerDataToModelConverter');
import View = require('../../library/CoreUI/View');

import IUserProfilesModel = UserProfiles.IUserProfilesModel;
import IView = CoreUI.IView;
import IViewController = CoreUI.IViewController;

declare var USER_NETID: string;
declare var USER_PROFILE: string;

class DashboardInitializer
{
    private _rootViewController: IViewController = null;
    private get rootViewController(): IViewController
    {
        return this._rootViewController;
    }

    private set rootViewController(value: IViewController)
    {
        this._rootViewController = value;
    }

    private _user: IUserProfilesModel = null;
    private get user(): IUserProfilesModel { return this._user; }

    private set user(value: IUserProfilesModel) { this._user = value; }

    public initialize(): void
    {
        var csrfToken = $.cookie('csrftoken');
        var csrfSafeMethod = (method)=>
        {
            // these HTTP methods do not require CSRF protection
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        };
        var sameOrigin = (url)=>
        {
            // test that a given url is a same-origin URL
            // url could be relative or scheme relative or absolute
            var host = document.location.host; // host + port
            var protocol = document.location.protocol;
            var sr_origin = '//' + host;
            var origin = protocol + sr_origin;
            // Allow absolute or scheme relative URLs to same origin
            return (url == origin || url.slice(0, origin.length + 1) == origin
                    + '/') ||
                (url == sr_origin || url.slice(0, sr_origin.length + 1)
                 == sr_origin + '/') ||
                // or any other URL that isn't scheme relative or absolute i.e relative.
                !(/^(\/\/|http:|https:).*/.test(url));
        };

        $.ajaxSetup({
            beforeSend: function (xhr, settings)
            {
                if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url))
                {
                    // Send the token to same-origin, relative URLs only.
                    // Send the token only if the method warrants CSRF protection
                    // Using the CSRFToken value acquired earlier
                    xhr.setRequestHeader("X-CSRFToken", csrfToken);
                }
            },
        });
        // set up user
        this.user = new UserProfilesModel({
            username: USER_NETID
        });
        var converter = new UserProfilesServerDataToModelConverter(this.user);
        this.user =
            converter.updateUserProfilesModelWithServerData(JSON.parse(USER_PROFILE));

        // set up Dashboard View Controller
        var dashboardView: IView = View.fromJQuery($('body'));
        var dashboardVC: DashboardViewController = new DashboardViewController(dashboardView,
                {
                    user: this.user,
                });

        this.rootViewController = dashboardVC;

        // TODO state restoration happens in this class?
    }
}

export = DashboardInitializer;