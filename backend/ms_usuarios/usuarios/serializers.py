from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from .models import Usuario, Rol


class CustomRefreshToken(RefreshToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        # Asegurar que use id_usuario en lugar del id por defecto
        token['user_id'] = user.id_usuario
        return token
    
    @property
    def access_token(self):
        access = super().access_token
        # Asegurar que el access token también use id_usuario
        access['user_id'] = self['user_id']
        return access


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ["id_rol", "nombre_rol", "descripcion"]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer personalizado para usar 'correo' en lugar de 'username'"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].required = False
        self.fields['correo'] = serializers.EmailField(required=True)
    
    def validate(self, attrs):
        # Usar 'correo' en lugar de 'username'
        correo = attrs.get('correo')
        password = attrs.get('password')
        
        if not correo or not password:
            raise serializers.ValidationError('Debe proporcionar correo y contraseña.')
        
        # Buscar usuario por correo
        try:
            user = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError('No existe un usuario con este correo.')
        
        # Validar contraseña
        if not user.check_password(password):
            raise serializers.ValidationError('Contraseña incorrecta.')
        
        if not user.is_active:
            raise serializers.ValidationError('Usuario inactivo.')
        
        # Generar los tokens usando CustomRefreshToken que usa id_usuario
        refresh = CustomRefreshToken.for_user(user)
        access = refresh.access_token
        
        data = {
            'refresh': str(refresh),
            'access': str(access),
        }
        
        return data


class UsuarioReadSerializer(serializers.ModelSerializer):
    rol = RolSerializer()

    class Meta:
        model = Usuario
        fields = [
            "id_usuario",
            "correo",
            "username",
            "nombre",
            "apellido_paterno",
            "apellido_materno",
            "fecha_nacimiento",
            "rol",
            "tenant_id",
        ]


class UsuarioRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, min_length=6, required=False)
    id_rol = serializers.PrimaryKeyRelatedField(
        source="rol",
        queryset=Rol.objects.all(),
        write_only=True,
        required=True,
        error_messages={
            'required': 'El rol es obligatorio.',
            'does_not_exist': 'El rol especificado no existe.',
            'incorrect_type': 'El rol debe ser un número válido.'
        }
    )

    class Meta:
        model = Usuario
        fields = [
            "username",
            "correo",
            "nombre",
            "apellido_paterno",
            "apellido_materno",
            "fecha_nacimiento",
            "password",
            "password2",
            "id_rol",
        ]
        extra_kwargs = {
            'username': {'required': True},
            'correo': {'required': True},
            'nombre': {'required': True},
            'apellido_paterno': {'required': True},
        }

    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')
        
        # Validar que las contraseñas coincidan si se proporciona password2
        if password2 and password != password2:
            raise serializers.ValidationError({
                'password': 'Las contraseñas no coinciden.',
                'password2': 'Las contraseñas no coinciden.'
            })
        
        # Validar que el rol exista
        rol = attrs.get('rol')
        if not rol:
            raise serializers.ValidationError({
                'id_rol': 'El rol es obligatorio.'
            })
        
        # Validar que el correo no esté duplicado
        correo = attrs.get('correo')
        if correo and Usuario.objects.filter(correo=correo).exists():
            raise serializers.ValidationError({
                'correo': 'Ya existe un usuario con este correo electrónico.'
            })
        
        # Validar que el username no esté duplicado
        username = attrs.get('username')
        if username and Usuario.objects.filter(username=username).exists():
            raise serializers.ValidationError({
                'username': 'Ya existe un usuario con este nombre de usuario.'
            })
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2', None)  # Remover password2 si existe
        password = validated_data.pop("password")
        
        try:
            user = Usuario(**validated_data)
            user.set_password(password)
            user.is_active = True  # Asegurar que el usuario esté activo
            user.save()
            return user
        except Exception as e:
            raise serializers.ValidationError({
                'error': f'Error al crear el usuario: {str(e)}'
            })
