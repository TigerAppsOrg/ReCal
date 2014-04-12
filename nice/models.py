from django.db import models
from django.db.models.signals import post_save

# Create your models here.
# To start using the database: python manage.py syncdb
# Run python manage.py sql nice to see SQL for our models.
# To apply a model: python manage.py syncdb again. (This changes in later versions of Django, beware!)

# Relationships note: 
# use foreign key for many to one rel
# use OneToOneField for one to one rel

# TODO not implemented: best revisions
# TODO add code for naming semesters

class Semester(models.Model):
    # fields
    start_date = models.DateField() #TODO should this be datetime instead of date?
    end_date = models.DateField()

class Course(models.Model):
    # relationships
    semester = models.ForeignKey(Semester)

    # fields
    dept = models.CharField(max_length=3)
    number = models.CharField(max_length=3)
    name = models.CharField(max_length=100)
    description = models.TextField()
    professor = models.CharField(max_length=100)

    def __unicode__(self):
        return self.dept + ' ' + self.number + ': ' + self.name
    
class Section(models.Model):
    # relationships
    course = models.ForeignKey(Course)

    # fields
    name = models.CharField(max_length=100, default='all_students')
    isDefault = models.BooleanField(default=False) # if true, then everyone in the course is automatically enrolled in this section

    def __unicode__(self):
        return self.course.dept + ' ' + self.course.number + ' - ' + self.name
        
        
# create "All Students" section as soon as a course is created
def make_default_table(sender, instance, created, **kwargs):  
    # see http://stackoverflow.com/a/965883/130164
    if created:  
       profile, created = Section.objects.get_or_create(course=instance, name='All Students', isDefault=True)  
post_save.connect(make_default_table, sender=Course)

class User_Section_Table(models.Model):
    # relationships
    user = models.ForeignKey('User_Profile')
    section = models.ForeignKey(Section)

    # fields
    add_date = models.DateTimeField()
    def __unicode__(self):
        return self.user.__unicode__() + ' enrolled in ' + unicode(self.section)

class Event_Group(models.Model):
    # relationships
    section = models.ForeignKey(Section)
    def __unicode__(self):
        if self.best_revision():
            return 'Event group: ' +  self.best_revision().__unicode__() + ' in ' + self.section.__unicode__()
        return 'Event group %d: no approved revision' % (self.id) +  ' in ' + unicode(self.section)

    def best_revision(self):
        if self.event_group_revision_set.all():
            return self.event_group_revision_set.filter(approved=True).latest('modified_time')
        return None;
    
class Event_Group_Revision(models.Model):
    # relationships
    event_group = models.ForeignKey(Event_Group)

    # main fields
    start_date = models.DateField()
    end_date = models.DateField()
    modified_user = models.ForeignKey('User_Profile')
    modified_time = models.DateTimeField()
    approved = models.BooleanField(default=True) # TODO: change default value	
    
    # recurrence fields
    '''
    * How recurrence fields work, for our prototype:
    * Days of the week are 0-6, with 0 = sunday and 6 = saturday
    * Field recurrenceDays is a list of integers: the digits of the days when the event reoccurs. This list is JSON serialized to be stored in the database.
    * Field reccurenceInterval = 1 or 2, i.e. repeat every week or repeat every other week
    '''
    recurrence_days = models.CharField(max_length=300, default=None, blank=True, null=True) # default value is None; blank=True means that you can pass in None; null=True tells Postgres to accept null values.
    recurrence_interval = models.IntegerField(default=None, blank=True, null=True)

    def __unicode__(self):
        return unicode(self.start_date)

class Event(models.Model):
    # relationships
    group = models.ForeignKey(Event_Group)

    def __unicode__(self):
        if self.best_revision():
            return 'event %d: %s' % (self.id, unicode(self.best_revision()))
        return 'event %d: no approved revisions' % (self.id)
    def best_revision(self, netid=None):
        """
        Returns the best event revision to show to a user.
        
        Returns: the latest approved revision or the user's own version -- whichever is newer.
        
        That is, if there's a new approved revision after a user's own version, they see the new approved one.
        Or if they've changed the event since the last approved revision, even if their revision hasn't been approved yet for global viewing,
        they still see their revision.
        
        Arguments: username (optional). If not specified, returns globally-seen last approved revision.
        """
        if self.event_revision_set.all():
            latest_approved = self.event_revision_set.filter(approved=True).latest('modified_time')
            if netid:
                latest_mine = self.event_revision_set.filter(modified_user__user__username=netid).latest('modified_time')
                if latest_mine.modified_time > latest_approved.modified_time: 
                    return latest_mine # their own revision is newest, so show that
            return latest_approved # show the latest approved revision because the user's revisions don't exist or are older
        return None # no revisions available

class Event_Revision(models.Model):
    # constants
		
    TYPE_ASSIGNMENT = "AS"
    TYPE_EXAM = "EX"
    TYPE_LAB = "LA"
    TYPE_LECTURE = "LE"
    TYPE_OFFICE_HOURS = "OH"
    TYPE_PRECEPT = "PR"
    TYPE_REVIEW_SESSION = "RS"
    TYPE_CHOICES = (
        (TYPE_ASSIGNMENT, "assignment"),
        (TYPE_EXAM, "exam"),
        (TYPE_LAB, "lab"),
        (TYPE_LECTURE, "lecture"),
        (TYPE_OFFICE_HOURS, "office hours"),
        (TYPE_PRECEPT, "precept"),
        (TYPE_REVIEW_SESSION, "review session")
    )

    # relationships
    event = models.ForeignKey(Event)

    # fields
    event_title = models.CharField(max_length=100)
    event_type = models.CharField(max_length=2, choices=TYPE_CHOICES)
    event_start = models.DateTimeField()
    event_end = models.DateTimeField()
    event_description = models.TextField()
    event_location = models.CharField(max_length=100)
    modified_user = models.ForeignKey('User_Profile')
    modified_time = models.DateTimeField()
    approved = models.BooleanField(default=True) # TODO: change default value	
    
    def __unicode__(self):
        return self.event_title

# Extend django.contrib.auth User table with custom user profile information.

from django.contrib.auth.models import User

class User_Profile(models.Model):
    user = models.OneToOneField(User, related_name='profile', unique=False)
    
    name = models.CharField(max_length=100, null=True, blank=True)
    lastActivityTime = models.DateTimeField() 	# last seen time
    sections = models.ManyToManyField(Section, through='User_Section_Table', blank=True,null=True)
    ui_state_restoration = models.TextField(blank=True,null=True)
    hidden_events = models.TextField(blank=True,null=True)

    def __unicode__(self):
        """
        Returns "[first_name] [last_name]" if both fields available, or "[first_name]" if only first name is given, or netid if neither names are filled in.
        
        Arguments: User object
        """
        
        netid, first, last = self.user.username, self.user.first_name, self.user.last_name
        # No need to escape in this method; templates will automatically escape strings we pass in.
        if first and last:
            return '%s %s' % (first, last)
        elif first:
            return first
        else:
            return netid
		
# create user profile as soon as a user is added
def make_blank_profile(sender, instance, created, **kwargs):  
    # see http://stackoverflow.com/a/965883/130164
    # Use a try because the first user (super user) is created before other tables are created.
    # That is, this fails during syncdb upon initial database setup, because it creates a superuser before User_Profile table is added (we add that by running migrations after).
    try:
        if created:  
            profile, created = User_Profile.objects.get_or_create(user=instance,lastActivityTime=get_current_utc()) 
    except Exception, e:
        pass
     
post_save.connect(make_blank_profile, sender=User)

### HELPER METHODS        
import datetime

def get_current_utc():
    '''
    Returns current time in UTC, perfect for database storage.
    '''
    from django.utils.timezone import utc
    return datetime.datetime.utcnow().replace(tzinfo=utc)
    
    
def seed_db_with_data():
    '''
    Inserts some test data: a semester, a course, and an extra section.
    '''
    sem = Semester(start_date=datetime.datetime(2014,1,5), end_date=datetime.datetime(2014,6,1))
    sem.save()
    c1 = Course(semester=sem, dept='COS', number='333', name='Advanced Programming Techniques', description='A compsci class', professor='Brian Kernighan')
    c1.save()
    # Note that once we create a Course, the All Students section is created automatically and marked Default (i.e. all students in the course are automatically enrolled in this section). 
    extra_section = Section(course=c1, name='Precept A')
    extra_section.save()
    
def clear_all_data():
    # TODO: add other tables
    Section.objects.all().delete()
    Course.objects.all().delete()
    Semester.objects.all().delete()
    
    
    
