# Generated manually
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('negocios', '0002_alter_negocio_logo_url_alter_negocio_sitio_web'),
    ]

    operations = [
        migrations.AddField(
            model_name='negocio',
            name='personalizacion',
            field=models.JSONField(blank=True, default=dict, null=True),
        ),
    ]

