from django.contrib import admin
from .models import Negocio


@admin.register(Negocio)
class NegocioAdmin(admin.ModelAdmin):
    list_display = ['id_negocio', 'nombre', 'tipo', 'correo', 'activo', 'creado_en']
    list_filter = ['tipo', 'activo', 'creado_en']
    search_fields = ['nombre', 'correo', 'direccion']
    readonly_fields = ['id_negocio', 'tenant_id', 'creado_en', 'actualizado_en']

