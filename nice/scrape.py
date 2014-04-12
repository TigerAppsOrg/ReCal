"""
Scrapes OIT's Web Feeds to add courses and sections to database.

Procedure:

- Get list of departments (3-letter department codes)
- Run this: http://etcweb.princeton.edu/webfeeds/courseofferings/?term=current&subject=COS
- Parse it for courses, sections, and lecture times (as recurring events)

TODO(Dyland): write this!

"""
# from nice.models import *
# from nice import queries
from models import *
import queries

from xml.dom import minidom
from lxml import etree
import string
import sys
import urllib2
from bs4 import BeautifulSoup
import re
import json

TERM_CODE = 1144  # spring 2014
COURSE_OFFERINGS = "http://registrar.princeton.edu/course-offerings/"
FEED_PREFIX = "http://etcweb.princeton.edu/webfeeds/courseofferings/"
TERM_PREFIX = FEED_PREFIX + "?term=" + str(TERM_CODE)
DEP_PREFIX = TERM_PREFIX + "&subject="

CURRENT_SEMESTER

def get_current_semester():
    global CURRENT_SEMESTER
    if not CURRENT_SEMESTER:
        try:
            CURRENT_SEMESTER = Semester.object.get()
        parser = etree.XMLParser(ns_clean=True)
        termxml = urllib2.urlopen(TERM_PREFIX)
        tree = etree.parse(termxml, parser)
        remove_namespace(dep_courses, u'http://as.oit.princeton.edu/xml/courseofferings-1_3')
        term = tree.getroot().find('term')
        start_date = term.find('start_date')
        end_date = term.find('end_date')


# Seed page should be
# "http://registrar.princeton.edu/course-offerings/"
# Automatically gets the courses for the current term
def get_department_list(seed_page):
    soup = BeautifulSoup(seed_page)
    links = soup('a', href=re.compile(r'subject'))
    return [tag.string for tag in links]

# for each department, scrape all course listings from the webfeed
def scrape_all():
    seed_page = urllib2.urlopen(COURSE_OFFERINGS)
    departments = get_department_list(seed_page)
    for department in departments:
        scrape(department)

def scrape(department):
    parser = etree.XMLParser(ns_clean=True)
    link = DEP_PREFIX + department
    xmldoc = urllib2.urlopen(link)
    tree = etree.parse(xmldoc, parser)
    dep_courses = tree.getroot()
    """ for now hardwire the namespaces--too annoying"""
    remove_namespace(dep_courses, u'http://as.oit.princeton.edu/xml/courseofferings-1_3')
    for term in dep_courses:
        for subjects in term:
            for subject in subjects:
                for courses in subject:
                    for course in courses:
                        parse_course(course)

def parse_course(course):
    """ create a course with the basic information. """
    pass

def remove_namespace(doc, namespace):
    """Hack to remove namespace in the document in place."""
    ns = u'{%s}' % namespace
    nsl = len(ns)
    for elem in doc.getiterator():
        if elem.tag.startswith(ns):
            elem.tag = elem.tag[nsl:]

scrape_all()

###########################################################################################
# def clean(str):
#     "Return a string with leading and trailing whitespace gone and all other whitespace condensed to a single space."
#     return re.sub('\s+', ' ', str.strip())
# 
# def get_course_details(soup):
#   "Returns a dict of {courseid, area, title, descrip, prereqs}."
#   area = clean(soup('strong')[1].findAllNext(text=True)[1])  # balanced on a pinhead
#   if re.match(r'^\((LA|SA|HA|EM|EC|QR|STN|STL)\)$', area):
#     area = area[1:-1]
#   else:
#     area = ''
# 
#   match = re.match(r'\(([A-Z]+)\)', clean(soup('strong')[1].findNext(text=True)))
#   pretitle = soup.find(text="Prerequisites and Restrictions:")
#   descrdiv = soup.find('div', id='descr')
#   return {
#     'courseid': COURSE_URL_REGEX.search(soup.find('a', href=COURSE_URL_REGEX)['href']).group('id'),
#     'area': area, #bwk: this was wrong[1:-1],    # trim parens #  match.group(1) if match != None else ''
#     'title': clean(soup('h2')[1].string),
#     ###'descrip': clean(descrdiv.contents[0] if descrdiv else ''),
#     'descrip': clean(flatten(descrdiv)),
#     'prereqs': clean(pretitle.parent.findNextSibling(text=True)) if pretitle != None else ''
#   }
# 
# def flatten(dd):
#   s = ""
#   try:
#     for i in dd.contents:
#       try:
#         s += i
#       except:
#         s += flatten(i)
#   except:
#     s += "oh, dear"
#   return s
# 
# def get_course_profs(soup):
#   "Return a list of {uid, name} dicts for the professors teaching this course."
#   prof_links = soup('a', href=PROF_URL_REGEX)
#   return [{'uid': PROF_URL_REGEX.search(link['href']).group('id'), 'name': clean(link.string)} for link in prof_links]
# 
# def get_single_class(row):
#   "Helper function to turn table rows into class tuples."
#   cells = row('td')
#   time = cells[2].string.split("-")
#   bldg_link = cells[4].strong.a
# 
#   # <td><strong>Enrolled:</strong>0
#   # <strong> Limit:</strong>11</td>
#   enroll = ''
#   limit = ''
#   if cells[5] != None:    # bwk
#     enroll = cells[5].strong.nextSibling.string.strip()
#     limit = cells[5].strong.nextSibling.nextSibling.nextSibling.string.strip()
# 
#   return {
#     'classnum': cells[0].strong.string,
#     'section': cells[1].strong.string,
#     'days': re.sub(r'\s+', '', cells[3].strong.string),
#     'starttime': time[0].strip(),
#     'endtime': time[1].strip(),
#     'bldg': bldg_link.string.strip(),
#     'roomnum': bldg_link.nextSibling.string.replace('&nbsp;', ' ').strip(),
#     'enroll': enroll, # bwk
#     'limit': limit   #bwk
#   }
# 
# def get_course_classes(soup):
#   "Return a list of {classnum, days, starttime, endtime, bldg, roomnum} dicts for classes in this course."
#   class_rows = soup('tr')[1:] # the first row is actually just column headings
#   # This next bit tends to cause problems because the registrar includes precepts and canceled
#   # classes. Having text in both 1st and 4th columns (class number and day of the week)
#   # currently indicates a valid class.
#   return [get_single_class(row) for row in class_rows if row('td')[0].strong and row('td')[3].strong.string]
# 
# def scrape_page(page):
#   "Returns a dict containing as much course info as possible from the HTML contained in page."
#   soup = BeautifulSoup(page).find('div', id='contentcontainer')
#   course = get_course_details(soup)
#   course['listings'] = get_course_listings(soup)
#   course['profs'] = get_course_profs(soup)
#   course['classes'] = get_course_classes(soup)
#   return course
# 
# def scrape_id(id):
#   page = urllib2.urlopen(COURSE_URL.format(term=TERM_CODE, courseid=id))
#   return scrape_page(page)
# 
# def scrape_all():
#   """
#   Return an iterator over all courses listed on the registrar's site.
#   
#   Which courses are retrieved are governed by the globals at the top of this module,
#   most importantly LIST_URL and TERM_CODE.
# 
#   To be robust in case the registrar breaks a small subset of courses, we trap
#   all exceptions and log them to stdout so that the rest of the program can continue.
#   """
#   search_page = urllib2.urlopen(LIST_URL.format(term=TERM_CODE))
#   courseids = get_course_list(search_page)
# 
#   n = 0
#   for id in courseids:
#     try:
#       if n > 99999:
#         return
#       n += 1
#       yield scrape_id(id)
#     except Exception:
#       import traceback
#       traceback.print_exc(file=sys.stderr)
#       sys.stderr.write('Error processing course id {0}\n'.format(id))
# 
# if __name__ == "__main__":
#   first = True
#   for course in scrape_all():
#     if first:
#       first = False
#       print '['
#     else:
#       print ','
#     json.dump(course, sys.stdout)
#   print ']'
