## app/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.declarative import declarative_base
from contextlib import contextmanager
from app.config import Config  # Import Config จาก utils/config.py

Base = declarative_base()

class DbConnect:
    """Manage database connection."""
    def __init__(self):
        self.engine = create_engine(Config.FULL_DATABASE_URL)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

    @contextmanager
    def get_session(self):
        """Generate a database session."""
        session = self.SessionLocal()
        try:
            yield session
        finally:
            session.close()

    def test_connection(self):
        """Test database connection."""
        try:
            with self.engine.connect():
                return "Database connection successful."
        except SQLAlchemyError as e:
            return f"Database connection failed: {e}"
