/// <reference path="../../../typings/tsd.d.ts" />

import $ = require('jquery');
import moment = require('moment');

import Agenda = require('./Agenda');
import TableViewHeaderView = require('../../../library/Table/TableViewHeaderView');
import GlobalInstancesManager = require('../../common/GlobalInstancesManager');

import IAgendaTableViewHeaderView = Agenda.IAgendaTableViewHeaderView;

class AgendaTableViewHeaderView extends TableViewHeaderView implements IAgendaTableViewHeaderView
{
    private static _templateSelector = '#agenda-header-template';

    public static fromTemplate(): AgendaTableViewHeaderView
    {
        return <AgendaTableViewHeaderView> this.fromJQuery(GlobalInstancesManager.instance.viewTemplateRetriever.retrieveTemplate(AgendaTableViewHeaderView._templateSelector));
    }

    public setTitle(text: string): void
    {
        this._$el.find('#agenda-header-text').text(text);
    }
}

export = AgendaTableViewHeaderView;