#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
LEDGER_PATTERN = 'user_request_plan_log_v*.json'
VERSION_RE = re.compile(r'_v(\d+)\.json$', re.I)


def extract_version_number(path: Path) -> int:
    match = VERSION_RE.search(path.name)
    return int(match.group(1)) if match else -1


def find_latest_ledger() -> Path | None:
    ledgers = sorted(ROOT.glob(LEDGER_PATTERN), key=extract_version_number)
    return ledgers[-1] if ledgers else None


def bullet_lines(items: list[str]) -> str:
    if not items:
        return '1. （暂无）'
    return '\n'.join(f'{idx + 1}. {item}' for idx, item in enumerate(items))


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding='utf-8'))


def implemented_items(data: dict[str, Any]) -> list[str]:
    version = str(data.get('version', '')).lower().strip()
    preferred_key = f'implemented_in_{version}' if version else ''
    if preferred_key and isinstance(data.get(preferred_key), list):
        return data.get(preferred_key, [])
    for key, value in data.items():
        if key.startswith('implemented_in_') and isinstance(value, list):
            return value
    return []


def render_sections(sections: list[dict[str, Any]]) -> str:
    chunks: list[str] = []
    for section in sections:
        title = str(section.get('title', '')).strip() or '未命名章节'
        points = section.get('points', [])
        chunks.append(f'## {title}\n{bullet_lines(list(points) if isinstance(points, list) else [])}')
    return '\n\n'.join(chunks)


def build_plan_doc(data: dict[str, Any]) -> str:
    project = data.get('project', '好吃家')
    version = data.get('version', '')
    updated = data.get('updated', '')
    implemented = implemented_items(data)
    return f"""# {project} {version} 用户诉求与实施规划同步记录

更新日期：{updated}

## 用户诉求总表
{bullet_lines(data.get('user_requests', []))}

## 当前实施规划
{bullet_lines(data.get('current_plan', []))}

## 本轮已落实
{bullet_lines(implemented)}

## 验证记录
{bullet_lines(data.get('verification', []))}

## 仍需说明 / 限制
{bullet_lines(data.get('limits', []))}
""".strip() + '\n'


def build_prompt_doc(data: dict[str, Any]) -> str:
    project = data.get('project', '好吃家')
    version = data.get('version', '')
    updated = data.get('updated', '')
    sections = data.get('master_prompt_sections', [])
    sections_md = render_sections(list(sections) if isinstance(sections, list) else [])
    return f"""# {project} {version} 主提示词（持续迭代版）

更新日期：{updated}

下面这份主提示词用于后续所有迭代，目标是让产品始终优先服务真实用户操作，而不是堆概念、堆说明、堆视觉噱头。

{sections_md}
""".strip() + '\n'


def main() -> None:
    ledger = find_latest_ledger()
    if ledger is None:
        return
    data = load_json(ledger)
    version = str(data.get('version', f'v{extract_version_number(ledger)}')).strip() or f'v{extract_version_number(ledger)}'
    plan_output = ROOT / f'Haochijia_User_Requests_And_Plan_{version}.md'
    prompt_output = ROOT / f'Haochijia_Master_Prompt_{version}.md'
    plan_output.write_text(build_plan_doc(data), encoding='utf-8')
    prompt_output.write_text(build_prompt_doc(data), encoding='utf-8')


if __name__ == '__main__':
    main()
