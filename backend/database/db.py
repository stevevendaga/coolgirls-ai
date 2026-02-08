from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

# Database setup (adjust connection string as needed)
DATABASE_URL = "sqlite:///./coolgirls_ai.db"  # Use your actual database URL
engine = create_engine(DATABASE_URL)
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Document model
class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    categoryId = Column(String, index=True)
    fileName = Column(String)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Category model
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    """
    Dependency to get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Insert default categories if they don't exist
def initialize_categories():
    db = SessionLocal()
    try:
        # Check if categories already exist to avoid duplicates
        existing_count = db.query(Category).count()
        if existing_count == 0:
            categories_to_add = [
                Category(name='Cool Girls'),
                Category(name='SOP'),
                Category(name='Job Aids'),
                Category(name='Radio'),
                Category(name='Topics')
            ]
            for category in categories_to_add:
                db.add(category)
            db.commit()
    except Exception as e:
        print(f"Error inserting default categories: {e}")
        db.rollback()
    finally:
        db.close()

# Initialize categories when the module is loaded
initialize_categories()