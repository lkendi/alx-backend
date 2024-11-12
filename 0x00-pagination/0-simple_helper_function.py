#!/usr/bin/env python3
"""
Simple helper function
"""


def index_range(page: int, page_size: int):
    """
    Calculates the start and end indices
    for a given page and page size.

    Args:
        page (int): The page number (1-indexed).
        page_size (int): The number of items per page.

    Returns:
        A tuple containing the start and end indices.
    """

    if page <= 0 or page_size <= 0:
        raise ValueError("Page and page size must be greater than 0")

    start_index = (page - 1) * page_size
    end_index = start_index + page_size

    return start_index, end_index
