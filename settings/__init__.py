import os

# Determine which settings to use based on environment
if os.environ.get('DJANGO_SETTINGS_MODULE') is None:
    if os.environ.get('TESTING'):
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bmad_lms.settings.testing')
    elif os.environ.get('DEBUG', 'False').lower() == 'true':
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bmad_lms.settings.development')
    else:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bmad_lms.settings.production')

