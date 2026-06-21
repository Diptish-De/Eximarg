import base64
from typing import BinaryIO

class StorageProvider:
    async def upload_file(self, file_content: bytes, filename: str, mime_type: str) -> str:
        raise NotImplementedError

class Base64StorageProvider(StorageProvider):
    async def upload_file(self, file_content: bytes, filename: str, mime_type: str) -> str:
        # Convert bytes to base64 data URL
        encoded = base64.b64encode(file_content).decode("utf-8")
        return f"data:{mime_type};base64,{encoded}"

def get_storage_provider() -> StorageProvider:
    # MVP: returns base64 storage provider
    return Base64StorageProvider()
