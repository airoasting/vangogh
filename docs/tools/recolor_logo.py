# AI 로스팅 로고의 주황 원을 반 고흐 크롬 옐로(#EDB51C) 계열로 다시 칠한다. 하얀 사람과 회로선은 그대로 둔다.
import sys, numpy as np
from PIL import Image
src, out, size = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert('RGBA')
a = np.asarray(im).astype(np.float32) / 255.0
rgb, alpha = a[..., :3], a[..., 3:]
hsv = np.asarray(Image.fromarray((rgb * 255).astype(np.uint8)).convert('HSV')).astype(np.float32) / 255.0
h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
col = s > 0.08                                   # 주황이 섞인 칸(흰색과 섞인 빛 번짐 포함)
if '--stats' in sys.argv:
    m = col & (alpha[..., 0] > 0.5)
    print('hue deg p5/p50/p95', np.percentile(h[m] * 360, [5, 50, 95]), 'v p5/p50/p95', np.percentile(v[m], [5, 50, 95]))
    sys.exit()
# 색상: 원래 8~35도(진홍~주황)를 36~46도(황토~크롬 옐로)로 좁혀 옮긴다
h2 = np.where(col, np.clip(36/360 + (h - 8/360) * (10/27), 36/360, 46/360), h)
# 밝기: 어두운 왼쪽 아래도 황토색이 되도록 들어 올린다
v2 = np.where(col, 0.62 + v * 0.36, v)
s2 = np.where(col, np.minimum(1.0, s * 0.95 + 0.02), s)
hsv2 = (np.stack([h2, s2, v2], -1) * 255).round().astype(np.uint8)
rgb2 = np.asarray(Image.fromarray(hsv2, 'HSV').convert('RGB'))
res = Image.fromarray(np.dstack([rgb2, (alpha[..., 0] * 255).astype(np.uint8)]), 'RGBA')
res.thumbnail((size, size), Image.LANCZOS)
res.save(out, optimize=True)
print('saved', out, res.size)
