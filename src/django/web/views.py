import os

from django.conf import settings
from django.shortcuts import render


def environment(request):
    """
    A JavaScript snippet that initializes the environment
    """
    # Capture all REACT_APP_ variables into a dictionary for context
    environment = {k: v for k, v in os.environ.items() if k.startswith("REACT_APP_")}

    # Add Environment variable, lowered for easier comparison
    # One of `development`, `testing`, `staging`, `production`
    environment["ENVIRONMENT"] = settings.ENVIRONMENT.lower()

    context = {"environment": environment}

    return render(
        request,
        "web/environment.js",
        context,
        content_type="application/javascript; charset=utf-8",
    )
