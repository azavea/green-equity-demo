import json
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.gis.geos import Point

from .serializers import ExampleSerializer


@api_view(["GET"])
def example(request):
    serializer = ExampleSerializer(
        {"is_example": True, "geom": Point(-75.15432569843308, 39.96146467738911)}
    )

    return Response(serializer.data)


@api_view(["GET"])
def version(request):
    version_file = "/usr/local/src/version.json"
    try:
        f = open(version_file)
        data = json.load(f)
        f.close()
        res_status = status.HTTP_200_OK
    except OSError:
        data = {"error": version_file + " not found"}
        res_status = status.HTTP_404_NOT_FOUND
    return Response(data, status=res_status)
