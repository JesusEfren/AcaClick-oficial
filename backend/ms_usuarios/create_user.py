#!/usr/bin/env python
"""
Script para crear un usuario de prueba.
Ejecutar: python create_user.py
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ms_usuarios.settings')
django.setup()

from usuarios.models import Usuario, Rol

def main():
    # Obtener o crear el rol de propietario (id=2)
    rol, created = Rol.objects.get_or_create(
        id_rol=2,
        defaults={
            'nombre_rol': 'propietario',
            'descripcion': 'Propietario de negocio'
        }
    )
    
    if created:
        print(f'✓ Rol creado: {rol.nombre_rol} (ID: {rol.id_rol})')
    
    # Crear usuario de prueba
    username = 'testuser'
    correo = 'test@example.com'
    password = 'test123456'
    
    # Verificar si el usuario ya existe
    if Usuario.objects.filter(correo=correo).exists():
        print(f'⚠ El usuario con correo {correo} ya existe.')
        user = Usuario.objects.get(correo=correo)
        user.set_password(password)
        user.is_active = True
        user.save()
        print(f'✓ Contraseña actualizada para el usuario existente')
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
        print(f'✓ Usuario creado exitosamente')
    
    print(f'\n✅ Usuario de prueba creado:')
    print(f'   Correo: {correo}')
    print(f'   Contraseña: {password}')
    print(f'   Username: {username}')
    print(f'   Rol: {user.rol.nombre_rol}')
    print(f'   Activo: {user.is_active}')

if __name__ == '__main__':
    main()

