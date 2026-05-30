from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()


# 데이터베이스 모델 정의
class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(50), nullable=False) # '본사', '가맹점A' 등
    version_number = Column(Integer, default=1)
    is_headquarter = Column(Boolean, default=True)


    # 셀프 참조 (이전 버거나 원본 레시피 가리킴)
    parent_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)


# Pull Request 모델 정의
class PullRequest(Base):
    __tablename__ = "pull_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    requester = Column(String(50), nullable=False)
    source_recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    target_recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    status = Column(String(20), default="PENDING") # PENDING, APPROVED, REJECTED