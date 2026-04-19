#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LEDGER = ROOT / 'user_request_plan_log_v26.json'
OUTPUT = ROOT / 'Haochijia_User_Requests_And_Plan_v26.md'


def bullet_lines(items: list[str]) -> str:
    return '\n'.join(f'{idx + 1}. {item}' for idx, item in enumerate(items))


def main() -> None:
    if not LEDGER.exists():
        return
    data = json.loads(LEDGER.read_text(encoding='utf-8'))
    text = f"""# {data.get('project', '好吃家')} {data.get('version', '')} 用户诉求与实施规划同步记录

更新日期：{data.get('updated', '')}

## 用户诉求总表
{bullet_lines(data.get('user_requests', []))}

## 当前实施规划
{bullet_lines(data.get('current_plan', []))}

## 本轮已落实
{bullet_lines(data.get('implemented_in_v26', []))}

## 验证记录
{bullet_lines(data.get('verification', []))}

## 仍需说明 / 限制
{bullet_lines(data.get('limits', []))}
"""
    OUTPUT.write_text(text.strip() + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
