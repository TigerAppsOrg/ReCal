define(["require", "exports", '../../../library/Color/Color', '../Courses/CoursesModel', '../../../library/DataStructures/Dictionary', '../Courses/SectionsModel', '../Courses/SectionTypesModel'], function(require, exports, Color, CoursesModel, Dictionary, SectionsModel, SectionTypesModel) {
    var UserProfilesServerDataToModelConverter = (function () {
        function UserProfilesServerDataToModelConverter(_user) {
            this._user = _user;
        }
        Object.defineProperty(UserProfilesServerDataToModelConverter.prototype, "user", {
            get: function () {
                return this._user;
            },
            enumerable: true,
            configurable: true
        });

        UserProfilesServerDataToModelConverter.prototype.convertSectionDataToModel = function (data) {
            return new SectionsModel({
                sectionId: data.section_id.toString(),
                title: data.section_name,
                color: Color.fromHex(data.section_color),
                sectionTypesModel: new SectionTypesModel({
                    code: data.section_type_code,
                    displayText: data.section_type_code
                })
            });
        };

        UserProfilesServerDataToModelConverter.prototype.convertCourseDataToModel = function (data) {
            var _this = this;
            return new CoursesModel({
                courseId: data.course_id.toString(),
                title: data.course_title,
                description: data.course_description,
                courseListings: data.course_listings.split(/\s*\/\s*/),
                primaryListing: data.course_primary_listing,
                sectionsModels: data.sections.map(function (sectionData) {
                    return _this.convertSectionDataToModel(sectionData);
                })
            });
        };

        UserProfilesServerDataToModelConverter.prototype.updateUserProfilesModelWithServerData = function (data) {
            var _this = this;
            this.user.username = data.username;
            this.user.displayName = data.display_name;
            this.user.enrolledCoursesModels = data.enrolled_courses.map(function (courseData) {
                return _this.convertCourseDataToModel(courseData);
            });
            this.user.eventTypes = new Dictionary(function (a, b) {
                return a === b;
            }, data.event_types);
            this.user.agendaVisibleEventTypeCodes = data.agenda_pref;
            this.user.calendarVisibleEventTypeCodes = data.calendar_pref;
            return this.user;
        };
        return UserProfilesServerDataToModelConverter;
    })();

    
    return UserProfilesServerDataToModelConverter;
});