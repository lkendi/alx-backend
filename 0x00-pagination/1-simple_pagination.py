#!/usr/bin/env python3
"""
Module
"""
import csv
import math
from typing import List


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


class Server:
    """Server class to paginate a database of popular baby names.
    """
    DATA_FILE = "Popular_Baby_Names.csv"

    def __init__(self):
        self.__dataset = None

    def dataset(self) -> List[List]:
        """Cached dataset
        """
        if self.__dataset is None:
            with open(self.DATA_FILE) as f:
                reader = csv.reader(f)
                dataset = [row for row in reader]
            self.__dataset = dataset[1:]

        return self.__dataset

    def get_page(self, page: int = 1, page_size: int = 10) -> List[List]:
        """
         Function that retrieves a specific page from the dataset

         Args:
            page(int, default = 1) - page number
            page_size(int, default = 10) - number of items per page

        Returns:
            A list of lists representing the rows of the specified page

        Raises:
            ValueError: If `page` or `page_size` is not a positive integer.
        """
        assert all(isinstance(x, int) and x > 0 for x in (page, page_size))
        start_index, end_index = index_range(page, page_size)
        dataset = self.dataset()

        if end_index > len(dataset):
            return []

        return dataset[start_index:end_index]
