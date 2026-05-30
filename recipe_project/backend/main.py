from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import List, Optional

# ** 데이터베이스 설정 및 연결 **
DATABASE_URL = "sqlite:///./recipes.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ** 데이터베이스 모델 정의 **

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(50), nullable=False)  # '본사', '가맹점A' 등
    version_number = Column(Integer, default=1)
    is_headquarter = Column(Boolean, default=True)
    
    # 셀프 참조 (이전 버전이나 원본 레시피 가리킴)
    parent_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)


class PullRequest(Base):
    __tablename__ = "pull_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    requester = Column(String(50), nullable=False)
    source_recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    target_recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    status = Column(String(20), default="PENDING")  # PENDING, APPROVED, REJECTED


# 테이블 생성
Base.metadata.create_all(bind=engine)

# FastAPI 앱 초기화
app = FastAPI(title="Recipe Git System API")

# 프런트엔드(React) 연동을 위한 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 3일 프로젝트용 전면 개방
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ** DB 세션 의존성 주입 **
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ** Pydantic 요청 스키마 정의 **
class CommitRequest(BaseModel):
    recipe_id: int  # 수정 대상 레시피 ID
    title: str
    content: str
    author: str

class ForkRequest(BaseModel):
    author: str  # 복사해가는 가맹점 이름

class PRRequest(BaseModel):
    requester: str
    source_recipe_id: int
    target_recipe_id: int


# ==========================================
# ** 핵심 API 라우터 구현 **
# ==========================================

# 0. 초기 본사 레시피 생성 API (테스트용 생성기)
@app.post("/recipes/init")
def create_initial_recipe(title: str, content: str, db: Session = Depends(get_db)):
    init_recipe = Recipe(
        title=title,
        content=content,
        author="본사",
        version_number=1,
        is_headquarter=True,
        parent_id=None
    )
    db.add(init_recipe)
    db.commit()
    db.refresh(init_recipe)
    return {"message": "최초 본사 레시피 생성 완료", "recipe": init_recipe}


# 1. [Commit] 레시피 수정 및 버전 기록 API
@app.post("/recipes/commit")
def commit_recipe(req: CommitRequest, db: Session = Depends(get_db)):
    # 기존 레시피 찾기
    parent_recipe = db.query(Recipe).filter(Recipe.id == req.recipe_id).first()
    if not parent_recipe:
        raise HTTPException(status_code=404, detail="기존 레시피를 찾을 수 없습니다.")
    
    # 새 버전 레코드 생성 (INSERT)
    new_version = Recipe(
        title=req.title,
        content=req.content,
        author=req.author,
        version_number=parent_recipe.version_number + 1,  # 버전 1 증가
        is_headquarter=parent_recipe.is_headquarter,      # 본사 여부 유지
        parent_id=parent_recipe.id                        # 이전 버전 연결
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)
    return {"message": f"버전 {new_version.version_number} 커밋 완료", "recipe": new_version}


# 2. [Fork / Branch] 레시피 복사 API
@app.post("/recipes/{recipe_id}/fork")
def fork_recipe(recipe_id: int, req: ForkRequest, db: Session = Depends(get_db)):
    # 원본 레시피 가져오기
    origin_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not origin_recipe:
        raise HTTPException(status_code=404, detail="원본 레시피를 찾을 수 없습니다.")
    
    # 가맹점용 레시피로 독립 복사 (INSERT)
    forked_recipe = Recipe(
        title=f"[{req.author}] {origin_recipe.title}",
        content=origin_recipe.content,
        author=req.author,
        version_number=1,            # 가맹점만의 버전 1 시작
        is_headquarter=False,         # 본사 레시피가 아님
        parent_id=origin_recipe.id    # 원본 출처 남기기
    )
    db.add(forked_recipe)
    db.commit()
    db.refresh(forked_recipe)
    return {"message": f"{req.author} 공간으로 Fork 완료", "recipe": forked_recipe}


# 3. [Pull Request] 협업 제안 제출 API
@app.post("/pull-requests")
def create_pull_request(req: PRRequest, db: Session = Depends(get_db)):
    # 제안 요청서 테이블에 PENDING 상태로 추가
    new_pr = PullRequest(
        requester=req.requester,
        source_recipe_id=req.source_recipe_id,
        target_recipe_id=req.target_recipe_id,
        status="PENDING"
    )
    db.add(new_pr)
    db.commit()
    db.refresh(new_pr)
    return {"message": "본사에 레시피 변경 제안(PR) 완료", "pull_request": new_pr}


# 4. [Merge] 제안 승인 및 본사 반영 API (통째로 덮어쓰기)
@app.post("/pull-requests/{pr_id}/merge")
def merge_pull_request(pr_id: int, db: Session = Depends(get_db)):
    # PR 요청 찾기
    pr = db.query(PullRequest).filter(PullRequest.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="요청(PR)을 찾을 수 없습니다.")
    if pr.status != "PENDING":
        raise HTTPException(status_code=400, detail="이미 처리된 요청입니다.")
    
    # 가맹점이 수정한 레시피와 본사의 최신 레시피 가져오기
    source = db.query(Recipe).filter(Recipe.id == pr.source_recipe_id).first()
    target = db.query(Recipe).filter(Recipe.id == pr.target_recipe_id).first()
    
    # PR 상태 변경
    pr.status = "APPROVED"
    
    # 본사 명의의 새 버전 레시피 생성 (가맹점 안으로 통째로 덮어쓰기 Merge)
    merged_recipe = Recipe(
        title=target.title,
        content=source.content,       # 가맹점의 수정 내용을 본사에 주입
        author="본사",
        version_number=target.version_number + 1,
        is_headquarter=True,
        parent_id=target.id           # 본사 이전 최신 버전 뒤로 연결
    )
    
    db.add(merged_recipe)
    db.commit()
    db.refresh(merged_recipe)
    return {"message": "본사 레시피에 성공적으로 병합(Merge)되었습니다.", "merged_recipe": merged_recipe}


# 5. 레시피 목록 및 단건 조회 (프런트엔드 화면 출력용)
@app.get("/recipes")
def get_all_recipes(db: Session = Depends(get_db)):
    return db.query(Recipe).all()

@app.get("/pull-requests")
def get_all_prs(db: Session = Depends(get_db)):
    return db.query(PullRequest).all()