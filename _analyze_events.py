import re, glob, os

files = sorted(glob.glob('events/*.html'))
print('FILES:', len(files))

# Extract the intro paragraph (the <p data-en=... data-zh=...> right after h1)
def intro_para(s):
    m = re.search(r'</h1>\s*<p data-en="(.*?)" data-zh="(.*?)">.*?</p>', s)
    return (m.group(1), m.group(2)) if m else ('?', '?')

# Section heading (PHOTO RECORD block)
def section_heading(s):
    h2 = re.search(r'<h2 data-en="(.*?)" data-zh="(.*?)">.*?</h2>', s)
    p = re.search(r'</h2></div><p data-en="(.*?)" data-zh="(.*?)">.*?</p>', s)
    return ((h2.group(1), h2.group(2)) if h2 else ('?', '?'),
            (p.group(1), p.group(2)) if p else ('?', '?'))

for f in files:
    s = open(f, encoding='utf-8').read()
    t = re.search(r'<title>(.*?)</title>', s)
    d = re.search(r'<meta content="(.*?)" name="description"', s)
    eb = re.search(r'class="eyebrow" data-en="(.*?)" data-zh="(.*?)"', s)
    h1 = re.search(r'<h1 data-en="(.*?)" data-zh="(.*?)">(.*?)</h1>', s)
    nfig = len(re.findall(r'<figure class="gallery-item"', s))
    imgs = re.findall(r'data-lightbox-src="([^"]+)"', s)
    folder = os.path.dirname(imgs[0].replace('\\', '/')) if imgs else ''
    intro_en, intro_zh = intro_para(s)
    sh2, shp = section_heading(s)
    print('---', f)
    print('  folder:', folder)
    print('  title:', t.group(1) if t else '?')
    print('  desc:', d.group(1) if d else '?')
    print('  eyebrow_en:', eb.group(1) if eb else '?')
    print('  eyebrow_zh:', eb.group(2) if eb else '?')
    print('  h1_en:', h1.group(1) if h1 else '?')
    print('  h1_zh:', h1.group(2) if h1 else '?')
    print('  h1_txt:', h1.group(3) if h1 else '?')
    print('  intro_en:', intro_en)
    print('  intro_zh:', intro_zh)
    print('  nfig:', nfig)
    print('  sh2_en:', sh2[0])
    print('  sh2_zh:', sh2[1])
    print('  shp_en:', shp[0])
    print('  shp_zh:', shp[1])
