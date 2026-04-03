#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
项目代码收集脚本
适用于 Next.js / React / TypeScript / Tailwind CSS / Motion 项目
将所有源码文件汇总输出到单个 txt 文件中
"""

import os
import sys
import io
from pathlib import Path
from datetime import datetime

# 修复 Windows 终端输出乱码
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ── 需要收集的文件扩展名 ──────────────────────────────────────────────────────
INCLUDE_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".jsx",   # TypeScript / JavaScript / React
    ".css", ".scss", ".sass",        # 样式
    ".json",                         # 配置（package.json / tsconfig 等）
    ".md", ".mdx",                   # 文档 / MDX 页面
    ".mjs", ".cjs",                  # ESM / CJS 模块
}

# ── 始终跳过的目录 ────────────────────────────────────────────────────────────
EXCLUDE_DIRS = {
    "node_modules", ".next", ".git", ".turbo", ".vercel",
    "dist", "build", "out", ".cache", "coverage",
    "__pycache__", ".pytest_cache", ".mypy_cache",
    ".husky", ".vscode", ".idea",
}

# ── 始终跳过的文件名 ──────────────────────────────────────────────────────────
EXCLUDE_FILES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    ".DS_Store", "Thumbs.db",
}

# ── 文件大小上限（单个文件超过此值跳过，默认 500 KB）────────────────────────
MAX_FILE_SIZE_BYTES = 500 * 1024

SEPARATOR = "=" * 80


def should_include(path):
    """判断文件是否应被收集"""
    if path.name in EXCLUDE_FILES:
        return False
    suffix = path.suffix.lower()
    return suffix in INCLUDE_EXTENSIONS


def collect_files(root):
    """递归收集所有符合条件的文件，按路径排序"""
    collected = []
    for dirpath, dirnames, filenames in os.walk(str(root)):
        # 原地过滤，避免递归进入排除目录
        dirnames[:] = [
            d for d in dirnames
            if d not in EXCLUDE_DIRS and not d.startswith(".")
        ]
        for filename in filenames:
            filepath = Path(dirpath) / filename
            if should_include(filepath):
                try:
                    if filepath.stat().st_size <= MAX_FILE_SIZE_BYTES:
                        collected.append(filepath)
                    else:
                        print("  [跳过·文件过大] {}".format(filepath.relative_to(root)))
                except Exception:
                    pass
    return sorted(collected)


def write_output(root, files, output_path):
    """将所有文件内容写入输出 txt"""
    total_lines = 0
    # utf-8-sig 含 BOM，Windows 记事本 / VSCode 可直接正常显示中文
    with open(str(output_path), "w", encoding="utf-8-sig") as out:
        out.write("项目代码汇总\n")
        out.write("生成时间：{}\n".format(datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
        out.write("项目根目录：{}\n".format(root.resolve()))
        out.write("收集文件数：{}\n".format(len(files)))
        out.write(SEPARATOR + "\n\n")

        out.write("【文件列表】\n")
        for f in files:
            out.write("  {}\n".format(f.relative_to(root)))
        out.write("\n" + SEPARATOR + "\n\n")

        for filepath in files:
            rel = filepath.relative_to(root)
            out.write("FILE: {}\n".format(rel))
            out.write(SEPARATOR + "\n")
            try:
                content = filepath.read_text(encoding="utf-8", errors="replace")
                out.write(content)
                if not content.endswith("\n"):
                    out.write("\n")
                total_lines += content.count("\n")
            except Exception as e:
                out.write("[读取失败: {}]\n".format(e))
            out.write("\n" + SEPARATOR + "\n\n")

        out.write("共收集 {} 个文件，约 {:,} 行代码。\n".format(len(files), total_lines))


def main():
    # 支持命令行传入项目目录，默认使用脚本所在目录
    if len(sys.argv) >= 2:
        root = Path(sys.argv[1]).resolve()
    else:
        root = Path(__file__).resolve().parent

    if not root.is_dir():
        print("错误：目录不存在 -> {}".format(root))
        sys.exit(1)

    # 输出文件放在项目根目录的上一级，避免被收集进去
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = root.parent / "{}_code_{}.txt".format(root.name, timestamp)

    print("扫描目录：{}".format(root))
    print("收集文件中...\n")

    files = collect_files(root)

    if not files:
        print("未找到任何符合条件的文件。")
        sys.exit(0)

    print("找到 {} 个文件，开始写入...\n".format(len(files)))
    write_output(root, files, output_path)

    size_kb = output_path.stat().st_size / 1024
    print("完成！输出文件：{}".format(output_path))
    print("文件大小：{:.1f} KB".format(size_kb))


if __name__ == "__main__":
    main()