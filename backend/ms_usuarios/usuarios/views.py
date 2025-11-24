from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

# Usuario hardcodeado para desarrollo local
HARDCODED_USER = {
    'correo': 'admin@acaclick.com',
    'password': 'admin123',
    'id_usuario': 1,
    'username': 'admin',
    'nombre': 'Administrador',
    'apellido_paterno': 'AcaClick',
    'apellido_materno': '',
    'rol': {
        'id_rol': 1,
        'nombre_rol': 'admin',
        'descripcion': 'Administrador del sistema'
    }
}


class CustomTokenObtainPairView(APIView):
    """Vista simplificada para login con usuario hardcodeado"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        correo = request.data.get('correo')
        password = request.data.get('password')
        
        # Validar credenciales contra usuario hardcodeado
        if correo == HARDCODED_USER['correo'] and password == HARDCODED_USER['password']:
            # Generar tokens JWT
            # Crear un token refresh simple
            refresh = RefreshToken()
            refresh['user_id'] = HARDCODED_USER['id_usuario']
            
            access = refresh.access_token
            access['user_id'] = HARDCODED_USER['id_usuario']
            
            return Response({
                'access': str(access),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Credenciales incorrectas'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = UsuarioRegisterSerializer(data=request.data)
            if not serializer.is_valid():
                logger.warning(f"Error de validación en registro: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                user = serializer.save()
                read_serializer = UsuarioReadSerializer(user)
                return Response(read_serializer.data, status=status.HTTP_201_CREATED)
        
        except IntegrityError as e:
            logger.error(f"Error de integridad al registrar usuario: {str(e)}")
            error_message = "Ya existe un usuario con este correo o username."
            if "correo" in str(e).lower():
                error_message = "Ya existe un usuario con este correo electrónico."
            elif "username" in str(e).lower():
                error_message = "Ya existe un usuario con este nombre de usuario."
            return Response(
                {"error": error_message, "detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except Exception as e:
            logger.error(f"Error inesperado al registrar usuario: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al registrar el usuario. Por favor, intente nuevamente."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MeView(APIView):
    def get(self, request):
        # Retornar datos del usuario hardcodeado
        return Response({
            'id_usuario': HARDCODED_USER['id_usuario'],
            'correo': HARDCODED_USER['correo'],
            'username': HARDCODED_USER['username'],
            'nombre': HARDCODED_USER['nombre'],
            'apellido_paterno': HARDCODED_USER['apellido_paterno'],
            'apellido_materno': HARDCODED_USER['apellido_materno'],
            'rol': HARDCODED_USER['rol'],
        })
