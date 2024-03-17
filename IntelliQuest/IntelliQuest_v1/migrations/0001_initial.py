# Generated by Django 4.2.7 on 2024-03-17 16:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Author',
            fields=[
                ('authorID', models.CharField(max_length=50, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=150)),
                ('email', models.EmailField(max_length=254, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Paper',
            fields=[
                ('paperID', models.CharField(max_length=50, primary_key=True, serialize=False)),
                ('year', models.IntegerField(null=True)),
                ('title', models.CharField(max_length=512)),
                ('abstract', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='PaperAuthors',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='IntelliQuest_v1.author')),
                ('paper', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='IntelliQuest_v1.paper')),
            ],
        ),
        migrations.AddField(
            model_name='paper',
            name='authors',
            field=models.ManyToManyField(related_name='papers', through='IntelliQuest_v1.PaperAuthors', to='IntelliQuest_v1.author'),
        ),
    ]
