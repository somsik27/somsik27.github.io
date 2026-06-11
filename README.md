# 모바일 청첩장

Vite + React + TypeScript로 만든 GitHub Pages용 정적 모바일 청첩장입니다.

## 실행

```bash
npm install
npm run dev
```

## 내용 수정

모든 문구, 날짜, 장소, 지도 링크, 이미지 경로, 영상 URL, 사진 업로드 설정은 `src/data/invitation.ts`에서 수정합니다.

- 대표 사진: `public/images/cover-sample.jpg` 교체
- 갤러리 사진: `public/images/gallery`에 WebP 또는 JPEG 추가 후 `gallery` 배열 수정
- 영상: YouTube 일부공개 URL 또는 embed URL을 `film.videoUrl`에 입력
- 셔틀 안내: `transportation.shuttle`이 `null`이면 숨겨집니다.

## 카카오톡 공유 버튼

카카오톡 공유 카드에 `청첩장 보기`, `위치 보기` 버튼을 표시하려면 Kakao Developers에서 JavaScript 키를 발급하고 GitHub repository variable 또는 secret에 `VITE_KAKAO_JAVASCRIPT_KEY`로 저장합니다. 앱 설정의 Web 플랫폼 사이트 도메인에는 `https://somsik27.github.io`를 등록해야 합니다.

## GitHub Pages

`.github/workflows/deploy-pages.yml`이 `main` 또는 `master` 브랜치 push 시 `dist`를 GitHub Pages로 배포합니다. 저장소의 Pages 설정에서 배포 소스를 GitHub Actions로 선택해 주세요.

## 방명록과 사진 공유

`photoUpload.enabled: true`이면 방명록과 사진 공유 폼이 표시됩니다. 실제 저장을 열려면:

1. `apps-script/photo-upload.gs`를 Google Apps Script Web App으로 배포합니다.
2. Apps Script properties에 `SHEET_ID`를 설정합니다.
3. 사진 공유까지 열려면 `DRIVE_FOLDER_ID`도 설정합니다.
4. 필요하면 `SHEET_NAME`, `GUESTBOOK_SHEET_NAME`, `MAX_FILES`, `MAX_FILE_SIZE_MB`, `MAX_MESSAGE_LENGTH`, `ALLOWED_MIME_TYPES`도 설정합니다.
5. 배포된 Web App URL을 `photoUpload.endpointUrl`에 넣고 `enabled`를 `true`로 바꿉니다.

업로드된 사진은 기본적으로 Drive 폴더 안에 비공개로 저장됩니다. 직접 고른 사진만 `public/images/gallery`에 추가하고 `src/data/invitation.ts`의 `gallery` 배열에 넣어 공유하세요. Apps Script property `SHARE_UPLOADED_FILES`를 `true`로 설정하면 업로드 파일을 링크 공유로 만들 수 있지만, 기본값은 공유하지 않는 상태입니다.
