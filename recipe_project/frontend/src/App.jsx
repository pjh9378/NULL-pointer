import React, { useState, useEffect } from "react";
import axios from "axios";

// 백엔드 FastAPI 서버 주소
const API_URL = "http://127.0.0.1:8000";

export default App; // 코드 최하단에 export가 중복되지 않도록 상단 선언

function App() {
  // 화면 전환을 위한 상태 관리 ('main', 'detail', 'admin')
  const [view, setView] = useState("main");
  
  // 데이터 저장용 상태 관리
  const [recipes, setRecipes] = useState([]);
  const [prs, setPrs] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  // 입력 폼 상태 관리
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [currentUser, setCurrentUser] = useState("가맹점A"); // 테스트용 유저 분리

  // 1. 데이터 가져오기 (초기화)
  const fetchData = async () => {
    try {
      const recipeRes = await axios.get(`${API_URL}/recipes`);
      const prRes = await axios.get(`${API_URL}/pull-requests`);
      setRecipes(recipeRes.data);
      setPrs(prRes.data);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view]);

  // 2. [Fork] 본사 레시피 복사 기능
  const handleFork = async (recipeId) => {
    try {
      await axios.post(`${API_URL}/recipes/${recipeId}/fork`, { author: currentUser });
      alert(`${currentUser} 공간으로 성공적으로 Fork 되었습니다!`);
      fetchData();
    } catch (error) {
      alert("Fork 실패");
    }
  };

  // 3. [Commit] 레시피 수정 (새 버전 기록) 기능
  const handleCommit = async () => {
    try {
      const res = await axios.post(`${API_URL}/recipes/commit`, {
        recipe_id: selectedRecipe.id,
        title: editTitle,
        content: editContent,
        author: selectedRecipe.author
      });
      alert("새로운 버전으로 Commit 완료!");
      setSelectedRecipe(res.data.recipe); // 현재 보고 있는 화면도 새 버전으로 갱신
      fetchData();
    } catch (error) {
      alert("Commit 실패");
    }
  };

  // 4. [Pull Request] 본사에 제안 보내기
  const handleCreatePR = async () => {
    // 본사의 해당 레시피 최신 버전을 target으로 잡음 (단순화를 위해 부모 혹은 ID 기반 검색)
    // 여기서는 간단히 1번(본사 원본)을 타겟으로 지정하거나 유연하게 처리
    try {
      await axios.post(`${API_URL}/pull-requests`, {
        requester: currentUser,
        source_recipe_id: selectedRecipe.id,
        target_recipe_id: selectedRecipe.parent_id || 1 
      });
      alert("본사에 수정을 제안(PR)했습니다. 관리자 페이지에서 확인하세요.");
      setView("main");
    } catch (error) {
      alert("PR 제안 실패");
    }
  };

  // 5. [Merge] 본사 관리자의 승인 기능
  const handleMerge = async (prId) => {
    try {
      await axios.post(`${API_URL}/pull-requests/${prId}/merge`);
      alert("제안이 승인되어 본사 공식 레시피로 병합(Merge)되었습니다!");
      fetchData();
    } catch (error) {
      alert("Merge 실패");
    }
  };

  // 6. 테스트용 최초 레시피 생성기 (DB가 비었을 때 사용)
  const handleInitData = async () => {
    try {
      await axios.post(`${API_URL}/recipes/init?title=원조 떡볶이&content=1. 고추장 2스푼\n2. 떡과 오뎅 넣고 끓이기`);
      alert("본사 기본 레시피가 생성되었습니다.");
      fetchData();
    } catch (error) {
      alert("초기화 실패");
    }
  };

  // 상세 페이지 이동 처리
  const openDetail = (recipe) => {
    setSelectedRecipe(recipe);
    setEditTitle(recipe.title);
    setEditContent(recipe.content);
    setView("detail");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* 글로벌 네비게이션 바 */}
      <header className="bg-slate-800 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold cursor-pointer" onClick={() => setView("main")}>
          🧑‍🍳 스마트 레시피 버전 관리 시스템 (Git Kitchen)
        </h1>
        <div className="flex gap-4 items-center">
          <select 
            className="text-black p-1 rounded"
            value={currentUser}
            onChange={(e) => setCurrentUser(e.target.value)}
          >
            <option value="가맹점A">가맹점A 계정</option>
            <option value="가맹점B">가맹점B 계정</option>
          </select>
          <button onClick={() => setView("main")} className="hover:underline">메인 홈</button>
          <button onClick={() => setView("admin")} className="bg-amber-500 px-3 py-1 rounded text-sm font-semibold hover:bg-amber-600">
            👑 본사 관리자 콘솔
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="p-6 max-w-6xl mx-auto">
        {recipes.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center mb-6">
            <p className="mb-4 text-blue-800">데이터베이스가 비어 있습니다. 테스트용 최초 본사 레시피를 만들어보세요!</p>
            <button onClick={handleInitData} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
              최초 본사 레시피(v1) 생성하기
            </button>
          </div>
        )}

        {/* ----------------- [1] 메인 페이지 ----------------- */}
        {view === "main" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 본사 저장소 */}
              <div>
                <h2 className="text-lg font-bold mb-4 text-slate-700 flex items-center gap-2">🏛️ 본사 표준 레시피 (오리지널)</h2>
                <div className="flex flex-col gap-4">
                  {recipes.filter(r => r.is_headquarter).map(recipe => (
                    <div key={recipe.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-slate-800 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">{recipe.title}</h3>
                        <p className="text-sm text-gray-500">공식 버전: v{recipe.version_number}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openDetail(recipe)} className="border border-slate-300 px-3 py-1 rounded text-sm hover:bg-gray-100">보기</button>
                        <button onClick={() => handleFork(recipe.id)} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-indigo-700">
                          Fork (내 공간으로 복사)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 가맹점 작업 공간 */}
              <div>
                <h2 className="text-lg font-bold mb-4 text-slate-700 flex items-center gap-2">🏪 {currentUser} 커스텀 작업 공간</h2>
                <div className="flex flex-col gap-4">
                  {recipes.filter(r => r.author === currentUser).map(recipe => (
                    <div key={recipe.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">{recipe.title}</h3>
                        <p className="text-sm text-gray-500">내 로컬 버전: v{recipe.version_number} (상위 ID: {recipe.parent_id})</p>
                      </div>
                      <button onClick={() => openDetail(recipe)} className="bg-emerald-600 text-white px-4 py-1 rounded text-sm font-medium hover:bg-emerald-700">
                        작업실 입장 (Commit/PR)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- [2] 상세 및 커밋(버전관리) 페이지 ----------------- */}
        {view === "detail" && selectedRecipe && (
          <div className="bg-white p-6 rounded-lg shadow">
            <button onClick={() => setView("main")} className="text-sm text-gray-500 hover:underline mb-4 block">← 돌아가기</button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 왼쪽 에디터 */}
              <div className="md:col-span-2 border-r pr-6">
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-600 mb-1">레시피 이름</label>
                  <input 
                    type="text" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    disabled={selectedRecipe.is_headquarter} // 본사 레시피는 읽기전용
                    className="w-full p-2 border rounded font-medium bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-600 mb-1">조리법 내용</label>
                  <textarea 
                    rows="8"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    disabled={selectedRecipe.is_headquarter}
                    className="w-full p-2 border rounded font-mono text-sm bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                
                {!selectedRecipe.is_headquarter && (
                  <div className="flex gap-2">
                    <button onClick={handleCommit} className="bg-emerald-600 text-white px-4 py-2 rounded font-medium hover:bg-emerald-700">
                      📝 Commit (현재 편집본을 새 버전으로 기록)
                    </button>
                    <button onClick={handleCreatePR} className="bg-indigo-600 text-white px-4 py-2 rounded font-medium hover:bg-indigo-700">
                      🚀 본사에 PR 제안 (Merge 요청)
                    </button>
                  </div>
                )}
              </div>

              {/* 오른쪽 버전 타임라인 (Git History 흉내) */}
              <div>
                <h3 className="font-bold text-lg mb-4 text-slate-700">⏳ 레시피 버전 타임라인</h3>
                <div className="relative border-l-2 border-gray-200 pl-4 ml-2 flex flex-col gap-6">
                  {/* 단순화를 위해 전체 리스트 중 계보나 이름이 매칭되는 이력을 역순 출력 */}
                  {recipes
                    .filter(r => r.title === selectedRecipe.title || r.id === selectedRecipe.id || r.id === selectedRecipe.parent_id)
                    .sort((a,b) => b.version_number - a.version_number)
                    .map((history, idx) => (
                      <div key={history.id} className="relative">
                        {/* 타임라인 점 */}
                        <div className={`absolute -left-[25px] top-1 w-3 h-3 rounded-full ${idx === 0 ? 'bg-emerald-500 scale-125' : 'bg-gray-400'}`}></div>
                        <div className="bg-gray-50 p-3 rounded border text-sm">
                          <div className="font-bold text-gray-700 flex justify-between">
                            <span>버전 v{history.version_number}</span>
                            <span className="text-xs text-gray-400">ID: {history.id}</span>
                          </div>
                          <p className="text-gray-500 text-xs mt-0.5">작성자: {history.author}</p>
                          <p className="text-gray-600 mt-2 font-mono whitespace-pre-line text-xs bg-white p-2 rounded border">
                            {history.content.substring(0, 60)}...
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- [3] 본사 관리자 콘솔 페이지 ----------------- */}
        {view === "admin" && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-slate-800 border-b pb-2">👑 본사 Pull Request (제안 심사) 데스크</h2>
            <div className="flex flex-col gap-4">
              {prs.length === 0 && <p className="text-gray-500 text-center py-8">가맹점에서 도착한 변경 제안(PR)이 없습니다.</p>}
              {prs.map(pr => {
                const sourceRecipe = recipes.find(r => r.id === pr.source_recipe_id);
                return (
                  <div key={pr.id} className="bg-white p-5 rounded-lg shadow border flex justify-between items-center">
                    <div>
                      <div className="flex gap-2 items-center mb-1">
                        <span className="font-bold text-lg text-indigo-700">PR #{pr.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${pr.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                          {pr.status === 'PENDING' ? '대기 중 (Pending)' : '병합 완료 (Approved)'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        🚀 <strong>{pr.requester}</strong>가 수정한 레시피안을 본사 공식 레시피(ID: {pr.target_recipe_id})에 반영해달라고 요청했습니다.
                      </p>
                      {sourceRecipe && (
                        <div className="mt-3 bg-slate-50 p-3 rounded font-mono text-xs border max-w-xl">
                          <p className="font-bold text-gray-500 mb-1">[제안된 내용]</p>
                          {sourceRecipe.content}
                        </div>
                      )}
                    </div>
                    
                    {pr.status === "PENDING" && (
                      <button 
                        onClick={() => handleMerge(pr.id)} 
                        className="bg-amber-500 text-white px-5 py-2 rounded-lg font-bold shadow hover:bg-amber-600 shrink-0"
                      >
                        ✔ 승인 및 공식 반영 (Merge)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}