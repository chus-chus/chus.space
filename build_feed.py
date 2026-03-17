#!/usr/bin/env python3
"""
build_feed.py - Generate the site's RSS feed.

Usage:
    python build_feed.py

Writes feed.xml in the repository root.
"""

import os

from build_post import generate_feed


def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    out_path, posts = generate_feed(root_dir)
    print('%s (%d posts)' % (out_path, len(posts)))


if __name__ == '__main__':
    main()
