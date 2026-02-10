from sqlalchemy.exc import OperationalError
from sqlmodel import SQLModel, create_engine, Session
from typing import Generator
from sqlmodel import create_engine
from dotenv import load_dotenv
import os

load_dotenv(override=True)

# Access the values from the 'DATABASE' section
dbHostName = os.environ["dbHostName"]
dbUsername = os.environ["dbUsername"]
dbPassword = os.environ["dbPassword"]
databaseName = os.environ["databaseName"]
port = int(os.environ["dbPort"])


database_url = f'mysql+mysqlconnector://{dbUsername}:{dbPassword}@{dbHostName}:{port}/{databaseName}'
# engine = create_engine(database_url, echo=True)

try:
    engine = create_engine(database_url, echo=True)
    # Test the connection
    with engine.connect():
        print("✅ Database connection successful.")
except OperationalError as e:
    print(f"❌ Database connection failed: {e}")
    engine = None  # Set engine to None if connection fails

# Dependency to get DB session
def get_session() -> Generator:
    if engine is None:
        raise Exception("Database connection failed. Cannot create session.")
    with Session(engine) as session:
        yield session

# Usage in routers
from sqlmodel import Session, select

from database import get_session
@router.get("/states", response_model=List[LocationParentRead], description='Fetch all', status_code=status.HTTP_200_OK)
async def fetch_all(session: Session = Depends(get_session)):
    list = session.exec(select(location_parent)).all()
    return list
