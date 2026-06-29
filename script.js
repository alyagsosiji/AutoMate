// 파이어베이스 설정 정보
const firebaseConfig = {
    databaseURL: "https://automate-rpa-project-default-rtdb.firebaseio.com",
    apiKey: "AIzaSyDZarBHcP_BT2cy3-7_QAd2KBe0ulhsZY0",
    authDomain: "automate-rpa-project.firebaseapp.com",
    projectId: "automate-rpa-project",
    storageBucket: "automate-rpa-project.firebasestorage.app",
    messagingSenderId: "478761538290",
    appId: "1:478761538290:web:3d3f185ae5daa517d2f66b",
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
    document.getElementById('admin-section').classList.add('hidden'); // 어드민 섹션도 숨김 처리에 포함
    
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

// 2. Firebase Auth를 통한 통합 로그인 (일반/마스터 분기)
function login() {
    const email = document.getElementById('login-email').value;
    const pw = document.getElementById('login-pw').value;

    if (!email || !pw) {
        alert("CRITICAL ERROR: CREDENTIALS REQUIRED.");
        return;
    }

    // 파이어베이스 실제 인증 수행
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
                loadAdminData(); // 마스터 접속 시 자동으로 유저 데이터 탭 불러오기
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

// 4. 카테고리 선택 값 리얼타임 데이터베이스에 저장
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

    const userData = {
        email: currentUserEmail,
        categories: selected,
        uipath_status: "pending",
        timestamp: firebase.database.ServerValue.TIMESTAMP
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

// ---------------------------------------------
// 이하 어드민(마스터) 전용 기능 모음
// ---------------------------------------------

// 6. 마스터 - 유저 데이터 불러오기
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

// 7. 마스터 - 유저 데이터 삭제
function deleteUserData(uid) {
    if(confirm("WARNING: DO YOU REALLY WANT TO PURGE THIS RECORD?")) {
        database.ref('users/' + uid).remove().then(() => {
            alert("RECORD PURGED SUCCESSFULLY.");
            loadAdminData();
        });
    }
}

// 8. 마스터 - 탭 전환 함수
function switchAdminTab(tabName) {
    document.getElementById('tab-users').classList.remove('active');
    document.getElementById('tab-logs').classList.remove('active');
    
    document.getElementById('admin-user-list').classList.add('hidden');
    document.getElementById('admin-log-list').classList.add('hidden');

    if (tabName === 'users') {
        document.getElementById('tab-users').classList.add('active');
        document.getElementById('admin-user-list').classList.remove('hidden');
        loadAdminData();
    } else if (tabName === 'logs') {
        document.getElementById('tab-logs').classList.add('active');
        document.getElementById('admin-log-list').classList.remove('hidden');
        loadSystemLogs();
    }
}

// 9. 마스터 - 시스템 로그(기타 데이터) 불러오기
function loadSystemLogs() {
    database.ref('system_logs/').once('value').then((snapshot) => {
        const logs = snapshot.val();
        let html = '<table class="admin-table"><tr><th>TIMESTAMP</th><th>DATA TYPE</th><th>DETAILS</th><th>ACTION</th></tr>';
        
        if (logs) {
            for (let logId in logs) {
                let log = logs[logId];
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

// 10. 마스터 - 시스템 로그 삭제
function deleteLogData(logId) {
    if(confirm("WARNING: DO YOU REALLY WANT TO PURGE THIS LOG RECORD?")) {
        database.ref('system_logs/' + logId).remove().then(() => {
            alert("LOG RECORD PURGED SUCCESSFULLY.");
            loadSystemLogs();
        });
    }
}
