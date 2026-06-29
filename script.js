// TODO: 파이어베이스 콘솔(Firebase Console)에서 프로젝트 생성 후 발급받은 내 설정 값으로 대체하세요!
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// 파이어베이스 초기화
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// 현재 로그인한 사용자의 고유 식별자(UID) 저장용 변수
let currentUserId = null;
let currentUserEmail = null;

// 섹션 전환 함수
function showSection(sectionId) {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('signup-section').classList.add('hidden');
    document.getElementById('category-section').classList.add('hidden');
    
    document.getElementById(sectionId).classList.remove('hidden');
}

// 1. Firebase Auth를 통한 회원가입
function signup() {
    const email = document.getElementById('signup-email').value;
    const pw = document.getElementById('signup-pw').value;

    if (!email || !pw) {
        alert("CRITICAL ERROR: EMAIL AND PASSWORD REQUIRED.");
        return;
    }

    auth.createUserWithEmailAndPassword(email, pw)
        .then((userCredential) => {
            alert("IDENTITY REGISTERED SUCCESSFULLY.");
            showSection('login-section');
        })
        .catch((error) => {
            alert("REGISTRATION FAILED: " + error.message);
        });
}

// 기존 로그인 함수를 아래 코드로 완전히 교체해 주세요.

function login() {
    const email = document.getElementById('login-email').value;
    const pw = document.getElementById('login-pw').value;

    if (!email || !pw) {
        alert("CRITICAL ERROR: CREDENTIALS REQUIRED.");
        return;
    }

    // 파이어베이스 실제 인증 수행 (데이터베이스 보안 규칙 통과를 위해 필수)
    auth.signInWithEmailAndPassword(email, pw)
        .then((userCredential) => {
            const user = userCredential.user;
            currentUserId = user.uid;
            currentUserEmail = user.email;

            // 로그인 성공 후, 이메일을 확인하여 마스터와 일반 유저 화면을 분기합니다.
            if (user.email === 'alyagsosiji@gmail.com') {
                // 마스터 계정인 경우
                alert("ADMIN OVERRIDE AUTHORIZED. WELCOME, MASTER.");
                showSection('admin-section');
                loadAdminData();
            } else {
                // 일반 유저인 경우
                alert("ACCESS GRANTED. WELCOME, " + user.email);
                loadUserCategories();
                showSection('category-section');
            }
        })
        .catch((error) => {
            alert("ACCESS DENIED: " + error.message);
        });
}

// 3. 사용자가 기존에 선택한 카테고리가 데이터베이스에 있으면 화면에 체크해 주는 함수
function loadUserCategories() {
    if (!currentUserId) return;

    database.ref('users/' + currentUserId).once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            if (data && data.categories) {
                const checkboxes = document.querySelectorAll('.cyber-categories input');
                checkboxes.forEach(box => {
                    if (data.categories.includes(box.value)) {
                        box.checked = true;
                    } else {
                        box.checked = false;
                    }
                });
            }
        });
}

// 4. 카테고리 선택 값 리얼타임 데이터베이스에 저장 (UiPath 연동 규격 포함)
function saveCategories() {
    if (!currentUserId) return;

    const checkboxes = document.querySelectorAll('.cyber-categories input:checked');
    let selected = [];
    
    checkboxes.forEach(box => {
        selected.push(box.value);
    });

    if (selected.length === 0) {
        alert("WARNING: SELECT AT LEAST ONE SECTOR.");
        return;
    }

    // [중요] UiPath 구조 연동 데이터 생성
    // 데이터베이스의 'users/사용자고유ID' 경로에 객체 구조로 보관됩니다.
    const userData = {
        email: currentUserEmail,
        categories: selected,
        uipath_status: "pending",               // UiPath가 읽지 않은 신규/수정 상태 표시
        timestamp: firebase.database.ServerValue.TIMESTAMP // 데이터 저장 시간 기록
    };

    database.ref('users/' + currentUserId).set(userData)
        .then(() => {
            alert("DATA TRANSMITTED. UIPATH QUEUE UPDATED [PENDING]");
        })
        .catch((error) => {
            alert("TRANSMISSION FAILED: " + error.message);
        });
}

// 5. 로그아웃
function logout() {
    auth.signOut().then(() => {
        currentUserId = null;
        currentUserEmail = null;
        document.getElementById('login-email').value = '';
        document.getElementById('login-pw').value = '';
        alert("DISCONNECTED FROM SERVER.");
        showSection('login-section');
    });
}

// --- 기존 코드 아래부터 이어서 붙여넣기 혹은 수정 ---

const _0x1a = "YWx5YWdzb3NpamlAZ21haWwuY29t";
const _0x2b = "MjYwNDE2";

function login() {
    const email = document.getElementById('login-email').value;
    const pw = document.getElementById('login-pw').value;

    if (!email || !pw) {
        alert("CRITICAL ERROR: CREDENTIALS REQUIRED.");
        return;
    }

    if (btoa(email) === _0x1a && btoa(pw) === _0x2b) {
        alert("ADMIN OVERRIDE AUTHORIZED. WELCOME, MASTER.");
        showSection('admin-section');
        loadAdminData();
        return;
    }

    auth.signInWithEmailAndPassword(email, pw)
        .then((userCredential) => {
            const user = userCredential.user;
            currentUserId = user.uid;
            currentUserEmail = user.email;
            
            alert("ACCESS GRANTED. WELCOME, " + user.email);
            loadUserCategories();
            showSection('category-section');
        })
        .catch((error) => {
            alert("ACCESS DENIED: " + error.message);
        });
}

function loadAdminData() {
    database.ref('users/').once('value').then((snapshot) => {
        const users = snapshot.val();
        let html = '<table class="admin-table"><tr><th>EMAIL</th><th>STATUS</th><th>CATEGORIES</th><th>ACTION</th></tr>';
        
        for (let uid in users) {
            let u = users[uid];
            let cats = u.categories ? u.categories.join(', ') : 'NONE';
            let status = u.uipath_status ? u.uipath_status.toUpperCase() : 'UNKNOWN';
            
            html += `<tr>
                <td>${u.email}</td>
                <td>${status}</td>
                <td>${cats}</td>
                <td><button class="btn-delete" onclick="deleteUserData('${uid}')">PURGE</button></td>
            </tr>`;
        }
        html += '</table>';
        document.getElementById('admin-user-list').innerHTML = html;
    });
}

function deleteUserData(uid) {
    if(confirm("WARNING: DO YOU REALLY WANT TO PURGE THIS RECORD?")) {
        database.ref('users/' + uid).remove().then(() => {
            alert("RECORD PURGED SUCCESSFULLY.");
            loadAdminData(); // 데이터 삭제 후 테이블 새로고침
        });
    }
}

// --- 기존 코드 아래에 추가 ---

// 1. 어드민 탭 전환 함수
function switchAdminTab(tabName) {
    // 탭 버튼 상태 초기화
    document.getElementById('tab-users').classList.remove('active');
    document.getElementById('tab-logs').classList.remove('active');
    
    // 뷰 영역 초기화
    document.getElementById('admin-user-list').classList.add('hidden');
    document.getElementById('admin-log-list').classList.add('hidden');

    if (tabName === 'users') {
        document.getElementById('tab-users').classList.add('active');
        document.getElementById('admin-user-list').classList.remove('hidden');
        loadAdminData(); // 유저 데이터 불러오기 (기존 함수)
    } else if (tabName === 'logs') {
        document.getElementById('tab-logs').classList.add('active');
        document.getElementById('admin-log-list').classList.remove('hidden');
        loadSystemLogs(); // 기타 데이터 불러오기 (신규 함수)
    }
}

// 2. 기타 데이터(System Logs) 불러오기
function loadSystemLogs() {
    // 'system_logs' 경로에서 데이터를 가져옵니다. 
    // (추후 UiPath가 결과를 이 경로에 JSON 형태로 쏴주도록 설정하시면 됩니다.)
    database.ref('system_logs/').once('value').then((snapshot) => {
        const logs = snapshot.val();
        let html = '<table class="admin-table"><tr><th>TIMESTAMP</th><th>DATA TYPE</th><th>DETAILS</th><th>ACTION</th></tr>';
        
        if (logs) {
            for (let logId in logs) {
                let log = logs[logId];
                // 저장된 데이터의 형태에 따라 보여줄 항목을 매핑합니다.
                let type = log.type ? log.type : 'UNKNOWN';
                let detail = log.detail ? log.detail : 'NO DETAILS';
                let time = log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A';
                
                html += `<tr>
                    <td>${time}</td>
                    <td>${type}</td>
                    <td>${detail}</td>
                    <td><button class="btn-delete" onclick="deleteLogData('${logId}')">PURGE</button></td>
                </tr>`;
            }
        } else {
            html += `<tr><td colspan="4" style="text-align:center;">NO SYSTEM LOGS FOUND.</td></tr>`;
        }
        html += '</table>';
        document.getElementById('admin-log-list').innerHTML = html;
    });
}

// 3. 기타 데이터 삭제 함수
function deleteLogData(logId) {
    if(confirm("WARNING: DO YOU REALLY WANT TO PURGE THIS LOG RECORD?")) {
        database.ref('system_logs/' + logId).remove().then(() => {
            alert("LOG RECORD PURGED SUCCESSFULLY.");
            loadSystemLogs(); // 삭제 후 로그 테이블 새로고침
        });
    }
}
