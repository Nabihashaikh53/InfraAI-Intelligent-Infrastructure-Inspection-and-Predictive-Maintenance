import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

uri = os.getenv("MONGODB_URI")

if not uri:
    print("❌ MONGODB_URI not found in .env")
    exit()

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)

    # Test the connection
    client.admin.command("ping")

    print("✅ MongoDB Atlas connection successful!")

except Exception as e:
    print("❌ MongoDB connection failed:")
    print(e)