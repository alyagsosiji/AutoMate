// 특정 화면(섹션)만 보여주는 함수
function showSection(sectionId) {
    // 모든 섹션을 숨김
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('signup-section').classList.add('hidden');
    document.getElementById('category-section').classList.add('hidden');
    
    // 요청한 섹션만 보여줌
    document.getElementById(sectionId).classList.remove('hidden');
}

// 회원가입 함수
function signup() {
    const id = document.getElementById('signup-id').value;
    const pw = document.getElementById('signup-pw').value;

    if (id === '' || pw === '') {
        alert('아이디와 비밀번호를 모두 입력해주세요!');
        return;
    }

    // 로컬 스토리지에 아이디와 비밀번호 저장
    localStorage.setItem('userId', id);
    localStorage.setItem('userPw', pw);
    
    alert('회원가입이 완료되었습니다! 로그인해 주세요.');
    showSection('login-section');
}

// 로그인 함수
function login() {
    const id = document.getElementById('login-id').value;
    const pw = document.getElementById('login-pw').value;

    // 저장된 정보 불러오기
    const savedId = localStorage.getItem('userId');
    const savedPw = localStorage.getItem('userPw');

    if (id === savedId && pw === savedPw) {
        alert('로그인 성공!');
        showSection('category-section');
    } else {
        alert('아이디 또는 비밀번호가 틀렸습니다.');
    }
}

// 카테고리 저장 함수
function saveCategories() {
    // 체크된 체크박스들을 모두 찾음
    const checkboxes = document.querySelectorAll('.categories input:checked');
    let selected = [];
    
    checkboxes.forEach(function(box) {
        selected.push(box.value);
    });

    if (selected.length === 0) {
        alert('최소 1개의 카테고리를 선택해 주세요.');
        return;
    }

    // 선택된 카테고리를 문자열로 변환하여 로컬 스토리지에 저장
    localStorage.setItem('userCategories', JSON.stringify(selected));
    alert('다음 카테고리가 저장되었습니다: ' + selected.join(', '));
}

// 로그아웃 함수
function logout() {
    // 입력창 초기화
    document.getElementById('login-id').value = '';
    document.getElementById('login-pw').value = '';
    alert('로그아웃 되었습니다.');
    showSection('login-section');
}
