
import sys
import tkinter as tk

from dcinside.downloader import Downloader


title = '흔한 찐따의 디시콘 다운로더'
icon = 'icon.ico'


if __name__ == '__main__':
    root = tk.Tk()
    downloader = Downloader(root, title=title, icon=icon)
    downloader.mainloop()

    sys.exit(0)
