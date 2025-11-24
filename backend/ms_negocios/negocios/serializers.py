from rest_framework import serializers
from .models import Negocio


class NegocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Negocio
        fields = [
            'id_negocio',
            'nombre',
            'tipo',
            'descripcion',
            'correo',
            'telefono',
            'direccion',
            'latitud',
            'longitud',
            'horario_apertura',
            'horario_cierre',
            'sitio_web',
            'facebook',
            'instagram',
            'twitter',
            'logo_url',
            'personalizacion',
            'id_usuario',
            'tenant_id',
            'activo',
            'creado_en',
            'actualizado_en',
        ]
        read_only_fields = ['id_negocio', 'tenant_id', 'creado_en', 'actualizado_en']

    def create(self, validated_data):
        # Si no se proporciona id_usuario, usar 1 por defecto (usuario hardcodeado)
        if 'id_usuario' not in validated_data:
            validated_data['id_usuario'] = 1
        return super().create(validated_data)


class NegocioCreateSerializer(serializers.Serializer):
    """Serializer para crear negocio desde el frontend"""
    businessName = serializers.CharField(required=True)
    businessType = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(required=True)
    address = serializers.CharField(required=True)
    openTime = serializers.TimeField(required=False, allow_null=True)
    closeTime = serializers.TimeField(required=False, allow_null=True)
    website = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    facebook = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    instagram = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    twitter = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    description = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    location = serializers.DictField(required=False, allow_null=True)  # {lat, lng}
    logo = serializers.CharField(required=False, allow_null=True, allow_blank=True)  # Base64 o URL

    def create(self, validated_data):
        # Extraer location si existe
        location = validated_data.pop('location', None)
        latitud = None
        longitud = None
        if location and isinstance(location, dict):
            latitud = location.get('lat')
            longitud = location.get('lng')
            # Convertir a Decimal si son números
            if latitud is not None:
                from decimal import Decimal
                try:
                    latitud = Decimal(str(latitud))
                except:
                    latitud = None
            if longitud is not None:
                from decimal import Decimal
                try:
                    longitud = Decimal(str(longitud))
                except:
                    longitud = None
        
        # Extraer logo si existe
        logo_url = validated_data.pop('logo', None)
        if logo_url and logo_url.strip() == '':
            logo_url = None
        
        # Validar campos opcionales
        sitio_web = validated_data.get('website')
        if sitio_web:
            sitio_web = sitio_web.strip()
            if sitio_web == '':
                sitio_web = None
            # Si no empieza con http, agregarlo
            elif sitio_web and not sitio_web.startswith(('http://', 'https://')):
                sitio_web = 'https://' + sitio_web
        else:
            sitio_web = None
        
        # Crear el negocio
        negocio = Negocio.objects.create(
            nombre=validated_data['businessName'],
            tipo=validated_data['businessType'],
            correo=validated_data['email'],
            telefono=validated_data['phone'],
            direccion=validated_data['address'],
            horario_apertura=validated_data.get('openTime'),
            horario_cierre=validated_data.get('closeTime'),
            sitio_web=sitio_web,
            facebook=validated_data.get('facebook') or None,
            instagram=validated_data.get('instagram') or None,
            twitter=validated_data.get('twitter') or None,
            descripcion=validated_data.get('description') or None,
            latitud=latitud,
            longitud=longitud,
            logo_url=logo_url,
            id_usuario=1,  # Usuario hardcodeado
        )
        
        return negocio

