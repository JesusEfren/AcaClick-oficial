from django.urls import path
from . import views

urlpatterns = [
    path("", views.listar_negocios, name="listar_negocios"),
    path("crear/", views.crear_negocio, name="crear_negocio"),
    path("<int:id_negocio>/", views.obtener_negocio, name="obtener_negocio"),
    path("<int:id_negocio>/actualizar/", views.actualizar_negocio, name="actualizar_negocio"),
    path("<int:id_negocio>/eliminar/", views.eliminar_negocio, name="eliminar_negocio"),
    path("<int:id_negocio>/personalizar/", views.personalizar_tienda, name="personalizar_tienda"),
    path("usuario/<int:id_usuario>/", views.negocios_por_usuario, name="negocios_por_usuario"),
]

