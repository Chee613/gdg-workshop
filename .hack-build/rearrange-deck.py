"""Short, photo-led workshop slides; the HTML builder consumes this spec."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'gdg hackathon sharing/output'
BLUE, RED, YELLOW, GREEN, INK, GRAY = '#4285F4', '#EA4335', '#FBBC04', '#34A853', '#111315', '#5F6368'
photos = json.loads((ROOT / '.hack-build/photos.json').read_text())

def text(value, x, y, w, h, size=28, color=INK, bold=False):
    return dict(kind='text', text=value, x=x, y=y, w=w, h=h, size=size, color=color, bold=bold)

def image(file, x, y, w, h, alt, source=None, **extra):
    return dict(kind='image', file='assets/'+file, x=x, y=y, w=w, h=h, alt=alt, **({'source': source} if source else {}), **extra)

def photo(source, x, y, w, h, alt):
    return image(Path(photos[source]['path']).name, x, y, w, h, alt, source)

def sticker(name, x, y, w=120, h=120):
    return image('sticker-'+name+'.png', x, y, w, h, 'Soft 3D '+name+' sticker', sticker=True)

SLIDO = 'https://app.sli.do/event/n7DeCdsQVeGUCAgFX4mX7n/live/questions'
ATTENDANCE = 'https://docs.google.com/forms/d/e/1FAIpQLSd-fgXD_PRemaViyEM3E3se8KbRnYauMPQdybBOfYvnhtNXcg/viewform'
FEEDBACK = 'https://docs.google.com/forms/d/e/1FAIpQLSfBSBVqblbEIXMo8n4AJDuWOeI9ReD15H6wacKMzswZeALMvg/viewform'

def slido_slide(name):
    return dict(name=name, elements=[
        dict(text('Slido Q&A',72,117,1136,83,64,INK,True),align='center'),
        image('slido-qa.png',440,215,400,400,'Slido Q&A QR code',href=SLIDO),
        dict(text('Scan to ask a question',72,620,1136,38,26,GRAY),align='center')],
        notes='Scan the supplied Slido code to submit questions, or tap the code to open Slido on this device.')

slides = [
 dict(name='Cover',elements=[
    dict(text('Re:Zero Beginner series:',72,195,1136,48,32,BLUE,True),align='center'),
    dict(text('Hackathon Masterclass',72,266,1136,96,76,INK,True),align='center'),
    dict(text('& Hackathon Project Sharing',72,366,1136,86,62,INK,True),align='center')],
    notes='Welcome to Re:Zero Beginner series: Hackathon Masterclass & Hackathon Project Sharing. The dinosaur automatically watches TV, plays Dino Run and drifts off to sleep. Advance to Slido Q&A when ready.'),
 slido_slide('Slido'),
 dict(name='Intro', elements=[
    text('Meet the builders.',72,117,1110,83,68,INK,True),
    text('Hackathon masterclass',76,208,1080,40,28,GRAY),
    image('zayn.png',72,267,347,282,'Zayn, photographed beside a shop window',crop=dict(left=.32,right=.13,top=.10,bottom=1-.10-(960*.55/1280*282/347))),
    image('shawn.jpg',457,267,347,282,'Shawn, photographed outdoors in a suit',fit='cover',focus='50% 30%'),
    image('edmund-birthday-closeup.jpg',842,267,347,282,'Edmund holding his birthday cake',fit='contain'),
    text('Zayn',72,559,347,42,34,BLUE,True),
    text('Shawn',457,559,347,42,34,RED,True),
    text('Edmund',842,559,347,42,34,GREEN,True),
    dict(kind='speakerBadge',label='9x Hackathon Winner',icon='trophy',x=72,y=610,w=300,h=38,color='#174EA6'),
    dict(kind='speakerBadge',label='GDG AI/ML Team Lead',icon='gdg',x=457,y=610,w=310,h=38,color='#137333'),
    dict(kind='speakerBadge',label='',icon='cake',x=842,y=610,w=62,h=38,color='#775600')],
    notes='Introduce Zayn, Shawn and Edmund using the supplied names, portraits and badges. Zayn’s 9x Hackathon Winner claim and Shawn’s GDG AI/ML Team Lead role are labels provided by the presenter. Edmund uses the supplied birthday-cake photo and a cake badge. Do not infer ages or additional achievements.'),
 dict(name='Stories', elements=[
    text('Hackathon',72,117,330,85,72,INK,True),
    text('11 hackathons   9 wins',76,218,750,44,32,BLUE,True),
    sticker('trophy',412,106,108,108),
    photo('P3291631.JPG',72,296,180,240,'Team with a hackathon award'),
    photo('P3311713 (1) (1).JPG',266,341,260,195,'Team holding a competition award'),
    photo('P9063427.jpeg',540,341,260,195,'Team at an AI for Society event'),
    image('upload-award.jpg',814,296,180,240,'Newly uploaded hardware prototype photograph on the award board','P4021779.JPG'),
    image('upload-demo.jpg',1008,296,180,240,'Newly uploaded presenter photograph showing the Agent Beaver Clever app','P4151781.jpeg'),
    text('Teams. Prototypes. Demos.',76,574,1080,42,28,GRAY)],
    notes='The previous opening slide is now the second slide, with the two newly uploaded photos added. The totals are the presenter’s own claims from Hack.pptx; they are not independently verified. Tell one short story behind an award, prototype or demo.'),
 dict(name='Brainstorm', buildTitle='Hackathon tips', elements=[
    text('Idea Brainstorming',72,192,1100,40,30,INK,True),
    image('brainstorm-drake.png',72,236,530,530*343/429,'Drake rejecting an AI-only idea and approving your own brainstormed ideas'),
    dict(text('Idea from AI',284,305,310,44,30,RED,True),align='center'),
    image('brand-gemini.png',310,366,42,42,'Gemini logo'),
    image('brand-chatgpt.ico',378,366,42,42,'ChatGPT logo'),
    image('brand-claude.ico',446,366,42,42,'Claude logo'),
    image('brand-grok.svg',514,366,42,42,'Grok logo'),
    dict(text('Gemini',299,414,64,22,13,GRAY),align='center'),
    dict(text('ChatGPT',367,414,64,22,13,GRAY),align='center'),
    dict(text('Claude',435,414,64,22,13,GRAY),align='center'),
    dict(text('Grok',503,414,64,22,13,GRAY),align='center'),
    dict(text('Your own ideas',284,485,310,44,30,GREEN,True),align='center'),
    sticker('idea',393,544,80,80),
    dict(kind='check',x=658,y=299,w=30,h=30),
    text('Brainstorm ideas',704,291,500,46,32,BLUE,True),
    dict(kind='check',x=658,y=383,w=30,h=30),
    text('Daily life',704,375,500,46,32,GREEN,True),
    dict(kind='check',x=658,y=467,w=30,h=30),
    text('Solve a niche problem',704,459,500,46,30,INK,True),
    image('no-thanks-ai.png',1062,540,140,140,'No thanks I use AI meme, marked with a ban sign'),
    dict(kind='ban',x=1055,y=533,w=154,h=154)],
    notes='Begin with the centred Hackathon tips title, then morph it upward to reveal Idea Brainstorming. The supplied Drake meme contrasts Idea from AI with Your own ideas and a light bulb. Brainstorm, notice problems in daily life and solve a niche problem. The second supplied meme sits in the bottom corner with a red ban overlay, warning against outsourcing your thinking to AI.'),
 dict(name='Idea', elements=[
    text('Simple wins.',72,117,940,83,68,INK,True),
    text('Simple app',76,254,510,49,36,BLUE,True),
    text('One useful task',76,307,500,39,27,GRAY),
    text('Beyond a chatbot',76,382,525,48,34,RED,True),
    text('Machine learning',76,455,510,45,32,GREEN,True),
    text('AI + IoT = AIoT',76,549,550,50,38,BLUE,True),
    photo('P3261499.JPG',658,254,246,328,'Electronics connected beside a laptop'),
    photo('P3261504 (1).JPG',928,254,230,328,'A printer making the prototype enclosure'),
    image('photo-02.png',464,454,145,145,'Supplied generated concept illustration','Gemini_Generated_Image_mcsnd8mcsnd8mcsn.png',crop=dict(top=.22,bottom=.18,left=.04,right=.04)),
    sticker('idea',1050,116,108,108)],
    notes='Based on uploaded screenshot 3 and Hack.pptx slide 2. Prefer a simple app over a cluttered dashboard. Go beyond a generic chatbot by delivering a useful result, using machine learning or AI plus IoT where relevant. This is the presenter’s advice, not a universal ban on chat interfaces. The small mint device visual is a supplied generated concept.'),
 dict(name='Build', elements=[
    text('Make it real.',72,117,1040,83,68,INK,True),
    text('Build. Test. Improve.',76,211,1020,42,30,GRAY),
    image('phone-closed.jpg',72,303,300,225,'A completed phone-mounted hardware enclosure','Hack.pptx phone exterior'),
    image('phone-open.jpg',394,303,300,225,'The working electronics inside the phone enclosure','Hack.pptx phone electronics'),
    photo('P4021743.JPG',720,245,212,283,'A completed mint hardware prototype'),
    image('upload-award.jpg',952,245,212,283,'The completed device on an award board','Uploaded award photograph'),
    text('Build',76,552,300,42,29,BLUE,True),
    text('Test',398,552,300,42,29,RED,True),
    text('Prototype',720,552,212,42,29,GREEN,True),
    text('Result',952,552,212,42,29,BLUE,True)],
    notes='Based on uploaded screenshot 4. The two original phone-prototype photographs were recovered from Hack.pptx rather than taking a screenshot of a screenshot. Show the enclosure, then the internals, and explain the useful task that really works.'),
 dict(name='Showcase', elements=[
    dict(text('Project Showcase',72,304,1136,120,88,INK,True),align='center')],
    notes='Project Showcase section divider. Show the projects before moving into UI and slide design.'),
 dict(name='Demo', buildTitle='UI / Slide Design', elements=[
    image('bad-design-meme.png',550,114,150,92,'Winnie the Pooh looking unimpressed while reading a sheet of paper'),
    text('Bad UI',24,214,604,42,30,RED,True),
    text('Bad slides',652,214,380,42,30,RED,True),
    dict(kind='gallery',x=24,y=270,w=1232,h=382,label='Bad design examples',items=[
        [dict(file='bad-ui-finance.png',alt='Bad UI: procurement and contract risk dashboard'),dict(file='bad-slide-inbound.png',alt='Bad slide: Inbound Paradox')],
        [dict(file='bad-ui-oasis.png',alt='Bad UI: OASIS security workspace'),dict(file='bad-slide-architecture.png',alt='Bad slide: Bi-Modal Architecture')]])],
    notes='Start with the centred title, then morph it upward to reveal one large bad UI and one large bad slide. Next examples swipes the second pair to the front; Previous examples swipes back. Use touch swiping or the example buttons to change the pair; left and right keyboard arrows navigate the presentation. Screenshots remain intact and borderless. Click a screenshot for a full-screen view; Escape returns.'),
 dict(name='Design', certify=True, elements=[
    text('UI / Slide Design',72,117,1100,83,64,INK,True),
    dict(text('Good UI',72,214,1136,42,30,BLUE,True),align='center'),
    image('good-ui-rewatt.png',72,270,190,394,'Good UI: ReWatt room monitoring mobile interface',preview=True),
    image('good-ui-house.png',282,270,724,394,'Good UI: the supplied illustrated housemate dashboard',preview=True),
    image('good-ui-sign.jpg',1026,270,182,394,'Good UI: the supplied sign-to-voice mobile interface',preview=True),
    dict(kind='certify',x=1090,y=110,w=160,h=160)],
    notes='Show all three Good UI examples together on one page: ReWatt, the illustrated housemate dashboard and the sign-to-voice app. There are no carousel arrows or swiping between examples. The first click anywhere stamps Good Slide — Certified; this is a workshop joke, not an external certification. After stamping, click an example to enlarge it or click outside the examples to advance.'),
 dict(name='Pitch', buildTitle='if (Pitch || Presentation_Video) {', buildCode=True, elements=[
    dict(text('if (pace === "Too Slow") {',72,208,546,42,28,RED,True),code=True),
    image('pace-too-slow.png',72,259,546,230,'Too Slow: the supplied blinking-listener meme'),
    dict(text('console.log("Audience: 😴");',96,503,520,32,22,GRAY),code=True),
    dict(text('}',72,534,60,32,26,RED),code=True),
    dict(text('else if (pace === "Too Fast") {',662,208,546,42,28,BLUE,True),code=True),
    image('pace-too-fast.png',759,259,351,351*491/750,'Too Fast: the supplied confused-listener meme',crop=dict(top=.254,bottom=.255,left=0,right=0)),
    dict(text('console.log("Audience: 🤯");',686,503,520,32,22,GRAY),code=True),
    dict(text('}',662,534,60,32,26,BLUE),code=True),
    dict(text('else { console.log("Audience: 😎"); }\n}',72,576,1136,60,22,GREEN),code=True)],
    notes='Start with the centred code title. Advance once to morph the title to the top and reveal both pace memes on the same slide. Advance again for judging criteria. The displayed JavaScript is syntactically valid when Pitch and Presentation_Video are defined booleans and pace is a defined string. The first meme corresponds to pace === "Too Slow" and the second to pace === "Too Fast". The else branch is the comfortable pace. The second picture’s blank margins are cropped in the layout; the original file is preserved.'),
 dict(name='Criteria', elements=[
    text('Pitch for the points.',72,117,1100,83,64,INK,True),
    text('Pitch / Presentation Video',76,208,980,40,28,GRAY),
    photo('20260907_145201.jpg',72,273,186,330,'An audience at a technology event'),
    photo('PC021661.jpg',285,315,248,186,'Presenters explaining a simple app on stage'),
    dict(text('Problem',601,272,550,42,34,BLUE,True),align='center'),
    dict(kind='flowArrow',x=864,y=314,w=24,h=24),
    dict(text('Agitation',601,342,550,42,34,RED,True),align='center'),
    dict(kind='flowArrow',x=864,y=384,w=24,h=24),
    dict(text('Solution',601,412,550,42,34,GREEN,True),align='center'),
    dict(kind='flowArrow',x=864,y=454,w=24,h=24),
    dict(text('Validation Proof',601,482,550,42,34,'#A56A00',True),align='center'),
    dict(kind='flowArrow',x=864,y=524,w=24,h=24),
    dict(text('Insane Value Metric',601,552,550,42,34,BLUE,True),align='center'),
    sticker('microphone',1100,500,105,135)],
    notes='Read the pitch flow from top to bottom: Problem, Agitation, Solution, Validation Proof, Insane Value Metric. Show what hurts, why it matters, the solution, supporting evidence and one memorable measurable result. Connect the story to the actual judging criteria and rehearse within the event’s time limit.'),
 dict(name='Challenge', elements=[
    dict(text('AI for Everyday Life',72,127,1136,60,42,BLUE,True),align='center',liveTheme=True),
    image('challenge-qr.png',450,140,380,380,'Scan to submit a workshop idea'),
    dict(kind='rankButton',x=480,y=534,w=320,h=66),
    dict(text('',265,608,750,40,18,GRAY),align='center',liveStatus=True),
    dict(kind='link',text='Open dashboard',href='/board',dashboard=True,x=72,y=603,w=190,h=40)],
    notes='Set the theme, judging criteria and Gemini connection in the presenter dashboard. The saved theme appears above the large central QR code; leave it blank until ready. Participants scan and submit. Press the GDG Reveal rankings button to analyse all ideas and reveal the top three with the existing countdown and podium inside the presentation. It requires at least three ideas and a real Gemini connection. Existing ranked results can be shown again without re-analysing. Open dashboard plays the dinosaur warp-pipe jump, then opens the public title wall. Presenter controls stay at /host.'),
 dict(name='Timer',elements=[
    dict(text('GDG Clock',72,117,1136,83,64,INK,True),align='center'),
    dict(kind='countdown',x=450,y=207,w=380,h=425)],
    notes='Five-minute GDG countdown after the challenge announcement and before closing Slido Q&A. The Chrome dinosaur runs from the left to the right across the same five minutes; all timer controls also control the run. Press Start to begin, Pause to hold, Resume to continue, or Reset to return to 05:00. The timer keeps real elapsed time while this browser tab is in the background. It stays at 00:00 when finished; advance to Slido when ready.'),
 slido_slide('Questions'),
 dict(name='Thanks', elements=[
    dict(text('Thank You',72,117,1136,132,100,INK,True),align='center'),
    dict(kind='firework',x=390,y=355,w=140,h=160,delay=0),
    dict(kind='firework',x=750,y=355,w=140,h=160,delay=.35),
    image('black-cat-cat-meme.gif',480,290,320,320,'The supplied animated black cat celebrating',chroma=True),
    dict(text('Attendance Form',72,228,300,42,32,BLUE,True),align='center'),
    image('attendance-form.png',72,282,300,300,'Attendance Form QR code',href=ATTENDANCE),
    dict(text('Feedback Form',908,228,300,42,32,GREEN,True),align='center'),
    image('feedback-form.png',908,282,300,300,'Feedback Form QR code',href=FEEDBACK)],
    notes='Thank the audience. Scan the separately labelled Attendance Form and Feedback Form codes; tapping either QR opens its matching form. The original cat GIF and side fireworks keep celebrating. The Chrome dinosaur keeps its trophy below.')
]

# Portrait positions reuse the same elements, photos, galleries and click-to-reveal steps.
# Each tuple is x, y, width, height, and optional font size on a 720 x 1280 canvas.
portrait = {
 'Cover': [(36,270,648,52,36),(36,370,648,190,76),(36,600,648,190,64)],
 'Slido': [(36,240,648,90,64),(72,350,576,576),(36,970,648,50,32)],
 'Questions': [(36,240,648,90,64),(72,350,576,576),(36,970,648,50,32)],
 'Timer': [(36,210,648,90,64),(36,358,648,716)],
 'Intro': [(36,210,648,92,64),(36,312,648,46,34),
    (36,375,282,244),(36,638,282,244),(36,901,282,244),
    (354,440,330,58,44),(354,703,330,58,44),(354,966,330,58,44),
    (354,510,330,64,26),(354,773,330,64,26),(354,1036,86,64)],
 'Stories': [(36,210,430,86,72),(36,312,648,50,36),(490,202,96,96),
    (36,400,198,264),(256,400,428,321),(36,752,280,210),
    (340,752,160,214),(520,752,160,214),(36,1040,648,50,34)],
 'Brainstorm': [(36,302,648,52,42),(36,376,648,518),(296,453,378,52,36),
    (312,528,58,58),(399,528,58,58),(486,528,58,58),(573,528,58,58),
    (288,596,106,30,20),(375,596,106,30,20),(462,596,106,30,20),(549,596,106,30,20),
    (296,686,378,52,36),(432,759,100,100),
    (36,934,36,36),(92,930,440,50,34),(36,1002,36,36),(92,998,440,50,34),
    (36,1070,36,36),(92,1066,440,50,32),(556,1008,114,114),(550,1002,126,126)],
 'Idea': [(36,210,540,100,64),(36,354,648,50,42),(36,413,648,46,34),
    (36,490,648,50,40),(36,552,520,50,38),(36,620,520,54,42),
    (36,748,270,360),(332,748,270,360),(560,582,112,112),(578,204,104,104)],
 'Build': [(36,210,648,92,64),(36,314,648,46,34),
    (36,410,306,230),(378,410,306,230),(66,740,240,320),(414,740,240,320),
    (36,654,306,50,36),(378,654,306,50,36),(66,1080,240,50,34),(414,1080,240,50,34)],
 'Showcase': [(36,500,648,240,86)],
 'Demo': [(550,210,130,80),(36,350,648,44,34),(36,734,648,44,34),(36,396,648,710)],
 'Design': [(36,210,648,92,60),(36,326,648,52,40),
    (36,758,306,400),(36,394,648,330),(378,758,306,400),(552,202,140,140)],
 'Pitch': [(36,340,648,44,32),(87,392,546,230),(60,634,624,40,28),(36,674,60,38,32),
    (36,724,648,44,32),(184,786,351,230),(60,1028,624,40,28),(36,1068,60,38,32),
    (36,1120,648,70,24)],
 'Criteria': [(36,210,648,130,60),(36,352,648,46,34),(36,430,203,360),(278,430,406,305),
    (36,826,530,44,36),(289,870,24,24),(36,896,530,44,36),(289,940,24,24),
    (36,966,530,44,36),(289,1010,24,24),(36,1036,530,44,36),(289,1080,24,24),
    (36,1106,530,44,36),(572,1010,104,134)],
 'Challenge': [(36,220,648,116,48),(88,348,544,544),(110,930,500,88),
    (36,1032,648,90,30),(196,1136,328,82)],
 'Thanks': [(36,210,648,120,88),(80,360,180,200),(460,360,180,200),(244,350,232,232),
    (36,660,306,52,32),(36,728,306,306),(378,660,306,52,32),(378,728,306,306)]
}
scenes = dict(Cover='window',Slido='pipe',Intro='plane',Stories='balloon',Brainstorm='bridge',
    Idea='chase',Build='spring',Showcase='bowling',Demo='ufo',Design='portal',Pitch='rocket',
    Criteria='hole',Challenge='magnet',Timer='train',Questions='finish',Thanks='finish')
assert len({scenes[s['name']] for s in slides[:-1]}) == len(slides)-1
for slide in slides:
    slide['scene'] = scenes[slide['name']]
    assert len(slide['elements']) == len(portrait[slide['name']])
    for element, rect in zip(slide['elements'], portrait[slide['name']]):
        element['mobile'] = dict(zip(('x','y','w','h','size'),rect))

(OUT/'assets/backup-demo.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect x="12" y="14" width="456" height="300" rx="18" fill="#F7F9FC" stroke="#111315" stroke-width="4"/><path d="M14 65H466" stroke="#111315" stroke-width="3"/><circle cx="38" cy="40" r="7" fill="#EA4335"/><circle cx="62" cy="40" r="7" fill="#FBBC04"/><circle cx="86" cy="40" r="7" fill="#34A853"/><rect x="44" y="90" width="392" height="164" rx="10" fill="#E8F0FE"/><circle cx="240" cy="172" r="44" fill="#4285F4"/><path d="M228 148L264 172L228 196Z" fill="white"/><path d="M49 282H431" stroke="#DADCE0" stroke-width="7" stroke-linecap="round"/><path d="M49 282H179" stroke="#34A853" stroke-width="7" stroke-linecap="round"/><path d="M177 337H303" stroke="#111315" stroke-width="7" stroke-linecap="round"/></svg>''',encoding='utf-8')
(OUT/'assets/podium.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" width="500" height="194" viewBox="0 0 500 194"><rect x="20" y="91" width="145" height="98" rx="9" fill="#4285F4"/><rect x="178" y="22" width="145" height="167" rx="9" fill="#FBBC04"/><rect x="336" y="119" width="145" height="70" rx="9" fill="#34A853"/><path d="M218 5L230 28L255 31L237 49L241 74L218 62L196 74L200 49L182 31L207 28Z" fill="#EA4335" transform="translate(33 -2) scale(.85)"/><text x="92" y="151" text-anchor="middle" fill="white" font-family="Arial" font-size="38" font-weight="bold">2</text><text x="250" y="138" text-anchor="middle" fill="#111315" font-family="Arial" font-size="54" font-weight="bold">1</text><text x="409" y="168" text-anchor="middle" fill="white" font-family="Arial" font-size="32" font-weight="bold">3</text></svg>''',encoding='utf-8')
(ROOT/'.hack-build/deck-spec.json').write_text(json.dumps(slides,ensure_ascii=False,indent=2),encoding='utf-8')
for label,file,color in [('UI example','good-ui-slot.svg',BLUE),('Slide example','good-slide-slot.svg',GREEN),('Bad UI example','bad-ui-slot.svg',RED),('Bad slide example','bad-slide-slot.svg',YELLOW)]:
    frame = '' if file.startswith('good-') else f'<rect x="2" y="2" width="542" height="298" rx="15" fill="#FAFBFD" stroke="{color}" stroke-width="2" stroke-dasharray="8 7"/>'
    (OUT/'assets'/file).write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="546" height="302" viewBox="0 0 546 302">{frame}<rect x="239" y="92" width="68" height="52" rx="6" fill="none" stroke="#BDC1C6" stroke-width="3"/><circle cx="257" cy="108" r="6" fill="#BDC1C6"/><path d="M244 137L262 119L275 132L287 117L302 137" fill="none" stroke="#BDC1C6" stroke-width="3"/><text x="273" y="198" text-anchor="middle" font-family="Arial" font-size="25" fill="#5F6368">{label}</text></svg>''',encoding='utf-8')
print('Prepared sixteen slides with a GDG countdown, Slido Q&A and closing forms.')
