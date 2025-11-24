from django.db import models
import uuid


class Negocio(models.Model):
    TIPO_CHOICES = [
        ('restaurante', 'Restaurante'),
        ('minorista', 'Minorista'),
        ('servicio', 'Servicio'),
        ('hosteleria', 'Hostelería'),
        ('creativo', 'Creativo'),
        ('otro', 'Otro'),
    ]

    id_negocio = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=200)
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    descripcion = models.TextField(blank=True, null=True)
    
    # Información de contacto
    correo = models.EmailField()
    telefono = models.CharField(max_length=20)
    direccion = models.TextField()
    latitud = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitud = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    
    # Horario
    horario_apertura = models.TimeField(blank=True, null=True)
    horario_cierre = models.TimeField(blank=True, null=True)
    
    # Web y redes sociales
    sitio_web = models.CharField(max_length=500, blank=True, null=True)
    facebook = models.CharField(max_length=200, blank=True, null=True)
    instagram = models.CharField(max_length=200, blank=True, null=True)
    twitter = models.CharField(max_length=200, blank=True, null=True)
    
    # Logo (por ahora como URL o base64, luego se puede cambiar a ImageField)
    logo_url = models.TextField(blank=True, null=True)
    
    # Personalización de la tienda (JSON)
    personalizacion = models.JSONField(blank=True, null=True, default=dict)
    
    # Metadata
    id_usuario = models.BigIntegerField()  # ID del usuario propietario (referencia a ms_usuarios)
    tenant_id = models.UUIDField(default=uuid.uuid4, editable=False)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'negocios'
        ordering = ['-creado_en']

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"

