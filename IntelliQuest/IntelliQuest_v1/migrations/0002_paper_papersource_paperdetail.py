# Generated by Django 4.2.7 on 2024-04-06 22:37

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('IntelliQuest_v1', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='paper',
            name='papersource',
            field=models.BigIntegerField(null=True),
        ),
        migrations.CreateModel(
            name='PaperDetail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('citationcount', models.IntegerField()),
                ('pubvenue', models.CharField(max_length=256)),
                ('downloadlink', models.URLField()),
                ('paper', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='detail', to='IntelliQuest_v1.paper')),
            ],
        ),
    ]
