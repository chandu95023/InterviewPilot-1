from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise TypeError("Invalid ObjectId")
        return ObjectId(v)


def serialize_doc(doc: dict) -> dict:
    if not doc:
        return {}
    result = dict(doc)
    result["id"] = str(result.get("_id"))
    result.pop("_id", None)
    result.pop("hashed_password", None)
    if "created_at" in result and isinstance(result["created_at"], datetime):
        result["created_at"] = result["created_at"].isoformat()
    return result
