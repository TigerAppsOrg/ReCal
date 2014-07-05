/// <reference path="../typings/tsd.d.ts" />
import $ = require('jquery');
import PopUpContainerViewController = require('../library/PopUp/PopUpContainerViewController');
import PopUpView = require('../library/PopUp/PopUpView');
import View = require('../library/CoreUI/View');

var containerView = View.fromJQuery($('#content'));
var containerVC = new PopUpContainerViewController(containerView);

(<any>window).addPopUp = function()
{
    var popUpView = PopUpView.fromJQuery($(popUpString));
    containerView.append(popUpView);
}

var popUpString = '<div id="popup-main123" class="main-content popup-container popup popup-event"> <h4 class="popup-ctrl theme"><a href="#" id="close_button" class="popup-ctrl theme" onclick="PopUp_clickedClose(this); return false;"><i class="fa fa-times"></i></a></h4><div class="panel panel-default panel-clipped"><div class="panel-heading panel-heading-handle"><h3 class="panel-title" ><span class="popup-title" id="popup-title" onclick="PopUp_clickedElement(this)">Event Name</span><div class="hide" id="popup-title-form"><input type="text" class="form-control" maxlength="100"></div><a href="#" id="unhide_button" onclick="PopUp_clickedUnhide(this); return false;" class="hide popup-ctrl"><!-- <span class="glyphicon glyphicon-eye-open"></span> --><i class="fa fa-eye"></i></a><a href="#" id="hide_button" onclick="PopUp_clickedDelete(this); return false;" class="popup-ctrl"><!-- <span class="glyphicon glyphicon-eye-close"></span> --><i class="fa fa-eye-slash"></i></a><a href="#" onclick="PopUp_clickedSavePopUp(this); return false;" id="save_button" class="popup-ctrl hide"><i class="fa fa-floppy-o"></i><!--Save--></a><!--<a href="#" onclick="PopUp_clickedClose(this); return false;" class="popup-ctrl popup-ctrl-right"><span class="glyphicon glyphicon-remove"></span></a> --></h3></div><div class="panel-body panel-body-scroll theme"><h6 class="popup-help-text center" >Click any field to edit...</h6><div class="popup-text-container theme"><h5 id="popup-date" onclick="PopUp_clickedElement(this)">April 1, 2014</h5><div class="hide" id="popup-date-form"><input type="{% if is_mobile %}date{% else %}text{% endif %}" class="form-control withdatepicker" required></div><div class="row"><div class="col-xs-5"><h5 id="popup-time-start" onclick="PopUp_clickedElement(this)">12:00 PM</h5><div class="hide" id="popup-time-start-form"><input type="{% if is_mobile %}time{% else %}text{% endif %}" class="form-control withtimepicker" data-date-format="MM/DD/YYYY" required></div></div><div class="col-xs-2"><h5>to</h5></div><div class="col-xs-5"><h5 id="popup-time-end" onclick="PopUp_clickedElement(this)">4:00 PM</h5><div class="hide" id="popup-time-end-form"><input type="{% if is_mobile %}time{% else %}text{% endif %}" class="form-control withtimepicker" data-date-format="MM/DD/YYYY" required></div></div></div></div><div class="popup-text-container theme"><span class="glyphicon glyphicon-map-marker"></span><h5 id="popup-loc" onclick="PopUp_clickedElement(this)">CS Building</h5><div class="hide" id="popup-loc-form"><input type="text" class="form-control" maxlength="100"></div></div><div class="popup-text-container theme"><h6 class="popup-help-text" for="popup-section">Class and Section:</h6> <h5 id="popup-section" onclick="PopUp_clickedElement(this)">Section</h5><div class="hide" id="popup-section-form"><input type="text" class="form-control withcustompicker withsectionpicker"></div><h6 class="popup-help-text" for="popup-type">Event Type:</h6> <h5 id="popup-type" onclick="PopUp_clickedElement(this)">Assignment</h5><div class="hide" id="popup-type-form"><input type="text" class="form-control withcustompicker withtypepicker"></div></div><div class="popup-text-container theme"><input id="popup-repeat" class="" type="checkbox" name="repeat" value="true"><label for="popup-repeat"><h5>&nbsp;&nbsp;Repeat</h5></label><div id="popup-repeat-pattern" class="popup-repeat-item hide"></div><div id="popup-repeat-interval" class="popup-repeat-item hide"></div><div></div></div><div class="popup-text-container theme"> <h6 class="popup-help-text" for="popup-description">Description:</h6> <h5 id="popup-desc" onclick="PopUp_clickedElement(this)"> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.            </h5> <div class="hide" id="popup-desc-form"><textarea class="form-control"></textarea></div></div></div><div class="panel-footer popup-last-edited-container"><h6 class="popup-last-edited"> last edited on <span id="popup-last-edited-time"> 05/13/2014 </span></h6></div></div></div>'
