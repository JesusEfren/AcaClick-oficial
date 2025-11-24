"""
Comando de Django para crear un usuario de prueba.
Ejecutar: python manage.py create_test_user
"""
from django.core.management.base import BaseCommand
from usuarios.models import Usuario, Rol


class Command(BaseCommand):
    help = 'Crea un usuario de prueba para iniciar sesión'

    def handle(self, *args, **options):
        # Obtener o crear el rol de propietario (id=2)
        rol, created = Rol.objects.get_or_create(
            id_rol=2,
            defaults={
                'nombre_rol': 'propietario',
                'descripcion': 'Propietario de negocio'
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'✓ Rol creado: {rol.nombre_rol} (ID: {rol.id_rol})')
            )
        
        # Crear usuario de prueba
        username = 'testuser'
        correo = 'test@example.com'
        password = 'test123456'
        
        # Verificar si el usuario ya existe
        if Usuario.objects.filter(correo=correo).exists():
            self.stdout.write(
                self.style.WARNING(f'⚠ El usuario con correo {correo} ya existe.')
            )
            user = Usuario.objects.get(correo=correo)
            user.set_password(password)
            user.is_active = True
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'✓ Contraseña actualizada para el usuario existente')
            )
        else:
            user = Usuario.objects.create(
                username=username,
                correo=correo,
                nombre='Usuario',
                apellido_paterno='Prueba',
                apellido_materno='Test',
                rol=rol,
                is_active=True
            )
            user.set_password(password)
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'✓ Usuario creado exitosamente')
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Usuario de prueba creado:\n'
                f'   Correo: {correo}\n'
                f'   Contraseña: {password}\n'
                f'   Username: {username}\n'
                f'   Rol: {user.rol.nombre_rol}\n'
                f'   Activo: {user.is_active}'
            )
        )

