#!/usr/bin/env python3
"""Export a self-contained, printable HTML storyboard from a prompt pack."""
from __future__ import annotations

import argparse
import base64
import html
import json
from pathlib import Path
import sys

from compose_prompt import read_json

MAX_IMAGE_BYTES = 20 * 1024 * 1024
MAX_TOTAL_BYTES = 50 * 1024 * 1024


def escape(value):
    return html.escape(str(value), quote=True)


class ImageStore:
    def __init__(self):
        self.cache = {}
        self.total = 0

    def uri(self, path):
        path = Path(path).resolve()
        if path in self.cache:
            return self.cache[path]
        size = path.stat().st_size
        if size > MAX_IMAGE_BYTES or self.total + size > MAX_TOTAL_BYTES:
            raise ValueError("image budget exceeded (20 MiB per image, 50 MiB total)")
        raw = path.read_bytes()
        if raw.startswith(b"\x89PNG\r\n\x1a\n"):
            mime = "image/png"
        elif raw.startswith(b"\xff\xd8\xff"):
            mime = "image/jpeg"
        elif raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
            mime = "image/webp"
        else:
            raise ValueError(f"unsupported image bytes: {path.name}; use PNG, JPEG or WebP")
        self.total += len(raw)
        uri = "data:" + mime + ";base64," + base64.b64encode(raw).decode("ascii")
        self.cache[path] = uri
        return uri


def validate_pack(pack):
    if not isinstance(pack, dict) or pack.get("schema_version") not in ("1.0.0", "1.1.0"):
        raise ValueError("expected a v1.0.0 or v1.1.0 prompt pack")
    records = pack.get("prompt_records")
    if not isinstance(records, list) or not records:
        raise ValueError("prompt_records must be a non-empty array")
    ids = []
    for record in records:
        if not isinstance(record, dict) or not isinstance(record.get("id"), str) or not record["id"].strip():
            raise ValueError("each prompt record needs a non-empty id")
        if not isinstance(record.get("prompt_en"), str) or not isinstance(record.get("shot"), dict):
            raise ValueError("each prompt record needs prompt_en and shot")
        ids.append(record["id"])
    if len(set(ids)) != len(ids):
        raise ValueError("prompt pack has duplicate shot ids")
    return records


def image_map(path, ids):
    if path is None:
        return {}
    mapping = read_json(path)
    if not isinstance(mapping, dict):
        raise ValueError("image map must be a JSON object mapping shot ids to local image paths")
    if set(mapping) - set(ids):
        raise ValueError("image map contains unknown shot ids")
    result = {}
    for identifier, source in mapping.items():
        if not isinstance(source, str) or not source.strip() or "://" in source:
            raise ValueError("frame image sources must be local paths")
        result[identifier] = (Path(path).resolve().parent / source).resolve()
    return result


def code(value):
    return "<pre>" + escape(json.dumps(value, ensure_ascii=False, indent=2)) + "</pre>"


def item(label, value):
    return f"<dt>{escape(label)}</dt><dd>{escape(value)}</dd>"


def render(pack, mapping=None, columns=2):
    records = validate_pack(pack)
    mapping = mapping or {}
    if columns not in (1, 2, 3) or set(mapping) - {record["id"] for record in records}:
        raise ValueError("invalid columns or unknown frame image ids")
    images = ImageStore()
    # Validate all explicitly supplied frame images before creating output.
    frame_uris = {identifier: images.uri(path) for identifier, path in mapping.items()}
    params = pack.get("parameters", {})
    ratio = params.get("aspect_ratio", "16:9")
    css_ratio = ratio.replace(":", " / ") if ratio in ("16:9", "9:16", "1:1", "4:3", "3:2", "2.39:1") else "16 / 9"
    title = pack.get("title", "中国古风电影级 3D 动画分镜")
    timeline = pack.get("timeline", {})
    times = {entry["id"]: entry for entry in timeline.get("entries", [])}
    duration = timeline.get("total_duration_seconds")
    count = len(frame_uris)
    cards = []
    for record in records:
        identifier, shot = record["id"], record["shot"]
        if identifier in frame_uris:
            picture = f'<img class="frame" src="{frame_uris[identifier]}" alt="{escape(identifier)} 分镜图">'
            status = "[输入图片] 已提供分镜图；内容与连续性需另行审阅。"
        else:
            picture = '<div class="placeholder">待出图<br><small>此处为分镜占位，不是生成画面</small></div>'
            status = "[待补充] 尚未关联该镜头的分镜图片。"
        time = times.get(identifier, {})
        start, end = time.get("start_seconds"), time.get("end_seconds")
        interval = f"{start:g}–{end:g} 秒" if start is not None and end is not None else "时间点未完整标注"
        movement = shot.get("camera_motion", {"type": "locked", "description": "static camera, no movement"})
        outgoing = shot.get("transition_out", {"type": "cut", "duration_seconds": 0})
        cues = shot.get("sound", {"ambience": [], "effects": [], "music": "none", "dialogue": []})
        audio = []
        for key, label in (("ambience", "环境声"), ("effects", "音效")):
            audio.append(item(label, "；".join(cues.get(key, [])) or "未安排"))
        audio.append(item("音乐", cues.get("music", "none")))
        audio.append(item("对白", "；".join(str(line.get("speaker", "")) + "：" + str(line.get("text", ""))
                                         for line in cues.get("dialogue", [])) or "无"))
        details = [
            item("动作", shot.get("action", "")), item("景别与构图", shot.get("camera", "")),
            item("灯光 / 情绪", str(shot.get("lighting", "")) + " / " + str(shot.get("emotion", ""))),
            item("场景", shot.get("scene_id") or "未设置场景锁"),
            item("参考图 ID", ", ".join(record.get("reference_ids", [])) or "未关联"),
            item("镜头运动", movement.get("type", "locked") + " · " + movement.get("description", "")),
            item("运动起止", str(movement.get("start_frame", "未标注")) + " → " + str(movement.get("end_frame", "未标注"))),
            item("出镜转场", str(outgoing.get("type", "cut")) + f" · {outgoing.get('duration_seconds', 0)} 秒"),
        ]
        cards.append(f'<article class="card"><header><h2>{escape(identifier)}</h2><span>{escape(interval)}</span></header>'
                     + f'<div class="picture">{picture}</div><p class="status">{escape(status)}</p>'
                     + '<p class="label">[制作规划] 以下为镜头与声音设计，未生成视频或音频。</p>'
                     + '<dl>' + "".join(details + audio) + '</dl>'
                     + '<details class="prompts"><summary>完整静态与动态提示词</summary>'
                     + '<pre>' + escape(record["prompt_en"]) + '</pre><pre>'
                     + escape(record.get("motion_prompt_en", "旧版提示词包未提供动态镜头提示词。"))
                     + '</pre></details></article>')
    references = []
    for ref in pack.get("reference_images", []):
        picture = '<div class="ref-placeholder">资源 ID，仅记录关联</div>'
        if ref.get("source_type") == "local":
            path = Path(ref.get("source", ""))
            if path.is_file():
                picture = f'<img src="{images.uri(path)}" alt="{escape(ref.get("id", ""))} 参考图">'
            else:
                picture = '<div class="ref-placeholder">参考图路径不可用</div>'
        references.append('<figure>' + picture + '<figcaption>[参考图] '
                          + escape(ref.get("id", "")) + " · " + escape(ref.get("role", ""))
                          + '<br>' + escape(ref.get("description", "")) + '</figcaption></figure>')
    total = f"{duration:g} 秒" if duration is not None else "未完整标注"
    summary = f"[规划参数] {pack.get('profile', '')} · {ratio} · {len(records)} 镜 · 总时长 {total}"
    css = """
    :root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f2eee6;color:#252b2f;font-family:system-ui,sans-serif}
    main{max-width:1400px;margin:auto;padding:32px}h1{font-size:30px;margin:0 0 12px}h2{font-size:19px;margin:0}
    .notice,.label,.status{font-size:12px;line-height:1.6}.board{display:grid;gap:20px;margin:24px 0}
    .card{background:white;border:1px solid #d7d3ca;border-radius:10px;overflow:hidden;break-inside:avoid}
    .card header{display:flex;justify-content:space-between;gap:10px;padding:14px 16px;background:#e9e5db}
    .card header span{font-size:12px}.picture{background:#d8dedf}.frame{display:block;width:100%;height:100%;object-fit:contain}
    .placeholder{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#596469;min-height:130px}
    .placeholder small{font-size:12px}.card p,.card dl,.card details{margin:12px 16px}
    dl{display:grid;grid-template-columns:100px 1fr;gap:7px;font-size:12px;line-height:1.55}dt{font-weight:650}dd{margin:0;overflow-wrap:anywhere}
    pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f5f5f2;padding:12px;font-size:11px}
    details{margin:14px 0}summary{cursor:pointer}.refs{display:flex;flex-wrap:wrap;gap:12px}.refs figure{margin:0;width:220px}
    .refs img{width:100%;height:140px;object-fit:contain;background:#ddd}.refs figcaption{font-size:12px;padding:8px}
    .ref-placeholder{height:100px;background:#ddd;padding:22px;font-size:12px}
    @media(max-width:760px){main{padding:16px}.board{grid-template-columns:1fr!important}dl{grid-template-columns:80px 1fr}}
    @page{size:A4 landscape;margin:10mm}
    @media print{body{background:white}main{padding:0;max-width:none}h1{font-size:22px}.board{gap:12px;grid-template-columns:repeat(2,minmax(0,1fr))!important}.card{border-radius:0}.picture{height:48mm;aspect-ratio:auto!important}.placeholder{min-height:0}.prompts{display:none}.refs{break-inside:avoid}.card header{-webkit-print-color-adjust:exact;print-color-adjust:exact}dl{font-size:10px}}
    """
    css += f".board{{grid-template-columns:repeat({columns},minmax(0,1fr))}}.picture{{aspect-ratio:{css_ratio}}}"
    return ('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">'
            + '<meta name="viewport" content="width=device-width,initial-scale=1">'
            + '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; img-src data:; style-src &#39;unsafe-inline&#39;; script-src &#39;none&#39;">'
            + '<title>' + escape(title) + '</title><style>' + css + '</style></head><body><main>'
            + '<h1>' + escape(title) + '</h1><p>' + escape(summary) + '</p>'
            + f'<p class="notice">[导出状态] 已关联 {count}/{len(records)} 张输入分镜图，其余为待出图占位。'
            + '此文件不生成图片、视频或声音。可使用浏览器打印功能保存 PDF。</p>'
            + '<p class="notice">[时间约定] 转场占源镜头末尾时长，不额外叠加或扣除总时长。</p>'
            + '<section class="board">' + "".join(cards) + '</section>'
            + '<h2>参考图关联</h2><p class="notice">[输入记录] 参考图与分镜成图分别记录，参考图不会自动替代缺失镜头。</p>'
            + '<section class="refs">' + "".join(references) + '</section>'
            + '<details><summary>统一角色与场景设定</summary>' + code(pack.get("character_lock", {}))
            + code(pack.get("scene_locks", [])) + '</details>'
            + '<details><summary>负向约束、默认项与来源说明</summary><pre>' + escape(pack.get("negative_prompt_en", ""))
            + '</pre>' + code(pack.get("assumptions", {})) + code(pack.get("source_notes", [])) + '</details>'
            + '<p class="notice">' + '<br>'.join(escape(w) for w in pack.get("warnings", [])) + '</p>'
            + '</main></body></html>')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="JSON prompt pack")
    parser.add_argument("--image-map", type=Path, help="Optional JSON shot-id to local-frame paths")
    parser.add_argument("--columns", type=int, choices=(1, 2, 3), default=2)
    parser.add_argument("--output", required=True, type=Path, help="New self-contained HTML file")
    args = parser.parse_args(argv)
    try:
        pack = read_json(args.input)
        records = validate_pack(pack)
        mapping = image_map(args.image_map, [record["id"] for record in records])
        content = render(pack, mapping, args.columns)
        with args.output.open("x", encoding="utf-8") as target:
            target.write(content)
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
