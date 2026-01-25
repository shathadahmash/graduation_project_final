# Generated manually - Add department field to Project model

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0019_notificationlog_related_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='department',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='projects', to='core.department'),
        ),
    ]
