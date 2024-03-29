# 흔한 찐따의 디시콘 다운로더 (DC-CON Downloader)

- 흔한 찐따의 **디시콘 다운로더(DC-CON Downloader)** 입니다.
- 해당 프로젝트는 [흔한 찐따의 파이썬 튜토리얼](https://github.com/iam-jjintta/python-tutorial/tree/main/projects/dccon-downloader) 저장소를 통해 확인하실 수도 있습니다.

## 개요

- [디시인사이드(Dcinside)](https://www.dcinside.com/)에서 제공되는 [디시콘(dccon)](https://dccon.dcinside.com/)을 검색하고 다운로드 할 수 있는 간단한 GUI 프로그램입니다.
- 그동안 제가 독학했던 웹 기술에 대한 내용들을 토대로 해당 프로그램의 테스트 버전을 제작하였습니다.
- 프로그램 제작 당시에 제가 쓰레드에 대한 공부를 하기 전이라서 쓰레드를 이용한 병렬 처리는 구현하지 않았습니다.

## 사용한 라이브러리

제가 사용한 라이브러리는 아래와 같습니다.

### 파이썬 표준 라이브러리

- [tkinter — Tcl/Tk 파이썬 인터페이스](https://docs.python.org/ko/3/library/tkinter.html)
- [tkinter.ttk — Tk 테마 위젯](https://docs.python.org/ko/3/library/tkinter.ttk.html)
- [sys — 시스템 특정 파라미터와 함수](https://docs.python.org/ko/3/library/sys.html)
- [os — 기타 운영 체제 인터페이스](https://docs.python.org/ko/3/library/os.html)
- [io — 스트림 작업을 위한 핵심 도구](https://docs.python.org/ko/3/library/io.html)
- [re — 정규식 연산](https://docs.python.org/ko/3/library/re.html)
- [webbrowser — 편리한 웹 브라우저 컨트롤러](https://docs.python.org/ko/3/library/webbrowser.html)

### [PyPI](https://pypi.org/) 오픈 소스 라이브러리

- [Pillow — 광범위한 파일 형식 지원과 효율적인 내부 표현 및 강력한 이미지 처리](https://pillow.readthedocs.io/en/stable/)
- [requests — 파이썬용 HTTP 클라이언트 인터페이스를 위한 고수준 라이브러리](https://requests.readthedocs.io/en/latest/)
- [lxml — XML 및 HTML 문서의 빠른 처리를 위한 라이브러리](https://lxml.de/)
- [PyInstaller — 파이썬 애플리케이션과 모든 종속성 패키지들을 단일 패키지로 묶어주는 라이브러리](https://pyinstaller.org/en/stable/)

## 실행 결과

![dccon-downloader](https://raw.githubusercontent.com/iamjjintta-python/dccon-downloader/main/images/3.PNG)
