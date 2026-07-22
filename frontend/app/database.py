from .core.config import settings
import logging
from typing import Any, Dict, List
import asyncio
import uuid

logger = logging.getLogger(__name__)


class AsyncInMemoryCursor:
	def __init__(self, items: List[Dict[str, Any]]):
		self._items = list(items)

	def sort(self, key, direction=-1):
		reverse = direction == -1
		self._items.sort(key=lambda d: d.get(key, None), reverse=reverse)
		return self

	async def to_list(self, length: int = None):
		return list(self._items) if length is None else list(self._items)[:length]

	def __aiter__(self):
		self._iter = iter(self._items)
		return self

	async def __anext__(self):
		try:
			return next(self._iter)
		except StopIteration:
			raise StopAsyncIteration


class AsyncInMemoryCollection:
	def __init__(self):
		self._docs: List[Dict[str, Any]] = []

	async def find_one(self, filter: Dict[str, Any]):
		for d in self._docs:
			match = True
			for k, v in filter.items():
				if d.get(k) != v:
					match = False
					break
			if match:
				return d
		return None

	async def insert_one(self, doc: Dict[str, Any]):
		doc = dict(doc)
		doc.setdefault("_id", str(uuid.uuid4()))
		self._docs.append(doc)

		class Result:
			def __init__(self, inserted_id):
				self.inserted_id = inserted_id

		return Result(doc["_id"])

	def find(self, filter: Dict[str, Any] = None):
		if not filter:
			items = list(self._docs)
		else:
			items = []
			for d in self._docs:
				match = True
				for k, v in filter.items():
					if d.get(k) != v:
						match = False
						break
				if match:
					items.append(d)
		return AsyncInMemoryCursor(items)

	async def update_one(self, filter: Dict[str, Any], update: Dict[str, Any]):
		doc = await self.find_one(filter)
		if not doc:
			class Res:
				matched_count = 0
				modified_count = 0

			return Res()
		# support $set and $push minimally
		if "$set" in update:
			for k, v in update["$set"].items():
				doc[k] = v
		if "$push" in update:
			for k, v in update["$push"].items():
				if k not in doc:
					doc[k] = []
				doc[k].append(v)

		class Res2:
			matched_count = 1
			modified_count = 1

		return Res2()

	async def count_documents(self, filter: Dict[str, Any] = None):
		if not filter:
			return len(self._docs)
		cnt = 0
		for d in self._docs:
			match = True
			for k, v in filter.items():
				if d.get(k) != v:
					match = False
					break
			if match:
				cnt += 1
		return cnt

	def aggregate(self, pipeline: List[Dict[str, Any]]):
		# very small subset for average grouping used by dashboard
		# apply simple $match then $group with $avg
		items = list(self._docs)
		for stage in pipeline:
			if "$match" in stage:
				mf = stage["$match"]
				filtered = []
				for d in items:
					ok = True
					for k, v in mf.items():
						if d.get(k) != v:
							ok = False
							break
					if ok:
						filtered.append(d)
				items = filtered
			elif "$group" in stage:
				group = stage["$group"]
				# support only average of a field
				avg_spec = None
				for k, v in group.items():
					if isinstance(v, dict) and "$avg" in v:
						avg_spec = v["$avg"]
				avg_field = avg_spec.lstrip("$") if avg_spec else None
				values = [d.get(avg_field, 0) for d in items]
				avg = sum(values) / len(values) if values else 0
				return AsyncInMemoryCursor([{"average": avg}])
		return AsyncInMemoryCursor(items)

	async def distinct(self, field: str, filter: Dict[str, Any] = None):
		# filter all docs by the given filter, then return distinct values of field
		if filter is None:
			lst = list(self._docs)
		else:
			lst = []
			for d in self._docs:
				match = True
				for k, v in filter.items():
					if d.get(k) != v:
						match = False
						break
				if match:
					lst.append(d)
		return list({d.get(field) for d in lst if field in d})


# For development without MongoDB installed, use in-memory async collections.
logger.warning("Using in-memory database fallback for development (no MongoDB).")
users_collection = AsyncInMemoryCollection()
questions_collection = AsyncInMemoryCollection()
interviews_collection = AsyncInMemoryCollection()
resume_collection = AsyncInMemoryCollection()
coding_challenges_collection = AsyncInMemoryCollection()
scores_collection = AsyncInMemoryCollection()
feedback_collection = AsyncInMemoryCollection()
assistant_collection = AsyncInMemoryCollection()

