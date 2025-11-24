"""
Comando de Django para inicializar los roles básicos en la base de datos.
Ejecutar: python manage.py init_roles
"""
from django.core.management.base import BaseCommand
from usuarios.models import Rol


class Command(BaseCommand):
    help = 'Inicializa los roles básicos en la base de datos'

    def handle(self, *args, **options):
        roles_data = [
            {
                'id_rol': 1,
                'nombre_rol': 'admin',
                'descripcion': 'Administrador del sistema'
            },
            {
                'id_rol': 2,
                'nombre_rol': 'propietario',
                'descripcion': 'Propietario de negocio'
            },
            {
                'id_rol': 3,
                'nombre_rol': 'cliente',
                'descripcion': 'Cliente final'
            },
        ]

        created_count = 0
        updated_count = 0

        for role_data in roles_data:
            rol, created = Rol.objects.update_or_create(
                id_rol=role_data['id_rol'],
                defaults={
                    'nombre_rol': role_data['nombre_rol'],
                    'descripcion': role_data['descripcion']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Rol creado: {rol.nombre_rol} (ID: {rol.id_rol})')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'→ Rol actualizado: {rol.nombre_rol} (ID: {rol.id_rol})')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Proceso completado: {created_count} roles creados, {updated_count} roles actualizados'
            )
        )

