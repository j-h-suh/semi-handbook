# Vercel 배포 가이드 (Vercel Deployment Guide)

이 문서는 `semi-handbook` Next.js 애플리케이션을 인터넷에 무료로 호스팅(배포)하는 방법을 안내합니다. Vercel은 Next.js를 만든 회사가 제공하는 플랫폼으로, 단 세 번의 클릭만으로 전 세계 어디서든 접속 가능한 웹사이트를 만들 수 있습니다.

## 배포 전 필수 준비: 코드를 GitHub에 올리기

Vercel은 사용자의 GitHub 리포지토리를 참조하여 자동으로 사이트를 빌드하고 배포합니다. 

1. **GitHub 계정 생성 및 로그인**: 아직 계정이 없다면 [github.com](https://github.com) 에서 생성하세요.
2. **새 리포지토리(Repository) 생성**: 
   - GitHub 우측 상단의 `+` 버튼을 누르고 `New repository`를 선택합니다.
   - 이름 (예: `semi-handbook-web`)을 입력하고 `Create repository`를 클릭합니다.
3. **로컬 코드를 GitHub로 밀어넣기(Push)**:
   - 현재 작업 중인 터미널(VS Code 내장 터미널 등)을 엽니다.
   - 작업 폴더 경로(`.../Projects/semi-handbook`)인지 확인 후, 다음 명령어들을 차례로 입력합니다.

```bash
git init
git add .
git commit -m "Initial commit: Semi-Handbook Next.js App"
git remote add origin https://github.com/당신의_아이디/semi-handbook-web.git  # 이곳을 리포지토리 주소로 변경
git branch -M main
git push -u origin main
```

*(위 명령어가 성공적으로 실행되었다면, GitHub 리포지토리 페이지 새로고침 시 모든 파일이 업로드된 것을 볼 수 있습니다.)*

---

## Vercel에 배포(Deploy) 하기

GitHub에 코드가 올라갔다면, 배포 과정은 1분이면 끝납니다.

1. **Vercel 가입**: [vercel.com](https://vercel.com) 로 이동하여, **[Continue with GitHub]**를 클릭해 로그인합니다. (GitHub 계정 연동 필수)
2. **새 프로젝트 만들기**:
   - Vercel 대시보드 화면 우측 상단의 **[Add New...] -> [Project]** 버튼을 클릭합니다.
3. **GitHub 리포지토리 선택 (Import)**:
   - "Import Git Repository" 목록에 방금 올린 `semi-handbook-web` 리포지토리가 보일 것입니다.
   - 혹시 보이지 않는다면 "Adjust GitHub App Permissions" 글씨를 눌러 해당 리포지토리 접근 권한을 허용해주세요.
   - 리포지토리 우측의 **[Import]** 버튼을 누릅니다.
4. **빌드 설정 및 배포 (Deploy)**:
   - `Configure Project` 화면이 나옵니다.
   - "Framework Preset"이 **Next.js** 로 자동 선택되어 있을 것입니다. 
   - 아무 수정 없이 화면 맨 아래에 있는 파란색 **[Deploy]** 버튼을 클릭합니다.
5. **축하합니다! 완료를 기다립니다.**:
   - 불꽃놀이 애니메이션이 터지면 배포가 성공한 것입니다. 🎉
   - 자동 생성된 무료 주소 (예: `https://semi-handbook-web.vercel.app`)를 클릭하시면 인터넷 밖에서도 제이님의 핸드북에 접속할 수 있습니다.

---

## 🔮 꿀팁: 지속적 배포 (Continuous Deployment)

이제 Vercel과 GitHub가 완벽하게 연결되었습니다. 앞으로 마크다운 챕터 내용(`.md`)을 수정하거나 디자인 코드를 개선했다면, 터미널에서 다음 세 줄만 치시면 됩니다:

```bash
git add .
git commit -m "내용 수정됨"
git push
```

그럼 Vercel이 알아서 여러분이 깃허브에 올린 최신 패치를 감지하고, **자동으로 사이트를 최신 버전으로 새로고침(Re-build) 해줍니다.** 서버를 직접 내렸다 올리거나, 설정 파일을 건드릴 필요가 전혀 없습니다!
