from django.db import migrations


SCRIPTURES = [
    ("Psalm 46:10", "Be still, and know that I am God."),
    ("Psalm 119:105", "Thy word is a lamp unto my feet, and a light unto my path."),
    ("Proverbs 3:5", "Trust in the Lord with all thine heart; and lean not unto thine own understanding."),
    ("Isaiah 40:31", "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles."),
    ("Matthew 5:14", "Ye are the light of the world. A city that is set on an hill cannot be hid."),
    ("Matthew 11:28", "Come unto me, all ye that labour and are heavy laden, and I will give you rest."),
    ("John 8:12", "I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life."),
    ("John 14:27", "Peace I leave with you, my peace I give unto you: let not your heart be troubled, neither let it be afraid."),
    ("Romans 8:28", "And we know that all things work together for good to them that love God."),
    ("2 Corinthians 5:7", "For we walk by faith, not by sight."),
    ("Philippians 4:13", "I can do all things through Christ which strengtheneth me."),
    ("1 Peter 5:7", "Casting all your care upon him; for he careth for you."),
]


def add_scriptures(apps, schema_editor):
    Scripture = apps.get_model("api", "Scripture")
    Scripture.objects.bulk_create([
        Scripture(reference=reference, text=text, translation="KJV")
        for reference, text in SCRIPTURES
    ], ignore_conflicts=True)


def remove_scriptures(apps, schema_editor):
    Scripture = apps.get_model("api", "Scripture")
    Scripture.objects.filter(reference__in=[reference for reference, _ in SCRIPTURES], translation="KJV").delete()


class Migration(migrations.Migration):
    dependencies = [("api", "0003_scripture")]
    operations = [migrations.RunPython(add_scriptures, remove_scriptures)]

