#!/usr/bin/env python3
"""
Deletion-resilient hypermedia pagination
"""

import csv
import math
from typing import Dict, List


class Server:
    """Server class to paginate a database of popular baby names.
    """
    DATA_FILE = "Popular_Baby_Names.csv"

    def __init__(self):
        self.__dataset = None
        self.__indexed_dataset = None

    def dataset(self) -> List[List]:
        """Cached dataset
        """
        if self.__dataset is None:
            with open(self.DATA_FILE) as f:
                reader = csv.reader(f)
                dataset = [row for row in reader]
            self.__dataset = dataset[1:]

        return self.__dataset

    def indexed_dataset(self) -> Dict[int, List]:
        """Dataset indexed by sorting position, starting at 0
        """
        if self.__indexed_dataset is None:
            dataset = self.dataset()
            truncated_dataset = dataset[:1000]
            self.__indexed_dataset = {
                i: dataset[i] for i in range(len(dataset))
            }
        return self.__indexed_dataset

    def get_hyper_index(self, index: int = None, page_size: int = 10) -> Dict:
        """
        Retrieves a specific page of data from the dataset
        with hypermedia metadata, handling deletions.

        Args:
            index (int, default = None): starting index of the desired page.
            page_size (int, default = 10): number of items per page.


        Returns:
            A dictionary containing hypermedia metadata.

        Raises:
            AssertionError: If the requested index is out of range.
        """

        assert (index is None or
                0 <= index < len(self.indexed_dataset())), "Invalid index"

        indexed_dataset = self.indexed_dataset()
        dataset_length = len(indexed_dataset)

        if index is None:
            index = 0

        next_index = min(index + page_size, dataset_length)
        data = [indexed_dataset[i] for i in range(index, next_index)
                if i in indexed_dataset]

        return {
            "index": index,
            "next_index": next_index,
            "page_size": page_size,
            "data": data
        }
