from pathlib import Path
from PIL import Image, ImageOps
import shutil,json
root=Path(__file__).resolve().parent.parent
out=root/'output'; assets=out/'assets'; assets.mkdir(parents=True,exist_ok=True)
skill=Path(r'C:\Users\Chee\.codex\skills\gdg-slide-design')
progress=skill/'assets'/'progress';progress.mkdir(parents=True,exist_ok=True)
sprite=Image.open(root/'build'/'source-art'/'chromium-dino-sprite-2x.png').convert('RGBA')
for name,box in [('dinosaur.png',(1678,2,1766,96)),('cactus.png',(446,2,480,72))]:
    sprite.crop(box).save(progress/name);shutil.copy2(progress/name,assets/name)
shutil.copy2(root.parent/'agentic-hardware'/'assets'/'gdg-mark-reference.png',assets/'gdg-mark.png')
mapping={}
for i,path in enumerate(sorted((root/'hack').iterdir())):
    im=ImageOps.exif_transpose(Image.open(path));im.thumbnail((1800,1800))
    stem=f'photo-{i+1:02d}'; dest=assets/(stem+('.png' if path.suffix.lower()=='.png' else '.jpg'))
    if dest.suffix=='.jpg':im.convert('RGB').save(dest,quality=94)
    else:im.save(dest)
    mapping[path.name]={'path':f'assets/{dest.name}','width':im.width,'height':im.height}
(root/'build'/'photos.json').write_text(json.dumps(mapping,indent=2),encoding='utf8')
print(json.dumps(mapping,indent=2))
