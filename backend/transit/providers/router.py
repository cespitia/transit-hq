import os
from dotenv import load_dotenv

load_dotenv()

PROVIDER = os.getenv("DATA_PROVIDER", "mock").strip().lower()


def get_provider():
    if PROVIDER == "mts":
        from . import mts
        return mts
    from . import mock
    return mock
