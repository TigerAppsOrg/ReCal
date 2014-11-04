/***************************************************
 * Main Module
 * Think of this module as the main() function. 
 * It is the first thing that gets called
 **************************************************/
var NAV_ID = ["agendatab", "calendartab"];
var TAB_ID = ["agenda", "calendar"];
var SECTION_MAP;
var SECTION_MAP_INVERSE;
var COURSE_MAP;
var COURSE_SECTIONS_MAP;
var COURSE_FILTER_BLACKLIST;

function init()
{
    //pinnedIDs = new Set();

    // initializing
    //LO_init();
    RF_init();
    
    // set up ajax, so it shows loading indicator and send csrf properly
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                // Send the token to same-origin, relative URLs only.
                // Send the token only if the method warrants CSRF protection
                // Using the CSRFToken value acquired earlier
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            // xhr.setRequestHeader('term_code', CUR_SEM.term_code);
            if (settings.loadingIndicator == false)
                return;
            var loadingID = settings.loadingID;
            if (typeof loadingID == 'undefined')
                loadingID = settings.url;
            //LO_showLoading(loadingID);
        },
    });
    $(document).ajaxSuccess(function(event, xhr, settings){
        var loadingID = settings.loadingID;
        if (typeof loadingID == 'undefined')
            loadingID = settings.url;
        //LO_hideLoading(loadingID);
    });
    $(document).ajaxError(function(event, xhr, settings){
        var loadingID = settings.loadingID;
        if (typeof loadingID == 'undefined')
            loadingID = settings.url;
        //LO_hideLoading(loadingID, false);
        if (settings.loadingIndicator == false)
            return;
        //LO_showError(loadingID);
    });

    // more inits
    CacheMan_init();

    // get section info
    SECTION_MAP = JSON.parse(CacheMan_load('/all-sections'));
    SECTION_MAP_INVERSE = {};
    $.each(SECTION_MAP, function (key, value) {
        SECTION_MAP_INVERSE[value.toLowerCase()] = key;
    });
    SECTION_COLOR_MAP = JSON.parse(CacheMan_load('/get/section-colors'));

    var loaded = JSON.parse(CacheMan_load('/all-courses'));
    COURSE_MAP = loaded.courses;
    COURSE_SECTIONS_MAP = loaded.course_sections_map;
    COURSE_FILTER_BLACKLIST = new Set();

    // verify local storage
    if ('localStorage' in window && window['localStorage'] !== null)
    {
        var sectionsMap = localStorage.getItem('sectionsmap');
        var user = localStorage.getItem('user');
        if (!sectionsMap || sectionsMap != CacheMan_load('/get/sections') || !user || user != USER_NETID)
        {
            clearLocalStorage();
            localStorage.setItem('sectionsmap', CacheMan_load('/get/sections'));
            localStorage.setItem('user', USER_NETID);
        }
    }
   
    
    // more inits
    //SB_init();
    SR_init();
    //EventsMan_init();
    //PopUp_init();
    //NO_init();
    //Agenda_init();
    //Cal_init();
    SE_init();
    Tutorial_Setup();

    // state restoration
    SR_addWillSaveListener(function (){
        Nav_save();
        UI_save();
    });
    SR_addDidLoadListener(function (){
        Nav_load();
        UI_load();
    });

    // if event id changes, manage the ui module accordingly
    // EventsMan_addEventIDsChangeListener(function(oldID, newID){
    //     if (UI_isMain(oldID))
    //         UI_setMain(newID);
    //     else if (UI_isPinned(oldID))
    //     {
    //         UI_unpin(oldID);
    //         UI_pin(newID);
    //     }
    // });

    // load the correct theme
    if (THEME == 'w')
        loadWhiteTheme();
    else
        loadDarkTheme();

    // initialize tooltip
    $('.withtooltip').tooltip({});

    // handle resize
    $(window).on('resize', function(ev){
        adaptSize();
    });
    adaptSize();

    // check for unapproved revisions
    // UR_pullUnapprovedRevisions();

    // check for unapproved revisions at 10 seconds interval
    RF_addRecurringFunction(function(isInterval){
        updatePoints();
    }, 5 * 1000, 2 * 60 * 1000);
    RF_addRecurringFunction(function(isInterval){
        // UR_pullUnapprovedRevisions();
    }, 10 * 1000, 5 * 60 * 1000);
}

/**
 * This is how we are responsive
 */
function adaptSize()
{
    if (window.innerWidth <= 768)
    {
        // tablet
        $('#agendatab').tab('show');
        $('#sb-left-container').removeClass('col-xs-4 col-xs-12 col-xs-8');
        $('#sb-left-container').addClass('col-xs-8');
    }
    else
    {
        // desktop
        $('#sb-left-container').removeClass('col-xs-4 col-xs-12 col-xs-8');
        $('#sb-left-container').addClass('col-xs-4');
    }
    if (window.innerWidth <= 400)
    {
        $('#sb-left-container').removeClass('col-xs-4 col-xs-12 col-xs-8');
        $('#sb-left-container').addClass('col-xs-12');
    } else {
    }
}

/***************************************************
 * State restoration for nav and popup
 **************************************************/
function Nav_save()
{
    var id = $("#maintab").find(".active").find("a")[0].id;
    SR_put("nav_page", NAV_ID.indexOf(id));
}
function Nav_load()
{
    var index = SR_get("nav_page");
    if (index == null)
        return;
    $("#maintab #"+NAV_ID[index]).tab("show");
}


function UI_save()
{
    SR_put('pinned_IDs', JSON.stringify(pinnedIDs));
    SR_put('main_ID', mainID);
}
function UI_load()
{
    if (SR_get('pinned_IDs') != null)
    {
        var savedPinnedIDs = JSON.parse(SR_get('pinned_IDs'));
        $.each(savedPinnedIDs, function (key, value) {
            if (PopUp_getPopUpByID(key) != null)
                UI_pin(key);
        });
        //$.removeCookie('pinned_IDs');
    } 
    if (SR_get('main_ID') != null)
    {
        if (SR_get('main_ID') != 'null')
            if (PopUp_getPopUpByID(SR_get('main_ID')) != null)
                UI_setMain(SR_get('main_ID'));
        //$.removeCookie('main_ID')
    }
}
/***************************************************
 * Miscellaneous
 **************************************************/
/**
 * A helpful method to disable all user interactions
 */
function disableAllInteractions()
{
    var disabler = $('<div id="disabler"></div>');
    $(disabler).prependTo('.tab-content').css({
        height: '100%',
        width: '100%',
        opacity: 0,
        position: 'absolute',
        left: 0,
        top: 0,
        'z-index': 900,
        cursor: 'not-allowed'
    });
}
function enableAllInteractions()
{
    $('#disabler').remove();
}

/**
 * Toggle tutorial
 */
function toggleInfo()
{
    $('.main-content').toggleClass('main-hidden');
    $('#about-content').toggleClass('about-hidden');
}
function onLogOut()
{
    clearLocalStorage();
}

function clearLocalStorage()
{
    if ('localStorage' in window && window['localStorage'] !== null)
    {
        localStorage.removeItem('sectionsmap');
        localStorage.removeItem('eventsman.events');
        localStorage.removeItem('eventsman.hidden');
        localStorage.removeItem('eventsman.lastsyncedtime');
        localStorage.removeItem('user');
        localStorage.removeItem('state-restoration');
    } 
}
function updatePoints()
{
    $.ajax('/api/point_count', {
        loadingIndicator: false,
        dataType: 'json',
        success: function(data){
            POINT_COUNT = data;
            $('#point_count').text(POINT_COUNT);
        }
    });
}