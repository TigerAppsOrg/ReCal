import ActionSheet = require('../../../library/ActionSheet/ActionSheet');
import ActionSheetType = require('../../../library/ActionSheet/ActionSheetType');
import ActionSheetView = require('../../../library/ActionSheet/ActionSheetView');
import BrowserEvents = require('../../../library/Core/BrowserEvents');
import ClickToEdit = require('../../../library/ClickToEdit/ClickToEdit');
import ClickToEditBaseView = require('../../../library/ClickToEdit/ClickToEditBaseView');
import ClickToEditSelectView = require('../../../library/ClickToEdit/ClickToEditSelectView');
import ComparableResult = require('../../../library/Core/ComparableResult');
import CoreUI = require('../../../library/CoreUI/CoreUI');
import Courses = require('../Courses/Courses');
import Date = require('../../../library/DateTime/Date');
import DateTime = require('../../../library/DateTime/DateTime');
import Dictionary = require('../../../library/DataStructures/Dictionary');
import Events = require('../Events/Events');
import EventsModel = require('../Events/EventsModel');
import EventsPopUp = require('./EventsPopUp');
import EventsPopUpView = require('./EventsPopUpView');
import FocusableView = require('../../../library/CoreUI/FocusableView');
import ReCalCommonBrowserEvents = require('../ReCalCommonBrowserEvents');
import Time = require('../../../library/DateTime/Time');

import IActionSheetView = ActionSheet.IActionSheetView;
import EditableEventsPopUpViewDependencies = EventsPopUp.EditableEventsPopUpViewDependencies;
import IClickToEditViewFactory = ClickToEdit.IClickToEditViewFactory;
import IClickToEditView = ClickToEdit.IClickToEditView;
import IEventsModel = Events.IEventsModel;
import ISectionsModel = Courses.ISectionsModel;
import IView = CoreUI.IView;

class EditableEventsPopUpView extends EventsPopUpView
{
    private HIGHLIGHTED_CLASS = 'highlighted';

    private _modifiedEventsModel: IEventsModel = null;
    private get modifiedEventsModel(): IEventsModel { return this._modifiedEventsModel; }

    private set modifiedEventsModel(value: IEventsModel)
    {
        this._modifiedEventsModel = value;
    }

    public get possibleSections(): ISectionsModel[] { return this._possibleSections; }

    public set possibleSections(value: ISectionsModel[])
    {
        this._possibleSections = value;
        var sectionView = <ClickToEditSelectView> ClickToEditSelectView.fromJQuery(this.sectionJQuery);
        sectionView.selectOptions =
        this._possibleSections.map((sectionsModel: ISectionsModel,
                                    index: number)=>
        {
            return {
                value: sectionsModel.sectionId,
                displayText: sectionsModel.coursesModel.primaryListing + ' - '
                    + sectionsModel.title
            };
        });
        // TODO add listener for when section changes, important for when page loads slowly and this is not yet loaded.
    }

    public get possibleEventTypes(): Dictionary<string, string> { return this._possibleEventTypes; }

    public set possibleEventTypes(value: Dictionary<string, string>)
    {
        this._possibleEventTypes = value;
        var eventTypeView = <ClickToEditSelectView> ClickToEditSelectView.fromJQuery(this.eventTypeJQuery);
        eventTypeView.selectOptions =
        this._possibleEventTypes.allKeys().map((eventTypeCode: string)=>
        {
            return {
                value: eventTypeCode,
                displayText: this._possibleEventTypes.get(eventTypeCode),
            }
        });
        // TODO add listener for when event type changes
    }

    private _isModified: boolean = null;
    public get isModified(): boolean { return this._isModified; }

    public set isModified(value: boolean)
    {
        if (this._isModified !== value)
        {
            this._isModified = value;
            this.saveButton.viewIsHidden = !value;
        }
    }

    private _saveButton: FocusableView = null;
    private get saveButton(): FocusableView { return this._saveButton; }


    private _clickToEditViewFactory: IClickToEditViewFactory = null;
    private get clickToEditViewFactory(): IClickToEditViewFactory { return this._clickToEditViewFactory; }

    // if overwrite set, must also overwrite get
    public get eventsModel(): IEventsModel { return this._eventsModel; }

    public set eventsModel(value: IEventsModel)
    {
        if (this._eventsModel !== value)
        {
            this._eventsModel = value;
            this.modifiedEventsModel = new EventsModel(this._eventsModel);
            this.isModified = false;
            this.refresh();
        }
    }

    constructor($element: JQuery, cssClass: string,
                dependencies: EditableEventsPopUpViewDependencies)
    {
        super($element, cssClass);
        this._clickToEditViewFactory = dependencies.clickToEditViewFactory;
        this.initialize();
    }

    private initialize(): void
    {
        // initialize save button
        this._saveButton =
        <FocusableView> FocusableView.fromJQuery(this.findJQuery('#save_button'));
        this.saveButton.attachEventHandler(BrowserEvents.click,
            (ev: JQueryEventObject, extra: any) =>
            {
                this.saveChanges();
            });
        // initialize click to edit
        this.findJQuery('.clickToEdit').each(
            (index: number, element: Element)=>
            {
                var $element = $(element);
                var clickToEditView = <IClickToEditView> this.clickToEditViewFactory.createFromJQuery($element);
            });


        // add event handler for click to edit
        this.attachEventHandler(BrowserEvents.clickToEditComplete,
            (ev: JQueryEventObject, extra: {value: string; view: IClickToEditView})=>
            {
                var result = extra.value.trim();
                var view = extra.view;

                // if we reach this point, assume result is valid.
                if (view.is(this.titleJQuery))
                {
                    this.processModifiedTitle(result);
                }
                else if (view.is(this.descriptionJQuery))
                {
                    this.processModifiedDescription(result);
                }
                else if (view.is(this.locationJQuery))
                {
                    this.processModifiedLocation(result);
                }
                else if (view.is(this.sectionJQuery))
                {
                    this.processModifiedSection();
                }
                else if (view.is(this.eventTypeJQuery))
                {
                    this.processModifiedEventType();
                }
                else if (view.is(this.dateJQuery))
                {
                    this.processModifiedDate();
                }
                else if (view.is(this.startTimeJQuery))
                {
                    this.processModifiedStartTime();
                }
                else if (view.is(this.endTimeJQuery))
                {
                    this.processModifiedEndTime();
                }
                this.verifyAndCorrectEndTime(view);
                this.refresh();
            });
    }

    public handleCloseButtonClick(ev: JQueryEventObject)
    {
        if (this.isModified)
        {
            var actionSheet: IActionSheetView = new ActionSheetView();
            actionSheet.title = 'Save changes?';
            actionSheet.addChoice({
                identifier: 'no',
                displayText: 'No',
                type: ActionSheetType.important
            });
            actionSheet.addChoice({
                identifier: 'yes',
                displayText: 'Yes',
                type: ActionSheetType.default
            });
            this.closeButton.showViewInPopover(actionSheet);
            actionSheet.attachOneTimeEventHandler(BrowserEvents.actionSheetDidSelectChoice,
                (ev: JQueryEventObject, data: {identifier: string})=>
                {
                    if (data.identifier === 'yes')
                    {
                        this.saveChanges();
                    }
                    else
                    {
                        this.discardChanges();
                    }
                    super.handleCloseButtonClick(ev);
                });
        }
        else
        {
            super.handleCloseButtonClick(ev);
        }
    }

    public saveChanges(): void
    {
        this.triggerEvent(
            ReCalCommonBrowserEvents.editablePopUpDidSave,
            {
                modifiedEventsModel: this.modifiedEventsModel,
            }
        );
        this.eventsModel = this.modifiedEventsModel; // TODO do this here?
    }

    public discardChanges(): void
    {
        this.modifiedEventsModel = new EventsModel(this.eventsModel);
        this.isModified = false;
        this.refresh();
    }

    private processModifiedTitle(value: string): void
    {
        if (value !== this.modifiedEventsModel.title)
        {
            this.modifiedEventsModel.title = value;
            this.isModified = true;
        }
        this.updateModifiedTime();
    }

    private processModifiedDescription(value: string): void
    {
        if (value !== this.modifiedEventsModel.description)
        {
            this.modifiedEventsModel.description = value;
            this.isModified = true;
        }
        this.updateModifiedTime();
    }

    private processModifiedLocation(value: string): void
    {
        if (value !== this.modifiedEventsModel.location)
        {
            this.modifiedEventsModel.location = value;
            this.isModified = true;
        }
        this.updateModifiedTime();
    }

    private processModifiedSection(): void
    {
        this.modifiedEventsModel.sectionId =
        this.sectionJQuery.data('logical_value');
        if (this.modifiedEventsModel.sectionId !== this.eventsModel.sectionId)
        {
            this.isModified = true;
        }
        this.updateModifiedTime();
    }

    private processModifiedEventType(): void
    {
        this.modifiedEventsModel.eventTypeCode =
        this.eventTypeJQuery.data('logical_value');
        if (this.modifiedEventsModel.eventTypeCode
            !== this.eventsModel.eventTypeCode)
        {
            this.isModified = true;
        }
        this.updateModifiedTime();
    }

    private processModifiedStartTime(): void
    {
        var value = <Time> this.startTimeJQuery.data('logical_value');
        this.modifiedEventsModel.startDate.hours = value.hours;
        this.modifiedEventsModel.startDate.minutes = value.minutes;
        if (this.modifiedEventsModel.startDate.compareTo(this.eventsModel.startDate)
            !== ComparableResult.equal)
        {
            this.isModified = true;
        }
        this.updateModifiedTime();
    }

    private verifyAndCorrectEndTime(editedView: IClickToEditView): void
    {
        var endTimeView = <ClickToEditBaseView> ClickToEditBaseView.fromJQuery(this.endTimeJQuery);
        if (endTimeView.hasFocus && editedView !== endTimeView)
        {
            return; // already editing, don't verify just yet.
        }
        // verify that end time is after start time
        if (this.modifiedEventsModel.startDate.compareTo(this.modifiedEventsModel.endDate) !== ComparableResult.less)
        {
            var newEndDate = new DateTime(this.modifiedEventsModel.startDate);
            ++newEndDate.hours;
            while (newEndDate.hours < this.modifiedEventsModel.startDate.hours)
            {
                ++newEndDate.hours;
            }
            this.endTimeJQuery.data('logical_value', newEndDate);
            this.processModifiedEndTime();
        }
    }

    private processModifiedEndTime(): void
    {
        var value = <Time> this.endTimeJQuery.data('logical_value');
        this.modifiedEventsModel.endDate.hours = value.hours;
        this.modifiedEventsModel.endDate.minutes = value.minutes;
        if (this.modifiedEventsModel.endDate.compareTo(this.eventsModel.endDate)
            !== ComparableResult.equal)
        {
            this.isModified = true;
        }
        this.updateModifiedTime();
    }

    private processModifiedDate(): void
    {
        var value = <Date> this.dateJQuery.data('logical_value');
        this.modifiedEventsModel.startDate.year = value.year;
        this.modifiedEventsModel.startDate.month = value.month;
        this.modifiedEventsModel.startDate.date = value.date;
        this.modifiedEventsModel.endDate.year = value.year;
        this.modifiedEventsModel.endDate.month = value.month;
        this.modifiedEventsModel.endDate.date = value.date;
        if (this.modifiedEventsModel.startDate.compareTo(this.eventsModel.startDate)
            !== ComparableResult.equal)
        {
            this.isModified = true;
        }
        this.updateModifiedTime();
    }

    private updateModifiedTime(): void
    {
        this.modifiedEventsModel.lastEdited = new DateTime();
    }

    public refresh(): void
    {
        this.refreshWithEventsModel(this.modifiedEventsModel);
        if (this.modifiedEventsModel.title !== this.eventsModel.title)
        {
            this.titleJQuery.addClass(this.HIGHLIGHTED_CLASS);
        }
        else
        {
            this.titleJQuery.removeClass(this.HIGHLIGHTED_CLASS);
        }
        if (this.modifiedEventsModel.description
            !== this.eventsModel.description)
        {
            this.descriptionJQuery.addClass(this.HIGHLIGHTED_CLASS);
        }
        else
        {
            this.descriptionJQuery.removeClass(this.HIGHLIGHTED_CLASS);
        }
        if (this.modifiedEventsModel.location !== this.eventsModel.location)
        {
            this.locationJQuery.addClass(this.HIGHLIGHTED_CLASS);
        }
        else
        {
            this.locationJQuery.removeClass(this.HIGHLIGHTED_CLASS);
        }
        if (this.modifiedEventsModel.sectionId !== this.eventsModel.sectionId)
        {
            this.sectionJQuery.addClass(this.HIGHLIGHTED_CLASS);
        }
        else
        {
            this.sectionJQuery.removeClass(this.HIGHLIGHTED_CLASS);
        }
        if (this.modifiedEventsModel.eventTypeCode
            !== this.eventsModel.eventTypeCode)
        {
            this.eventTypeJQuery.addClass(this.HIGHLIGHTED_CLASS);
        }
        else
        {
            this.eventTypeJQuery.removeClass(this.HIGHLIGHTED_CLASS);
        }
        if (this.modifiedEventsModel.startDate.hours
                !== this.eventsModel.startDate.hours
            || this.modifiedEventsModel.startDate.minutes
                !== this.eventsModel.startDate.minutes)
        {
            this.startTimeJQuery.addClass(this.HIGHLIGHTED_CLASS);
        }
        else
        {
            this.startTimeJQuery.removeClass(this.HIGHLIGHTED_CLASS);
        }

        if (this.modifiedEventsModel.startDate.year
                !== this.eventsModel.startDate.year
                || this.modifiedEventsModel.startDate.month
                !== this.eventsModel.startDate.month
            || this.modifiedEventsModel.startDate.date
                !== this.eventsModel.startDate.date)
        {
            this.dateJQuery.addClass(this.HIGHLIGHTED_CLASS);
        }
        else
        {
            this.dateJQuery.removeClass(this.HIGHLIGHTED_CLASS);
        }

        if (this.modifiedEventsModel.endDate.hours
                !== this.eventsModel.endDate.hours
            || this.modifiedEventsModel.endDate.minutes
                !== this.eventsModel.endDate.minutes)
        {
            this.endTimeJQuery.addClass(this.HIGHLIGHTED_CLASS);
        }
        else
        {
            this.endTimeJQuery.removeClass(this.HIGHLIGHTED_CLASS);
        }
    }
}
export = EditableEventsPopUpView;