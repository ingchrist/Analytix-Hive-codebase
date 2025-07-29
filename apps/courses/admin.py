from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Course, Section, Lesson, Enrollment, LessonProgress, Review


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'courses_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    
    def courses_count(self, obj):
        return obj.courses.count()
    courses_count.short_description = 'Courses'


class SectionInline(admin.TabularInline):
    model = Section
    extra = 0
    fields = ['title', 'order', 'is_published']


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ['title', 'lesson_type', 'order', 'duration_minutes', 'is_published']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'instructor', 'category', 'status', 'difficulty', 'current_price', 'total_enrollments', 'created_at']
    list_filter = ['status', 'difficulty', 'category', 'is_free', 'created_at']
    search_fields = ['title', 'description', 'instructor__username']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [SectionInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'short_description', 'instructor', 'category')
        }),
        ('Media', {
            'fields': ('thumbnail', 'preview_video')
        }),
        ('Course Details', {
            'fields': ('difficulty', 'duration_hours', 'status', 'requirements', 'what_you_learn')
        }),
        ('Pricing', {
            'fields': ('is_free', 'price', 'discount_price', 'max_students')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
    )
    
    def current_price(self, obj):
        price = obj.current_price
        if price == 0:
            return format_html('<span style="color: green;">Free</span>')
        return f"₦{price:,.2f}"
    current_price.short_description = 'Price'


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'lessons_count', 'is_published']
    list_filter = ['is_published', 'course']
    search_fields = ['title', 'course__title']
    inlines = [LessonInline]
    
    def lessons_count(self, obj):
        return obj.lessons.count()
    lessons_count.short_description = 'Lessons'


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'section', 'lesson_type', 'order', 'duration_minutes', 'is_preview', 'is_published']
    list_filter = ['lesson_type', 'is_preview', 'is_published', 'section__course']
    search_fields = ['title', 'section__title', 'section__course__title']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'status', 'progress_percentage', 'created_at', 'completed_at']
    list_filter = ['status', 'created_at', 'course']
    search_fields = ['student__username', 'student__email', 'course__title']
    readonly_fields = ['progress_percentage']


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'lesson', 'is_completed', 'completion_percentage', 'time_spent_minutes']
    list_filter = ['is_completed', 'lesson__lesson_type']
    search_fields = ['enrollment__student__username', 'lesson__title']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'rating', 'title', 'is_published', 'created_at']
    list_filter = ['rating', 'is_published', 'created_at']
    search_fields = ['student__username', 'course__title', 'title', 'comment']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'course')

