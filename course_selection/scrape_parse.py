"""
Scrapes OIT's Web Feeds to add courses and sections to database.

Procedure:

- Get list of departments (3-letter department codes)
- Run this: http://etcweb.princeton.edu/webfeeds/courseofferings/?term=current&subject=COS
- Parse it for courses, sections, and lecture times (as recurring events)
"""

from mobileapp import MobileApp


class ParseError(Exception):
    def __init__(self, value):
        self.value = value

    def __str__(self):
        return repr(self.value)


def scrape_parse_semester(term_code):
    TERM_CODE = term_code
    CURRENT_SEMESTER = [""]

    def get_text(key, object):
        return raise_if_none(object.get(key), "key " + key + " does not exist")

    def get_current_semester(data):
        """get semester according to TERM_CODE"""
        # global CURRENT_SEMESTER
        if not CURRENT_SEMESTER[0]:
            term = data["term"][0]
            CURRENT_SEMESTER[0] = {
                "start_date": get_text("start_date", term),
                "end_date": get_text("end_date", term),
                "term_code": str(TERM_CODE),
            }
        return CURRENT_SEMESTER[0]

    def get_department_list():
        res = MobileApp().get_courses(term=term_code, subject="list")

        try:
            codes = [k["code"] for k in res["term"][0]["subjects"]]
            codes[0] and codes[1]
        except:
            raise Exception("failed to get all department codes")

        return codes

    def scrape_all():
        """scrape all events from Princeton's course webfeed"""
        # global course_count
        # global section_count
        departments = get_department_list()
        courses = []
        for department in departments:
            print("Processing " + department)
            courses += scrape(department)
        return courses

    # goes through the listings for this department
    def scrape(department):
        """Scrape all events listed under department"""
        data = MobileApp().get_courses(term=TERM_CODE, subject=department)
        if data["term"][0].get("subjects") is None:
            print("Empty MobileApp response")
            return []
        parsed_courses = []
        try:
            for subject in data["term"][0]["subjects"]:
                for course in subject["courses"]:
                    x = parse_course(data, course, subject)
                    if x is not None:
                        parsed_courses.append(x)
        except Exception as e:
            print("Potential missing key")
            return []
        return parsed_courses

    def none_to_empty(text):
        if text is None:
            return ""
        else:
            return text

    def none_to_empty_list(x):
        if x is None:
            return []
        else:
            return x

    def raise_if_none(text, error_message):
        if text is None:
            raise ParseError(error_message)
        return text

    # Parse it for courses, sections, and lecture times (as recurring events)
    # If the course with this ID exists in the database, we update the course
    # Otherwise, create new course with the information
    def parse_course(data, course, subject):
        """create a course with basic information."""
        try:
            # global new_course_count
            # global course_count
            return {
                "title": course["title"],
                "guid": course["guid"],
                "description": none_to_empty(course["detail"]["description"]),
                "semester": get_current_semester(data),
                "professors": [parse_prof(x) for x in course["instructors"]],
                "course_listings": parse_listings(course, subject),
                "sections": [parse_section(x) for x in course["classes"]],
            }
        except Exception as inst:
            # print inst
            raise inst
            return None

    # may decide to make this function for just one prof/listing/section, then
    # do a map
    def parse_prof(prof):
        return {"full_name": prof["full_name"]}

    def parse_listings(course, subject):
        def parse_cross_listing(cross_listing):
            return {
                "dept": cross_listing["subject"],
                "code": cross_listing["catalog_number"],
                "is_primary": False,
            }

        cross_listings = [
            parse_cross_listing(x) for x in none_to_empty_list(course["crosslistings"])
        ]
        primary_listing = {
            "dept": get_text("code", subject),
            "code": course["catalog_number"],
            "is_primary": True,
        }
        return cross_listings + [primary_listing]

    def parse_section(section):
        def parse_meeting(meeting):
            def get_days(meeting):
                days = ""
                for day in meeting["days"]:
                    days += day + " "
                return days[:10]

            def get_location(meeting):
                location = ""
                try:
                    building = meeting["building"]["name"]
                    room = meeting["room"]
                    location = building + " " + room
                except Exception as e:
                    raise e
                finally:
                    return location

            # the times are in the format:
            # HH:MM AM/PM
            return {
                "start_time": "01:00 AM"
                if "start_time" not in meeting
                else meeting["start_time"],
                "end_time": "01:00 AM"
                if "end_time" not in meeting
                else meeting["end_time"],
                "days": get_days(meeting),
                "location": get_location(meeting),
            }

        # NOTE: section.find('schedule') doesn't seem to be used
        meetings = None
        schedule = section["schedule"]
        if schedule is not None:
            meetings = schedule["meetings"]

        typeName = "UNKNOWN"
        if get_text("section", section) != "M99":
            try:
                typeName = get_text("type_name", section)
            except:
                print("error reading section")

        test = {
            "registrar_id": get_text("class_number", section),
            "name": get_text("section", section),
            "type": typeName[0:3].upper(),
            "capacity": get_text("capacity", section),
            "enrollment": get_text("enrollment", section),
            "meetings": [parse_meeting(x) for x in none_to_empty_list(meetings)],
        }
        return test

    return scrape_all()
