/// <reference path="../../typings/tsd.d.ts" />
import $ = require('jquery');
import InvalidActionException = require('../Core/InvalidActionException');
import Set = require('../DataStructures/Set');
import View = require('./View');

class ViewController
{
    private static _viewControllerCount = 0; // Used to make sure toString() is unique
    private _viewControllerNumber: number;
    _view: View = null;
    _parentViewController : ViewController = null;
    _childViewControllers : Set<ViewController> = new Set<ViewController>();
    /******************************************************************
      Properties
      ****************************************************************/
    get view() : View
    {
        return this._view;
    }

    get parentViewController() : ViewController
    {
        return this._parentViewController;
    }

    get childViewControllers() : Array<ViewController>
    {
        return this._childViewControllers.toArray();
    }

    /******************************************************************
      Methods
      ****************************************************************/
    constructor(view : View)
    {
        this._viewControllerNumber = ViewController._viewControllerCount++;
        this._view = view;
    }

    addChildViewController(childVC : ViewController) : void
    {
        if (this._childViewControllers.contains(childVC))
        {
            throw new InvalidActionException('A child view controller can only be added once');
        }
        if (childVC._parentViewController != null)
        {
            throw new InvalidActionException('Child view controller already has a parent');
        }
        this._childViewControllers.add(childVC);
        childVC._parentViewController = this;
    }
    removeFromParentViewController() : void
    {
        if (this._parentViewController === null)
        {
            throw new InvalidActionException('The view controller has no parents');
        }
        this._parentViewController._childViewControllers.remove(this);
        this._parentViewController = null;
    }
    toString() : string
    {
        return 'View Controller no. ' + this._viewControllerNumber;
    }
}

export = ViewController;