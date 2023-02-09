from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers

# The below working code is an example that returns a geospatial point and
# serves to show that the template is working. However in a project, we
# typically use the following class base.

# class ExampleSerializer(gis_serializers.GeoFeatureModelSerializer):

# The GeoFeatureModelSeralizer returns actual GeoJSON and requires a model to
# work. Read more here:
# https://github.com/openwisp/django-rest-framework-gis#geofeaturemodelserializer


class ExampleSerializer(serializers.Serializer):
    """Example Serializer that returns GeoJSON to the view calling it"""

    is_example = serializers.BooleanField()
    geom = gis_serializers.GeometryField()
