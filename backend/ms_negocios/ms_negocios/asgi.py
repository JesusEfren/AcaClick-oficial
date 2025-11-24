"""
ASGI config for ms_negocios project.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ms_negocios.settings')

application = get_asgi_application()

