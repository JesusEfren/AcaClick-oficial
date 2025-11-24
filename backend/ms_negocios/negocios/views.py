from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Negocio
from .serializers import NegocioSerializer, NegocioCreateSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def listar_negocios(request):
    """Listar todos los negocios"""
    negocios = Negocio.objects.filter(activo=True)
    serializer = NegocioSerializer(negocios, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def obtener_negocio(request, id_negocio):
    """Obtener un negocio por ID"""
    try:
        negocio = Negocio.objects.get(id_negocio=id_negocio, activo=True)
        serializer = NegocioSerializer(negocio)
        return Response(serializer.data)
    except Negocio.DoesNotExist:
        return Response(
            {'error': 'Negocio no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def crear_negocio(request):
    """Crear un nuevo negocio"""
    try:
        serializer = NegocioCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            negocio = serializer.save()
            response_serializer = NegocioSerializer(negocio)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import traceback
        error_detail = str(e)
        traceback.print_exc()
        return Response(
            {'error': 'Error al crear el negocio', 'detail': error_detail},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def actualizar_negocio(request, id_negocio):
    """Actualizar un negocio"""
    try:
        negocio = Negocio.objects.get(id_negocio=id_negocio)
    except Negocio.DoesNotExist:
        return Response(
            {'error': 'Negocio no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = NegocioSerializer(negocio, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def eliminar_negocio(request, id_negocio):
    """Eliminar (desactivar) un negocio"""
    try:
        negocio = Negocio.objects.get(id_negocio=id_negocio)
        negocio.activo = False
        negocio.save()
        return Response({'message': 'Negocio eliminado correctamente'}, status=status.HTTP_200_OK)
    except Negocio.DoesNotExist:
        return Response(
            {'error': 'Negocio no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def negocios_por_usuario(request, id_usuario):
    """Listar negocios de un usuario específico"""
    negocios = Negocio.objects.filter(id_usuario=id_usuario, activo=True)
    serializer = NegocioSerializer(negocios, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def personalizar_tienda(request, id_negocio):
    """Guardar personalización de la tienda"""
    try:
        negocio = Negocio.objects.get(id_negocio=id_negocio)
    except Negocio.DoesNotExist:
        return Response(
            {'error': 'Negocio no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Actualizar el campo de personalización
    personalizacion_data = request.data
    negocio.personalizacion = personalizacion_data
    negocio.save()
    
    serializer = NegocioSerializer(negocio)
    return Response({
        'message': 'Personalización guardada exitosamente',
        'negocio': serializer.data
    }, status=status.HTTP_200_OK)
