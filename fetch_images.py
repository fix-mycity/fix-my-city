import urllib.request
import re

try:
    req = urllib.request.Request(
        'https://unsplash.com/s/photos/india-traffic',
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    html = urllib.request.urlopen(req).read().decode('utf-8')
    ids = set(re.findall(r'(?:https://images.unsplash.com/photo-)([a-zA-Z0-9-]+)(?:\?)', html))
    print(list(ids)[:10])
except Exception as e:
    print(e)
